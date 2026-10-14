// tests/app-dom.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateZZPTax } from '../js/tax-engine.js';
import { TRANSLATIONS } from '../js/i18n.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, '../index.html');
const appJsPath = path.resolve(__dirname, '../js/app.js');

test('all getElementById targets in app.js exist in index.html', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');

  const matches = [...appJs.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)];
  const queriedIds = matches.map(m => m[1]);

  const missingIds = [];
  for (const id of queriedIds) {
    const hasDoubleQuote = html.includes(`id="${id}"`);
    const hasSingleQuote = html.includes(`id='${id}'`);
    if (!hasDoubleQuote && !hasSingleQuote) {
      missingIds.push(id);
    }
  }

  assert.deepEqual(missingIds, [], `All queried IDs in app.js must exist in index.html. Missing: ${missingIds.join(', ')}`);
});

test('all data-i18n attributes in index.html exist in translations dictionary', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const matches = [...html.matchAll(/data-i18n=['"]([^'"]+)['"]/g)];
  const keys = [...new Set(matches.map(m => m[1]))];

  for (const key of keys) {
    assert.ok(TRANSLATIONS.en[key], `Missing English translation for data-i18n="${key}"`);
    assert.ok(TRANSLATIONS.nl[key], `Missing Dutch translation for data-i18n="${key}"`);
  }
});

test('default calculation yields non-zero taxes and positive net disposable cash', () => {
  const res = calculateZZPTax({
    taxYear: 2026,
    calculationMode: 'hourly',
    hourlyRate: 135,
    billableHours: 1500,
    annualRevenue: 202500,
    operatingExpenses: 10000,
    aovInsurance: 5000,
    pensionContribution: 15000,
    hasUrencriterium: true,
    hasStartersaftrek: false
  });

  // Verify non-zero calculations
  assert.equal(res.grossRevenue, 202500);
  assert.equal(res.totalExpenses, 15000);
  assert.equal(res.profitBeforeDeductions, 187500);
  assert.equal(res.zelfstandigenaftrek, 1200);
  assert.equal(Math.round(res.mkbWinstvrijstelling), 23660);
  assert.equal(Math.round(res.taxableProfit), 162640);
  assert.equal(Math.round(res.zvwContribution), 3851);
  assert.equal(Math.round(res.taxableIncomeBox1), 147640);
  assert.equal(Math.round(res.finalBox1Tax), 63014);
  assert.equal(Math.round(res.netAnnual), 105635);
  assert.equal(Math.round(res.netMonthly), 8803);

  // Guarantee they are not zero
  assert.notEqual(res.finalBox1Tax, 0, 'Tax must not be zero for €202,500 revenue');
  assert.notEqual(res.netAnnual, 0, 'Annual Net Disposable Cash must not be zero');
  assert.ok(res.finalBox1Tax > 0);
  assert.ok(res.netAnnual > 0);
});
