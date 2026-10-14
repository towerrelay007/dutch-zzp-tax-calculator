// tests/i18n.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS, t } from '../js/i18n.js';

test('i18n dictionary contains en and nl locales with identical keys', () => {
  assert.ok(TRANSLATIONS.en, 'English translation bundle must exist');
  assert.ok(TRANSLATIONS.nl, 'Dutch translation bundle must exist');

  const enKeys = Object.keys(TRANSLATIONS.en).sort();
  const nlKeys = Object.keys(TRANSLATIONS.nl).sort();

  assert.deepEqual(enKeys, nlKeys, 'All keys in English bundle must match Dutch bundle');
});

test('all required tax explanation tooltips are defined with non-empty text', () => {
  const tooltipKeys = [
    'tipZA',
    'tipStarters',
    'tipMKB',
    'tipZvw',
    'tipPension',
    'tipAOV',
    'tipUrencriterium',
    'tipCredits',
    'tipFiscaleWinst',
    'tipTaxableIncome'
  ];

  for (const key of tooltipKeys) {
    const enText = t(key, 'en');
    const nlText = t(key, 'nl');
    assert.ok(enText && enText !== key, `Tooltip ${key} must have English translation`);
    assert.ok(nlText && nlText !== key, `Tooltip ${key} must have Dutch translation`);
  }
});

test('t() helper translates and interpolates parameters correctly', () => {
  const enBadge = t('hoursDisplay', 'en', { wkHours: '31.3', days: '3.9' });
  assert.equal(enBadge, '31.3 hrs/wk (~3.9 days)');

  const nlBadge = t('hoursDisplay', 'nl', { wkHours: '31.3', days: '3.9' });
  assert.equal(nlBadge, '31.3 uur/wk (~3.9 dagen)');
});

test('t() falls back gracefully to English if translation key is missing in another language', () => {
  const result = t('appTitle', 'en');
  assert.ok(result.includes('Dutch ZZP Tax Calculator'));

  const nlResult = t('appTitle', 'nl');
  assert.ok(nlResult.includes('Nederlandse ZZP Belastingcalculator'));
});
