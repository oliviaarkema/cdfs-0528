#!/usr/bin/env node
// Reads the retailer CSV, deduplicates, categorizes, geocodes, and outputs retailers.json

const fs = require('fs');
const https = require('https');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'Store Locator Merge - Formatted_March26 - Store Locator Merge - Formatted_March26.csv');
const OUT_PATH = path.join(__dirname, 'retailers.json');
const CACHE_PATH = path.join(__dirname, 'geocache.json');

// ── Coffee shop name detection ───────────────────────────────────────────────
const COFFEE_PATTERNS = [
  /biggby/i,
  /scooters?\s+coffee/i,
  /\bcoffee\b/i,
  /espresso/i,
  /chapbook\s+cafe/i,
  /green\s+isaac/i,
  /root\s+coffee/i,
  /riverview\s+coffee/i,
  /simply\s+coffee/i,
  /bitterend/i,
  /corner\s+cup/i,
  /quickwater/i,
  /aldea/i,
  /anchor\s+coffee/i,
  /insomnia\s+cookies/i,
  /fireside\s+coffee/i,
  /coffeehouse/i,
  /coffee\s+house/i,
];

function isCoffeeShop(name) {
  return COFFEE_PATTERNS.some(p => p.test(name));
}

// ── Addresses to exclude (internal / Country Dairy itself) ───────────────────
const EXCLUDE_ADDRESSES = new Set([
  '3476 80th ave new era',          // Country Dairy itself
  '3476 s 80th ave new era',        // Country Dairy itself
  '5850 balsam dr hudsonville',     // internal (Employees, Sales Samples, Cash & Carry)
]);

function normalizeAddr(addr, city) {
  return (addr + ' ' + city).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

// ── CSV category → our tags ───────────────────────────────────────────────────
function parseTags(categoryStr, name) {
  const cats = categoryStr.toLowerCase();
  const tags = new Set();
  if (cats.includes('milk')) tags.add('dairy');
  if (cats.includes('ice cream') || cats.includes('soft serve')) tags.add('icecream');

  // Promote coffee shops: replace dairy with uses_products
  if (isCoffeeShop(name) && tags.has('dairy') && !tags.has('icecream')) {
    tags.delete('dairy');
    tags.add('uses_products');
  }
  return [...tags];
}

// ── Parse CSV ─────────────────────────────────────────────────────────────────
function parseCSV(content) {
  const lines = content.split('\n');
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Handle quoted fields with commas inside
    const fields = [];
    let inQuote = false;
    let cur = '';
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; }
      else { cur += ch; }
    }
    fields.push(cur);
    if (fields.length < 8) continue;
    // Columns: Customer#, Name, Address, City, ST, Zip, Phone, Category, Custom Category
    result.push({
      name: fields[1].trim(),
      address: fields[2].trim(),
      city: fields[3].trim(),
      state: fields[4].trim(),
      zip: (fields[5] || '').trim().split('-')[0],
      category: fields[7].trim(),
    });
  }
  return result;
}

// ── Deduplicate: group by normalized address+city, merge tags ─────────────────
function deduplicate(rows) {
  const map = new Map(); // key → {name, address, city, state, zip, tags}

  for (const row of rows) {
    const key = normalizeAddr(row.address, row.city);
    if (EXCLUDE_ADDRESSES.has(key)) continue;
    if (!row.name || !row.address || !row.city) continue;
    if (!row.category) continue;

    const tags = parseTags(row.category, row.name);
    if (tags.length === 0) continue;

    if (!map.has(key)) {
      map.set(key, {
        name: row.name,
        address: row.address,
        city: row.city,
        state: row.state,
        zip: row.zip,
        tags: new Set(tags),
      });
    } else {
      const entry = map.get(key);
      tags.forEach(t => entry.tags.add(t));
      // Use shorter / cleaner name if the existing has " D " or " I/C " suffix
      const cleanerName = row.name.replace(/\s+(D|I\/C|IC|MILK|IC\s+\w+)\s*$/, '').trim();
      if (cleanerName.length < entry.name.length) {
        entry.name = cleanerName;
      }
    }
  }

  return [...map.values()].map(e => ({ ...e, tags: [...e.tags] }));
}

// ── Geocode via Nominatim ─────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function nominatim(address, city, state, zip) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(`${address}, ${city}, ${state} ${zip}, USA`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=us`;
    const opts = {
      hostname: 'nominatim.openstreetmap.org',
      path: `/search?q=${q}&format=json&limit=1&countrycodes=us`,
      headers: { 'User-Agent': 'CountryDairyStoreLocator/1.0 (oliviac1598@gmail.com)' },
    };
    const req = https.get(opts, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.length > 0) {
            resolve({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
          } else {
            resolve(null);
          }
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(10000, () => { req.destroy(); resolve(null); });
  });
}

async function main() {
  const content = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCSV(content);
  console.log(`Parsed ${rows.length} rows`);

  const unique = deduplicate(rows);
  console.log(`Deduplicated to ${unique.length} unique locations`);

  // Load geocache
  let cache = {};
  if (fs.existsSync(CACHE_PATH)) {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    console.log(`Loaded ${Object.keys(cache).length} cached geocodes`);
  }

  const results = [];
  let geocoded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < unique.length; i++) {
    const r = unique[i];
    const cacheKey = normalizeAddr(r.address, r.city);

    let coords = cache[cacheKey];
    if (!coords) {
      process.stdout.write(`[${i+1}/${unique.length}] Geocoding: ${r.name}, ${r.city}, ${r.state}...`);
      await sleep(1100); // Nominatim rate limit: 1 req/sec
      coords = await nominatim(r.address, r.city, r.state, r.zip);
      if (coords) {
        cache[cacheKey] = coords;
        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
        process.stdout.write(` ✓ (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})\n`);
        geocoded++;
      } else {
        process.stdout.write(` ✗ (not found)\n`);
        failed++;
      }
    } else {
      skipped++;
    }

    if (coords) {
      results.push({
        name: r.name,
        address: r.address,
        city: r.city,
        state: r.state,
        zip: r.zip,
        lat: coords.lat,
        lng: coords.lng,
        products: r.tags,
      });
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
  console.log(`\nDone. ${geocoded} geocoded, ${skipped} from cache, ${failed} failed.`);
  console.log(`Output: ${results.length} retailers → ${OUT_PATH}`);
}

main().catch(console.error);
