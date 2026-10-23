-- Apply only to a separately approved workbook D1 database. Never the free-guide store.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS workbook_events (id TEXT PRIMARY KEY, kind TEXT NOT NULL, received INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS workbook_blocks (payment TEXT PRIMARY KEY, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS workbook_orders (
 id TEXT PRIMARY KEY, payment TEXT NOT NULL UNIQUE, recipient TEXT NOT NULL,
 config_hash TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE,
 expires INTEGER NOT NULL, max_downloads INTEGER NOT NULL CHECK(max_downloads > 0),
 downloads INTEGER NOT NULL DEFAULT 0 CHECK(downloads >= 0), created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS workbook_outbox (
 order_id TEXT PRIMARY KEY REFERENCES workbook_orders(id),
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','accepted','review')),
 attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 1),
 claim TEXT, started INTEGER, provider_id TEXT, accepted INTEGER,
 next_attempt INTEGER NOT NULL DEFAULT 0
);
CREATE TRIGGER IF NOT EXISTS workbook_enqueue AFTER INSERT ON workbook_orders
 BEGIN INSERT INTO workbook_outbox(order_id) VALUES (NEW.id); END;
CREATE INDEX IF NOT EXISTS workbook_pending ON workbook_outbox(state, next_attempt);
CREATE TABLE IF NOT EXISTS workbook_checkouts (
 id TEXT PRIMARY KEY, config_hash TEXT NOT NULL, created INTEGER NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('creating','ready','review')),
 url TEXT, expires INTEGER
);
CREATE INDEX IF NOT EXISTS workbook_checkout_created ON workbook_checkouts(created);
