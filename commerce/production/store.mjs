// D1 batch is transactional. No read/modify/write counters or process-local locks.
export class D1Store {
  constructor(db) { this.db = db.withSession ? db.withSession('first-primary') : db; }
  stmt(sql, ...args) { return this.db.prepare(sql).bind(...args); }
  checkoutGet(id) { return this.stmt('SELECT * FROM workbook_checkouts WHERE id=?',id).first(); }
  checkoutClaim(id,hash,now) {
    // Global circuit breaker, not a per-person tracking identifier. No IP stored.
    return this.stmt(`INSERT OR IGNORE INTO workbook_checkouts(id,config_hash,created,state)
      SELECT ?,?,?,'creating' WHERE (SELECT COUNT(*) FROM workbook_checkouts WHERE created>?)<20
      RETURNING id`,id,hash,now,now-60000).first();
  }
  async checkoutReady(id,url,expires) {
    const saved=await this.stmt("UPDATE workbook_checkouts SET state='ready',url=?,expires=? WHERE id=? AND state='creating' RETURNING id",url,expires,id).first();
    if(!saved)throw Error('CHECKOUT_REVIEW_REQUIRED');
  }
  async checkoutReview(id) { await this.stmt("UPDATE workbook_checkouts SET state='review' WHERE id=? AND state='creating'",id).run(); }
  async enqueue(event, order, now) {
    await this.db.batch([
      this.stmt('INSERT OR IGNORE INTO workbook_events VALUES (?,?,?)', event.id, event.type, now),
      this.stmt(`INSERT OR IGNORE INTO workbook_orders(id,payment,recipient,config_hash,token_hash,expires,max_downloads,created)
        SELECT ?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM workbook_blocks WHERE payment=?)`,
        order.id,order.payment,order.recipient,order.config_hash,order.token_hash,order.expires,order.max_downloads,now,order.payment)
    ]);
  }
  async block(payment, now, event) {
    const statements = [this.stmt('INSERT OR IGNORE INTO workbook_blocks VALUES (?,?)', payment, now)];
    if(event) statements.push(this.stmt('INSERT OR IGNORE INTO workbook_events VALUES (?,?,?)',event.id,event.type,now));
    await this.db.batch(statements);
  }
  get(id) { return this.stmt(`SELECT o.*, b.state,b.attempts,b.claim,b.started,b.provider_id,
    EXISTS(SELECT 1 FROM workbook_blocks WHERE payment=o.payment) AS blocked
    FROM workbook_orders o JOIN workbook_outbox b ON b.order_id=o.id WHERE o.id=?`,id).first(); }
  byToken(hash) { return this.stmt('SELECT id FROM workbook_orders WHERE token_hash=?',hash).first(); }
  async pending(now) { return (await this.stmt("SELECT order_id FROM workbook_outbox WHERE state='pending' AND next_attempt<=? ORDER BY next_attempt,rowid LIMIT 20",now).all()).results; }
  async defer(id, until) { await this.stmt("UPDATE workbook_outbox SET next_attempt=? WHERE order_id=? AND state='pending'",until,id).run(); }
  async park(id) { await this.stmt("UPDATE workbook_outbox SET state='review' WHERE order_id=? AND state='pending'",id).run(); }
  async recover(now) { await this.stmt("UPDATE workbook_outbox SET state='review' WHERE state='sending' AND started<=?",now-60000).run(); }
  async claim(id, claim, now) {
    return this.stmt(`UPDATE workbook_outbox SET state='sending',attempts=1,claim=?,started=?
      WHERE order_id=? AND state='pending' AND attempts=0 AND EXISTS
      (SELECT 1 FROM workbook_orders o WHERE o.id=order_id AND o.expires>? AND NOT EXISTS
       (SELECT 1 FROM workbook_blocks WHERE payment=o.payment)) RETURNING order_id`,claim,now,id,now).first();
  }
  async authorizeSend(id,claim,now) {
    return this.stmt(`UPDATE workbook_outbox SET claim=claim WHERE order_id=? AND claim=?
      AND state='sending' AND started>? AND EXISTS
      (SELECT 1 FROM workbook_orders o WHERE o.id=order_id AND o.expires>? AND NOT EXISTS
      (SELECT 1 FROM workbook_blocks WHERE payment=o.payment)) RETURNING order_id`,id,claim,now-60000,now).first();
  }
  async finish(id,claim,state,provider,now) {
    await this.stmt(`UPDATE workbook_outbox SET state=?,provider_id=?,accepted=?
      WHERE order_id=? AND claim=? AND state='sending'`,state,provider,state==='accepted'?now:null,id,claim).run();
  }
  async consume(id, now) {
    return this.stmt(`UPDATE workbook_orders SET downloads=downloads+1 WHERE id=? AND expires>?
      AND downloads<max_downloads AND NOT EXISTS (SELECT 1 FROM workbook_blocks WHERE payment=workbook_orders.payment)
      RETURNING downloads`,id,now).first();
  }
}
