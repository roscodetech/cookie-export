import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scopeCandidates, defaultScope, scopePermission } from '../src/domains.js';

test('candidates run from the full host down to two labels', () => {
  assert.deepEqual(scopeCandidates('a.b.example.com'), ['a.b.example.com', 'b.example.com', 'example.com']);
});

test('two-label host has a single candidate', () => {
  assert.deepEqual(scopeCandidates('instagram.com'), ['instagram.com']);
});

test('single-label and IPv6 hosts are returned as-is', () => {
  assert.deepEqual(scopeCandidates('localhost'), ['localhost']);
  assert.deepEqual(scopeCandidates('[::1]'), ['[::1]']);
});

test('default scope drops a leading www', () => {
  assert.equal(defaultScope('www.instagram.com'), 'instagram.com');
});

test('default scope keeps other subdomains (never widens past what the user is on)', () => {
  assert.equal(defaultScope('app.example.co.uk'), 'app.example.co.uk');
});

test('permission pattern covers the domain and subdomains on both schemes', () => {
  assert.deepEqual(scopePermission('instagram.com'), { origins: ['*://*.instagram.com/*'] });
});
