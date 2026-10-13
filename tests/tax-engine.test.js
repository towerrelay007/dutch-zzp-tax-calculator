// tests/tax-engine.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateZZPTax, TAX_CONFIG } from '../js/tax-engine.js';

test('calculates 2026 tax correctly with standard inputs', () => {
  const result = calculateZZPTax({
    taxYear: 2026,
    hourlyRate: 135,
    billableHours: 1500,
    operatingExpenses: 10000,
    aovInsurance: 5000,
    pensionContribution: 15000,
    hasUrencriterium: true,
    hasStartersaftrek: false
  });

  assert.equal(result.grossRevenue, 202500);
  assert.equal(result.totalExpenses, 15000);
  assert.equal(result.profitBeforeDeductions, 187500);
  assert.equal(result.zelfstandigenaftrek, 1200);
  assert.equal(result.startersaftrek, 0);
  assert.equal(result.profitAfterEntrepreneurDeductions, 186300);
  // MKB 12.7% of 186300 = 23660.10
  assert.equal(Math.round(result.mkbWinstvrijstelling), 23660);
  assert.equal(Math.round(result.taxableProfit), 162640);
  // Zvw 4.85% of min(162640, 79409) = 3851.34
  assert.equal(Math.round(result.zvwContribution), 3851);
  // Taxable Box 1 = 162640 - 15000 = 147640
  assert.equal(Math.round(result.taxableIncomeBox1), 147640);
  assert.ok(result.finalBox1Tax > 50000);
  assert.ok(result.netAnnual > 80000);
  assert.ok(result.netMonthly > 6000);
});

test('handles 2025 tax year with higher zelfstandigenaftrek', () => {
  const result = calculateZZPTax({
    taxYear: 2025,
    hourlyRate: 100,
    billableHours: 1400,
    operatingExpenses: 5000,
    aovInsurance: 2000,
    pensionContribution: 5000,
    hasUrencriterium: true,
    hasStartersaftrek: true
  });

  assert.equal(result.zelfstandigenaftrek, 2470);
  assert.equal(result.startersaftrek, 2123);
  assert.ok(result.grossRevenue === 140000);
});

test('zeroes out entrepreneur deductions if urencriterium is false', () => {
  const result = calculateZZPTax({
    taxYear: 2026,
    hourlyRate: 100,
    billableHours: 800,
    operatingExpenses: 5000,
    aovInsurance: 0,
    pensionContribution: 0,
    hasUrencriterium: false,
    hasStartersaftrek: true
  });

  assert.equal(result.zelfstandigenaftrek, 0);
  assert.equal(result.startersaftrek, 0);
});

test('handles zero revenue and expenses greater than revenue safely without NaN', () => {
  const result = calculateZZPTax({
    taxYear: 2026,
    hourlyRate: 0,
    billableHours: 0,
    operatingExpenses: 5000,
    aovInsurance: 1000,
    pensionContribution: 0,
    hasUrencriterium: false,
    hasStartersaftrek: false
  });

  assert.equal(result.grossRevenue, 0);
  assert.equal(result.profitBeforeDeductions, 0);
  assert.equal(result.taxableIncomeBox1, 0);
  assert.equal(result.finalBox1Tax, 0);
  assert.equal(result.zvwContribution, 0);
  assert.equal(result.netAnnual, -6000);
});

test('verifies breakdown periods match expected dividers', () => {
  const result = calculateZZPTax({
    taxYear: 2026,
    hourlyRate: 100,
    billableHours: 1200,
    operatingExpenses: 0,
    aovInsurance: 0,
    pensionContribution: 0,
    hasUrencriterium: true,
    hasStartersaftrek: false
  });

  assert.equal(result.breakdownPeriods.year.revenue, result.grossRevenue);
  assert.equal(result.breakdownPeriods.month.revenue, result.grossRevenue / 12);
  assert.equal(result.breakdownPeriods.quarter.revenue, result.grossRevenue / 4);
  assert.equal(result.breakdownPeriods.hour.revenue, 100);
});

test('2025 arbeidskorting transitions smoothly without cliff above 127916', () => {
  const credit128000 = TAX_CONFIG[2025].calculateArbeidskorting(128000);
  assert.ok(credit128000 > 0, 'Arbeidskorting should be > 0 at 128,000 in 2025');
  assert.ok(credit128000 <= 150, 'Arbeidskorting should be <= 150 at 128,000 in 2025');

  const credit131000 = TAX_CONFIG[2025].calculateArbeidskorting(131000);
  assert.equal(credit131000, 0, 'Arbeidskorting should reach 0 once fully tapered');
});

test('enforces exact Zvw caps for 2025 and 2026 at high profit', () => {
  const res2025 = calculateZZPTax({
    taxYear: 2025,
    calculationMode: 'annual',
    annualRevenue: 200000,
    operatingExpenses: 0,
    aovInsurance: 0,
    pensionContribution: 0,
    hasUrencriterium: false,
    hasStartersaftrek: false
  });
  // Max cap 75860 * 0.0532 = 4035.752
  assert.equal(Math.round(res2025.zvwContribution), Math.round(75860 * 0.0532));

  const res2026 = calculateZZPTax({
    taxYear: 2026,
    calculationMode: 'annual',
    annualRevenue: 200000,
    operatingExpenses: 0,
    aovInsurance: 0,
    pensionContribution: 0,
    hasUrencriterium: false,
    hasStartersaftrek: false
  });
  // Max cap 79409 * 0.0485 = 3851.3365
  assert.equal(Math.round(res2026.zvwContribution), Math.round(79409 * 0.0485));
});

test('partially caps startersaftrek when profit is less than total allowances', () => {
  const result = calculateZZPTax({
    taxYear: 2025,
    calculationMode: 'annual',
    annualRevenue: 3000,
    operatingExpenses: 0,
    aovInsurance: 0,
    pensionContribution: 0,
    hasUrencriterium: true,
    hasStartersaftrek: true
  });
  // Profit = 3000. ZA = 2470. Remaining for starters = 530. Total deduction = 3000.
  assert.equal(result.zelfstandigenaftrek, 2470);
  assert.equal(result.startersaftrek, 530);
  assert.equal(result.profitAfterEntrepreneurDeductions, 0);
});
