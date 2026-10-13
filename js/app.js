import { calculateZZPTax } from './tax-engine.js';
import { t } from './i18n.js';

// Application State
const state = {
  lang: 'en',
  taxYear: 2026,
  calculationMode: 'hourly',
  activePeriod: 'month',
  userOverrodeUrencriterium: false
};

const DEFAULTS = {
  taxYear: 2026,
  calculationMode: 'hourly',
  hourlyRate: 135,
  billableHours: 1500,
  annualRevenue: 202500,
  expenses: 10000,
  aov: 5000,
  pension: 15000,
  urencriterium: true,
  startersaftrek: false
};

// Currency Formatter (Dutch formatting)
function formatCurrency(amount, allowNegative = false) {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(absAmount);

  if (isNegative && allowNegative) {
    return '-' + formatted;
  }
  return formatted;
}

function formatDeduction(amount) {
  const absAmount = Math.abs(amount || 0);
  if (absAmount === 0) {
    return formatCurrency(0);
  }
  return '-' + formatCurrency(absAmount);
}

// Elements
const elements = {
  // Language toggle
  langEN: document.getElementById('langEN'),
  langNL: document.getElementById('langNL'),

  // Year toggle
  taxYear2026: document.getElementById('taxYear2026'),
  taxYear2025: document.getElementById('taxYear2025'),
  activeYearBadge: document.getElementById('activeYearBadge'),
  zaLabel: document.getElementById('zaLabel'),

  // Mode toggle
  modeHourly: document.getElementById('modeHourly'),
  modeAnnual: document.getElementById('modeAnnual'),
  hourlyModeGroup: document.getElementById('hourlyModeGroup'),
  annualRevenueContainer: document.getElementById('annualRevenueContainer'),

  // Inputs
  hourlyRate: document.getElementById('hourlyRate'),
  billableHours: document.getElementById('billableHours'),
  hoursDisplay: document.getElementById('hoursDisplay'),
  annualRevenue: document.getElementById('annualRevenue'),
  expenses: document.getElementById('expenses'),
  aov: document.getElementById('aov'),
  pension: document.getElementById('pension'),
  urencriterium: document.getElementById('urencriterium'),
  startersaftrek: document.getElementById('startersaftrek'),

  // Action buttons
  btnCopyLink: document.getElementById('btnCopyLink'),
  btnReset: document.getElementById('btnReset'),
  toastNotification: document.getElementById('toastNotification'),

  // Hero cards
  netMonthly: document.getElementById('netMonthly'),
  netAnnual: document.getElementById('netAnnual'),
  effectiveRateBadge: document.getElementById('effectiveRateBadge'),
  netMarginBadge: document.getElementById('netMarginBadge'),

  // Period Tabs
  tabButtons: document.querySelectorAll('.tab-btn'),
  periodGross: document.getElementById('periodGross'),
  periodExpenses: document.getElementById('periodExpenses'),
  periodTaxable: document.getElementById('periodTaxable'),
  periodZvw: document.getElementById('periodZvw'),
  periodTax: document.getElementById('periodTax'),
  periodNet: document.getElementById('periodNet'),

  // Distribution Bar
  distNetBar: document.getElementById('distNetBar'),
  distTaxBar: document.getElementById('distTaxBar'),
  distPensionBar: document.getElementById('distPensionBar'),
  distExpBar: document.getElementById('distExpBar'),
  distNetLabel: document.getElementById('distNetLabel'),
  distTaxLabel: document.getElementById('distTaxLabel'),
  distPensionLabel: document.getElementById('distPensionLabel'),
  distExpLabel: document.getElementById('distExpLabel'),

  // Detailed Step Table
  outRevenue: document.getElementById('outRevenue'),
  outExpenses: document.getElementById('outExpenses'),
  outProfitBefore: document.getElementById('outProfitBefore'),
  outZA: document.getElementById('outZA'),
  outStarters: document.getElementById('outStarters'),
  outMKB: document.getElementById('outMKB'),
  outTaxableProfit: document.getElementById('outTaxableProfit'),
  zvwLabel: document.getElementById('zvwLabel'),
  zvwTooltip: document.getElementById('zvwTooltip'),
  outZvw: document.getElementById('outZvw'),
  outPensionDed: document.getElementById('outPensionDed'),
  outTaxableIncome: document.getElementById('outTaxableIncome'),
  outBox1Gross: document.getElementById('outBox1Gross'),
  outCredits: document.getElementById('outCredits'),
  outTax: document.getElementById('outTax'),
  outNetTakeHome: document.getElementById('outNetTakeHome')
};

