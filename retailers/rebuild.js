#!/usr/bin/env node
// Rebuilds retailers.json from CSV + geocache with split ice cream categories.

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'Store Locator Merge - Formatted_March26 - Store Locator Merge - Formatted_March26.csv');
const OUT_PATH = path.join(__dirname, 'retailers.json');
const CACHE_PATH = path.join(__dirname, 'geocache.json');

const COFFEE_PATTERNS = [/biggby/i,/scooters?\s+coffee/i,/\bcoffee\b/i,/espresso/i,/chapbook\s+cafe/i,/green\s+isaac/i,/root\s+coffee/i,/riverview\s+coffee/i,/simply\s+coffee/i,/bitterend/i,/corner\s+cup/i,/quickwater/i,/aldea/i,/anchor\s+coffee/i,/insomnia\s+cookies/i,/fireside\s+coffee/i,/coffeehouse/i,/coffee\s+house/i];
function isCoffeeShop(name) { return COFFEE_PATTERNS.some(p => p.test(name)); }

const EXCLUDE_ADDRESSES = new Set(['3476 80th ave new era','3476 s 80th ave new era','5850 balsam dr hudsonville']);
function normalizeAddr(addr, city) { return (addr + ' ' + city).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim(); }

function parseTags(categoryStr, name) {
  const cats = categoryStr.toLowerCase();
  const tags = new Set();

  if (cats.includes('milk')) tags.add('dairy');
  if (cats.includes('sells ice cream')) tags.add('sells_icecream');
  if (cats.includes('serves ice cream') || cats.includes('soft serve')) tags.add('serves_icecream');

  // Coffee shops: replace dairy with uses_products (only if no ice cream)
  if (isCoffeeShop(name) && tags.has('dairy') && !tags.has('sells_icecream') && !tags.has('serves_icecream')) {
    tags.delete('dairy');
    tags.add('uses_products');
  }
  return [...tags];
}

function parseCSV(content) {
  const lines = content.split('\n');
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = [];
    let inQuote = false, cur = '';
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; }
      else { cur += ch; }
    }
    fields.push(cur);
    if (fields.length < 8) continue;
    result.push({ name: fields[1].trim(), address: fields[2].trim(), city: fields[3].trim(), state: fields[4].trim(), zip: (fields[5]||'').trim().split('-')[0], category: fields[7].trim() });
  }
  return result;
}

function deduplicate(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = normalizeAddr(row.address, row.city);
    if (EXCLUDE_ADDRESSES.has(key)) continue;
    if (!row.name || !row.address || !row.city || !row.category) continue;
    const tags = parseTags(row.category, row.name);
    if (!tags.length) continue;
    if (!map.has(key)) {
      map.set(key, { name: row.name, address: row.address, city: row.city, state: row.state, zip: row.zip, tags: new Set(tags) });
    } else {
      tags.forEach(t => map.get(key).tags.add(t));
    }
  }
  return [...map.values()].map(e => ({ ...e, tags: [...e.tags] }));
}

const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
const rows = parseCSV(fs.readFileSync(CSV_PATH, 'utf8'));
const unique = deduplicate(rows);

const results = unique
  .map(r => {
    const coords = cache[normalizeAddr(r.address, r.city)];
    return coords ? { name: r.name, address: r.address, city: r.city, state: r.state, zip: r.zip, lat: coords.lat, lng: coords.lng, products: r.tags } : null;
  })
  .filter(Boolean);

fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));

const cats = {};
results.forEach(r => r.products.forEach(p => cats[p] = (cats[p]||0)+1));
console.log(`Total: ${results.length} | Categories:`, cats);
