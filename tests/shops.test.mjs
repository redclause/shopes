import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterShops, readSaved } from '../src/lib/shops/directory.ts';
const shops = JSON.parse(readFileSync(new URL('../src/lib/shops/catalog.json', import.meta.url), 'utf8'));
test('catalog has over 1,000 unique HTTPS storefronts with recorded source evidence', () => {
  assert.ok(shops.length > 1000);
  assert.equal(new Set(shops.map(s => s.id)).size, shops.length);
  const evidence = JSON.parse(readFileSync(new URL('../docs/shop-directory-evidence.json', import.meta.url), 'utf8'));
  for (const shop of shops) {
    const url = new URL(shop.url);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.hostname.replace(/^www\./, ''), shop.id);
    assert.ok(shop.name.trim().length > 1);
    assert.equal(evidence[shop.id].listedStatus, 'Active');
    assert.ok(evidence[shop.id].listedProducts >= 20);
    if (shop.checkedAt) {
      assert.ok(evidence[shop.id].liveCheck.productLinks >= 3);
      assert.equal(evidence[shop.id].liveCheck.cart, true);
    }
  }
});
test('search combines words, categories and saved-only filtering', () => {
  const records = [
    { id: 'a.example', name: 'Green Shoe Shop', category: 'Fashion' },
    { id: 'b.example', name: 'Green Home', category: 'Home' },
    { id: 'c.example', name: 'Blue Shoe', category: 'Fashion' },
  ];
  assert.deepEqual(filterShops(records, ' SHOE green ', 'All shops', false, []).map(s => s.id), ['a.example']);
  assert.deepEqual(filterShops(records, '', 'Fashion', true, ['c.example']).map(s => s.id), ['c.example']);
  assert.equal(filterShops(records, 'missing', 'All shops', false, []).length, 0);
  assert.equal(filterShops(records, 'b.example', 'All shops', false, []).length, 1);
});
test('saved shops recover safely from corrupt, duplicate, or stale browser data', () => {
  const known = new Set(['a', 'b']);
  for (const invalid of [null, '{', '{}', 'null', '123']) assert.deepEqual(readSaved(invalid, known), []);
  assert.deepEqual(readSaved('["a","a",4,"unknown","b"]', known), ['a', 'b']);
});
