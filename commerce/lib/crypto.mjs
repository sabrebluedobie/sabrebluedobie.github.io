const enc = new TextEncoder();
export async function hmac(secret, text) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(text))), byte => byte.toString(16).padStart(2, '0')).join('');
}
export function constantEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
// Raw body, bounded age and multiple v1 signatures (rotation). No JSON parsing before verification.
// Production adapter must use the pinned official Stripe SDK's constructEventAsync instead.
export async function verifySyntheticSignature(raw, header, secret, now) {
  if (!header || raw.length > 65536) throw new Error('INVALID_SIGNATURE');
  const parts = header.split(',').map(x => x.split('='));
  const times = parts.filter(([k]) => k === 't');
  if (times.length !== 1 || !/^\d+$/.test(times[0][1])) throw new Error('INVALID_SIGNATURE');
  const timestamp = Number(times[0][1]);
  if (Math.abs(now / 1000 - timestamp) > 300) throw new Error('STALE_SIGNATURE');
  const digest = await hmac(secret, `${timestamp}.${raw}`);
  if (!parts.some(([k, v]) => k === 'v1' && constantEqual(v, digest))) throw new Error('INVALID_SIGNATURE');
  return JSON.parse(raw);
}
