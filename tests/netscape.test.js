import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toNetscape, HEADER } from '../src/netscape.js';

const base = {
  name: 'sessionid',
  value: 'abc',
  domain: '.instagram.com',
  path: '/',
  secure: true,
  hostOnly: false,
  session: false,
  expirationDate: 1790000000.75,
};

test('starts with the Netscape header', () => {
  assert.ok(toNetscape([]).startsWith(HEADER));
});

test('formats a domain cookie as 7 tab-separated fields', () => {
  const line = toNetscape([base]).trim().split('\n').at(-1);
  assert.equal(line, '.instagram.com\tTRUE\t/\tTRUE\t1790000000\tsessionid\tabc');
});

test('host-only cookie gets FALSE subdomain flag and no leading dot', () => {
  const line = toNetscape([{ ...base, domain: 'www.example.com', hostOnly: true, secure: false }])
    .trim().split('\n').at(-1);
  assert.equal(line, 'www.example.com\tFALSE\t/\tFALSE\t1790000000\tsessionid\tabc');
});

test('session cookie gets expiry 0', () => {
  const line = toNetscape([{ ...base, session: true, expirationDate: undefined }])
    .trim().split('\n').at(-1);
  assert.equal(line.split('\t')[4], '0');
});

test('does not emit #HttpOnly_ prefix (older parsers treat it as a comment)', () => {
  const out = toNetscape([{ ...base, httpOnly: true }]);
  assert.ok(!out.includes('#HttpOnly_'));
});

test('strips tabs and newlines from values so lines cannot break', () => {
  const line = toNetscape([{ ...base, value: 'a\tb\nc' }]).trim().split('\n').at(-1);
  assert.equal(line.split('\t').length, 7);
  assert.equal(line.split('\t')[6], 'abc');
});

test('rejects non-array input', () => {
  assert.throws(() => toNetscape(null), TypeError);
});