// URL Hash Parsing and Updating
function parseHash() {
  const storedLang = localStorage.getItem('zzp_lang');
  if (storedLang === 'nl' || storedLang === 'en') {
    state.lang = storedLang;
  }

  if (!window.location.hash || window.location.hash.length <= 1) return;
  try {
    const params = new URLSearchParams(window.location.hash.substring(1));
    if (params.has('lang')) {
      const l = params.get('lang');
      if (l === 'nl' || l === 'en') state.lang = l;
    }
    if (params.has('year')) {
      const year = parseInt(params.get('year'), 10);
      if (year === 2025 || year === 2026) state.taxYear = year;
    }
    if (params.has('mode')) {
      const mode = params.get('mode');
      if (mode === 'annual' || mode === 'hourly') state.calculationMode = mode;
    }
    if (params.has('rate') && elements.hourlyRate) elements.hourlyRate.value = params.get('rate');
    if (params.has('hours') && elements.billableHours) elements.billableHours.value = params.get('hours');
    if (params.has('rev') && elements.annualRevenue) elements.annualRevenue.value = params.get('rev');
    if (params.has('exp') && elements.expenses) elements.expenses.value = params.get('exp');
    if (params.has('aov') && elements.aov) elements.aov.value = params.get('aov');
    if (params.has('pension') && elements.pension) elements.pension.value = params.get('pension');
    if (params.has('uc') && elements.urencriterium) {
      elements.urencriterium.checked = params.get('uc') === '1';
      state.userOverrodeUrencriterium = true;
    }
    if (params.has('sa') && elements.startersaftrek) {
      elements.startersaftrek.checked = params.get('sa') === '1';
    }
    if (params.has('period')) {
      const period = params.get('period');
      if (['year', 'quarter', 'month', 'week', 'day', 'hour'].includes(period)) {
        state.activePeriod = period;
      }
    }
  } catch (err) {
    console.warn('Could not parse URL hash params', err);
  }
}

function updateHash() {
  const params = new URLSearchParams();
  params.set('lang', state.lang);
  params.set('year', state.taxYear);
  params.set('mode', state.calculationMode);
  params.set('rate', elements.hourlyRate.value);
  params.set('hours', elements.billableHours.value);
  params.set('rev', elements.annualRevenue.value);
  params.set('exp', elements.expenses.value);
  params.set('aov', elements.aov.value);
  params.set('pension', elements.pension.value);
  params.set('uc', elements.urencriterium.checked ? '1' : '0');
  params.set('sa', elements.startersaftrek.checked ? '1' : '0');
  params.set('period', state.activePeriod);

  const newHash = '#' + params.toString();
  if (window.location.hash !== newHash) {
    window.history.replaceState(null, '', newHash);
  }
}

export function setLanguage(lang) {
  if (lang !== 'nl' && lang !== 'en') lang = 'en';
  state.lang = lang;
  try {
    localStorage.setItem('zzp_lang', lang);
  } catch {}
  document.documentElement.lang = lang;

  if (lang === 'nl') {
    elements.langNL.classList.add('active');
    elements.langNL.classList.remove('text-slate-600');
    elements.langEN.classList.remove('active');
    elements.langEN.classList.add('text-slate-600');
  } else {
    elements.langEN.classList.add('active');
    elements.langEN.classList.remove('text-slate-600');
    elements.langNL.classList.remove('active');
    elements.langNL.classList.add('text-slate-600');
  }

  // Update all declarative data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.innerText = t(key, lang);
    }
  });

  recalculateAndRender();
}

// Main Recalculate and Render Function
export function recalculateAndRender() {
  // Sync year toggles
  if (state.taxYear === 2026) {
    elements.taxYear2026.classList.add('active');
    elements.taxYear2026.classList.remove('text-slate-600');
    elements.taxYear2025.classList.remove('active');
    elements.taxYear2025.classList.add('text-slate-600');
    elements.activeYearBadge.innerText = t('activeYearBadge', state.lang, { year: 2026 });
    elements.zaLabel.innerText = t('zaLabel2026', state.lang);
  } else {
    elements.taxYear2025.classList.add('active');
    elements.taxYear2025.classList.remove('text-slate-600');
    elements.taxYear2026.classList.remove('active');
    elements.taxYear2026.classList.add('text-slate-600');
    elements.activeYearBadge.innerText = t('activeYearBadge', state.lang, { year: 2025 });
    elements.zaLabel.innerText = t('zaLabel2025', state.lang);
  }

  // Sync mode views
  if (state.calculationMode === 'annual') {
    elements.modeAnnual.classList.add('bg-white', 'text-blue-600', 'font-semibold', 'shadow-xs');
    elements.modeAnnual.classList.remove('text-slate-600');
    elements.modeHourly.classList.remove('bg-white', 'text-blue-600', 'font-semibold', 'shadow-xs');
    elements.modeHourly.classList.add('text-slate-600');
    elements.hourlyModeGroup.classList.add('hidden');
    elements.annualRevenueContainer.classList.remove('hidden');
  } else {
    elements.modeHourly.classList.add('bg-white', 'text-blue-600', 'font-semibold', 'shadow-xs');
    elements.modeHourly.classList.remove('text-slate-600');
    elements.modeAnnual.classList.remove('bg-white', 'text-blue-600', 'font-semibold', 'shadow-xs');
    elements.modeAnnual.classList.add('text-slate-600');
    elements.hourlyModeGroup.classList.remove('hidden');
    elements.annualRevenueContainer.classList.add('hidden');
  }

  const hours = parseFloat(elements.billableHours.value) || 0;
  const wkHours = (hours / 48).toFixed(1);
  const days = ((hours / 48) / 8).toFixed(1);
  elements.hoursDisplay.innerText = t('hoursDisplay', state.lang, { wkHours, days });

  // Auto urencriterium assistance (auto-checks if >= 1225 unless manually modified)
  if (!state.userOverrodeUrencriterium) {
    elements.urencriterium.checked = hours >= 1225;
  }

  // Calculate inputs
  const inputs = {
    taxYear: state.taxYear,
    calculationMode: state.calculationMode,
    hourlyRate: parseFloat(elements.hourlyRate.value) || 0,
    billableHours: hours,
    annualRevenue: parseFloat(elements.annualRevenue.value) || 0,
    operatingExpenses: parseFloat(elements.expenses.value) || 0,
    aovInsurance: parseFloat(elements.aov.value) || 0,
    pensionContribution: parseFloat(elements.pension.value) || 0,
    hasUrencriterium: elements.urencriterium.checked,
    hasStartersaftrek: elements.startersaftrek.checked
  };

  const res = calculateZZPTax(inputs);

  // Render Hero
  elements.netMonthly.innerText = formatCurrency(res.netMonthly, true);
  elements.netAnnual.innerText = formatCurrency(res.netAnnual, true);
  elements.effectiveRateBadge.innerText = t('taxRateBadge', state.lang, { rate: res.effectiveTaxRate.toFixed(1) });
  elements.netMarginBadge.innerText = t('netMarginBadge', state.lang, { margin: res.netMargin.toFixed(1) });

  // Render thetax.nl Period Summary
  elements.tabButtons.forEach(btn => {
    if (btn.dataset.period === state.activePeriod) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const periodData = res.breakdownPeriods[state.activePeriod] || res.breakdownPeriods.month;
  elements.periodGross.innerText = formatCurrency(periodData.revenue);
  elements.periodExpenses.innerText = formatDeduction(periodData.expenses);
  elements.periodTaxable.innerText = formatCurrency(periodData.profit);
  elements.periodZvw.innerText = formatDeduction(periodData.zvw);
  elements.periodTax.innerText = formatDeduction(periodData.tax);
  elements.periodNet.innerText = formatCurrency(periodData.net, true);

  // Render Visual Distribution Bar
  let netShare = 0;
  let taxShare = 0;
  let pensionShare = 0;
  let expShare = 0;

  if (res.grossRevenue > 0) {
    netShare = Math.max(0, (res.netAnnual / res.grossRevenue) * 100);
    taxShare = Math.max(0, ((res.finalBox1Tax + res.zvwContribution) / res.grossRevenue) * 100);
    pensionShare = Math.max(0, (res.pensionDeduction / res.grossRevenue) * 100);
    expShare = Math.max(0, (res.totalExpenses / res.grossRevenue) * 100);
  }

  elements.distNetBar.style.width = `${netShare.toFixed(1)}%`;
  elements.distTaxBar.style.width = `${taxShare.toFixed(1)}%`;
  elements.distPensionBar.style.width = `${pensionShare.toFixed(1)}%`;
  elements.distExpBar.style.width = `${expShare.toFixed(1)}%`;

  elements.distNetLabel.innerText = `${netShare.toFixed(1)}%`;
  elements.distTaxLabel.innerText = `${taxShare.toFixed(1)}%`;
  elements.distPensionLabel.innerText = `${pensionShare.toFixed(1)}%`;
  elements.distExpLabel.innerText = `${expShare.toFixed(1)}%`;

  // Render Step-by-Step Table
  elements.outRevenue.innerText = formatCurrency(res.grossRevenue);
  elements.outExpenses.innerText = formatDeduction(res.totalExpenses);
  elements.outProfitBefore.innerText = formatCurrency(res.profitBeforeDeductions);
  elements.outZA.innerText = formatDeduction(res.zelfstandigenaftrek);
  elements.outStarters.innerText = formatDeduction(res.startersaftrek);
  elements.outMKB.innerText = formatDeduction(res.mkbWinstvrijstelling);
  elements.outTaxableProfit.innerText = formatCurrency(res.taxableProfit);

  elements.zvwLabel.innerText = t('rowZvw', state.lang, { rate: (res.zvwRate * 100).toFixed(2) });
  elements.zvwTooltip.title = `Applied up to €${res.zvwCap.toLocaleString('nl-NL')} cap. Max contribution: €${Math.round(res.zvwCap * res.zvwRate).toLocaleString('nl-NL')}`;
  elements.outZvw.innerText = formatDeduction(res.zvwContribution);

  elements.outPensionDed.innerText = formatDeduction(res.pensionDeduction);
  elements.outTaxableIncome.innerText = formatCurrency(res.taxableIncomeBox1);
  elements.outBox1Gross.innerText = formatCurrency(res.box1GrossTax);
  elements.outCredits.innerText = formatDeduction(res.totalTaxCredits);
  elements.outTax.innerText = formatDeduction(res.finalBox1Tax);
  elements.outNetTakeHome.innerText = formatCurrency(res.netAnnual, true);

  updateHash();
}

// Bind Event Listeners
function initListeners() {
  // Language Switcher Buttons
  if (elements.langEN) {
    elements.langEN.addEventListener('click', () => setLanguage('en'));
  }
  if (elements.langNL) {
    elements.langNL.addEventListener('click', () => setLanguage('nl'));
  }

  // Input fields
  const inputList = [
    elements.hourlyRate,
    elements.billableHours,
    elements.annualRevenue,
    elements.expenses,
    elements.aov,
    elements.pension
  ];

  inputList.forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => recalculateAndRender());
  });

  if (elements.urencriterium) {
    elements.urencriterium.addEventListener('change', () => {
      state.userOverrodeUrencriterium = true;
      recalculateAndRender();
    });
  }

  if (elements.startersaftrek) {
    elements.startersaftrek.addEventListener('change', () => recalculateAndRender());
  }

  // Rate chips
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const rate = e.currentTarget.dataset.rate;
      if (rate && elements.hourlyRate) {
        elements.hourlyRate.value = rate;
        recalculateAndRender();
      }
    });
  });

  // Year toggle
  elements.taxYear2026.addEventListener('click', () => {
    state.taxYear = 2026;
    recalculateAndRender();
  });

  elements.taxYear2025.addEventListener('click', () => {
    state.taxYear = 2025;
    recalculateAndRender();
  });

  // Mode toggle
  elements.modeHourly.addEventListener('click', () => {
    state.calculationMode = 'hourly';
    // Sync annual revenue to match hourly revenue for smooth transition
    const hours = parseFloat(elements.billableHours.value) || 0;
    const rate = parseFloat(elements.hourlyRate.value) || 0;
    elements.annualRevenue.value = Math.round(hours * rate);
    recalculateAndRender();
  });

  elements.modeAnnual.addEventListener('click', () => {
    state.calculationMode = 'annual';
    const hours = parseFloat(elements.billableHours.value) || 0;
    const rate = parseFloat(elements.hourlyRate.value) || 0;
    elements.annualRevenue.value = Math.round(hours * rate);
    recalculateAndRender();
  });

  // Period Tabs
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const period = e.currentTarget.dataset.period;
      if (period) {
        state.activePeriod = period;
        recalculateAndRender();
      }
    });
  });

  // Copy Link / Share
  elements.btnCopyLink.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(t('linkCopied', state.lang));
    } catch {
      showToast(t('linkCopyFailed', state.lang));
    }
  });

  // Reset Button
  elements.btnReset.addEventListener('click', () => {
    state.taxYear = DEFAULTS.taxYear;
    state.calculationMode = DEFAULTS.calculationMode;
    state.activePeriod = 'month';
    state.userOverrodeUrencriterium = false;

    elements.hourlyRate.value = DEFAULTS.hourlyRate;
    elements.billableHours.value = DEFAULTS.billableHours;
    elements.annualRevenue.value = DEFAULTS.annualRevenue;
    elements.expenses.value = DEFAULTS.expenses;
    elements.aov.value = DEFAULTS.aov;
    elements.pension.value = DEFAULTS.pension;
    elements.urencriterium.checked = DEFAULTS.urencriterium;
    elements.startersaftrek.checked = DEFAULTS.startersaftrek;

    window.history.replaceState(null, '', window.location.pathname);
    recalculateAndRender();
    showToast(t('resetToast', state.lang));
  });
}

function showToast(message) {
  if (!elements.toastNotification) return;
  const label = elements.toastNotification.querySelector('span');
  if (label) label.innerText = message;
  elements.toastNotification.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    elements.toastNotification.classList.add('translate-y-20', 'opacity-0');
  }, 2200);
}

// Initial boot
window.addEventListener('DOMContentLoaded', () => {
  parseHash();
  initListeners();
  setLanguage(state.lang);
});
