# Dutch ZZP Tax Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a responsive, single-page Dutch ZZP tax calculator inspired by thetax.nl for tax years 2025 and 2026 to a public GitHub repository with live GitHub Pages hosting.

**Architecture:** A zero-build, modular web application consisting of a functional mathematical tax engine (`js/tax-engine.js`), an interactive UI controller with real-time recalculation, period switching, and URL hash bookmarking (`js/app.js`), styled with Tailwind CSS in `index.html`. Automated calculation tests use Node.js's native test runner (`node --test`).

**Tech Stack:** Vanilla JavaScript (ES modules), Tailwind CSS, HTML5, Node.js test runner (`node:test`, `node:assert`), GitHub CLI (`gh`), GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-13-dutch-zzp-tax-calculator-design.md`

## Global Constraints
- Pure static zero-build architecture: no npm build step or external dependencies required to serve or deploy.
- Accurate Dutch tax modeling for 2025 and 2026 (Box 1 brackets, Algemene heffingskorting, Arbeidskorting, Zelfstandigenaftrek, Startersaftrek, MKB-winstvrijstelling, Zvw).
- Responsive desktop and mobile layout with thetax.nl-style period breakdown (Year, Quarter, Month, Week, Day, Hour).
- GitHub repository must be public under `towerrelay007/dutch-zzp-tax-calculator` with GitHub Pages enabled.

## Review Focus
- Negative or zero profit: when expenses exceed revenue, ensure taxable income and taxes don't produce negative amounts or NaN.
- Urencriterium cutoff: ensure falling below 1,225 hours zeroes out Zelfstandigenaftrek and Startersaftrek unless explicitly overridden.
- Startersaftrek cap: ensure deductions do not produce negative taxable business profit.
- Zvw cap boundaries: ensure 2025 (€75,860) and 2026 (€79,409) caps apply accurately.
- Extreme input values: ensure zero hours or extreme hourly rates handle graceful formatting.

---

### Task 1: Core Mathematical Dutch Tax Engine & Unit Tests

**Files:**
- Create: `js/tax-engine.js`
- Create: `tests/tax-engine.test.js`

**Interfaces:**
- Produces: `calculateZZPTax(inputs)` in `js/tax-engine.js`
  - Input:
    ```js
    {
      taxYear: 2026 | 2025,
      calculationMode: 'hourly' | 'annual',
      hourlyRate: number,
      billableHours: number,
      annualRevenue: number,
      operatingExpenses: number,
      aovInsurance: number,
      pensionContribution: number,
      hasUrencriterium: boolean,
      hasStartersaftrek: boolean
    }
    ```
  - Output:
    ```js
    {
      inputs: { ... },
      grossRevenue: number,
      totalExpenses: number,
      profitBeforeDeductions: number,
      zelfstandigenaftrek: number,
      startersaftrek: number,
      totalEntrepreneurDeductions: number,
      profitAfterEntrepreneurDeductions: number,
      mkbWinstvrijstelling: number,
      taxableProfit: number,
      zvwContribution: number,
      zvwCap: number,
      zvwRate: number,
      pensionDeduction: number,
      taxableIncomeBox1: number,
      box1GrossTax: number,
      algemeneHeffingskorting: number,
      arbeidskorting: number,
      totalTaxCredits: number,
      finalBox1Tax: number,
      netAnnual: number,
      netMonthly: number,
      netWeekly: number,
      netDaily: number,
      netHourly: number,
      effectiveTaxRate: number,
      netMargin: number,
      breakdownPeriods: {
        year: { revenue, expenses, profit, zvw, tax, net },
        quarter: { ... },
        month: { ... },
        week: { ... },
        day: { ... },
        hour: { ... }
      }
    }
    ```

- [ ] **Step 1: Write the failing tests**

```javascript
// tests/tax-engine.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateZZPTax } from '../js/tax-engine.js';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/tax-engine.test.js`
Expected: FAIL ("Cannot find module '../js/tax-engine.js'")

- [ ] **Step 3: Implement `js/tax-engine.js`**

Implement full pure functional calculation with 2025/2026 bracket logic, tax credit formulas, period breakdown generator, and defensive zero-clipping.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/tax-engine.test.js`
Expected: PASS (all 5 tests passing)

- [ ] **Step 5: Commit**

```bash
git add js/tax-engine.js tests/tax-engine.test.js
git commit -m "feat: implement pure mathematical Dutch ZZP tax engine and tests"
```

---

### Task 2: Modern Responsive HTML Shell & Styling (`index.html`)

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: Tailwind CSS (via CDN)
- Produces: Semantic HTML elements with IDs matching `tax-engine.js` parameters and results for `app.js` bindings:
  - Inputs: `taxYear2026`, `taxYear2025`, `modeHourly`, `modeAnnual`, `hourlyRate`, `billableHours`, `annualRevenue`, `expenses`, `aov`, `pension`, `urencriterium`, `startersaftrek`, `hoursDisplay`.
  - Rate preset chips: buttons with data attributes.
  - Results:
    - Hero cards: `netMonthly`, `netAnnual`, `effectiveRateBadge`, `netMarginBadge`.
    - Period switcher tabs: `tabYear`, `tabQuarter`, `tabMonth`, `tabWeek`, `tabDay`, `tabHour`.
    - Period summary table values: `periodGross`, `periodExpenses`, `periodTaxable`, `periodZvw`, `periodTax`, `periodNet`.
    - Visual bar: `distNetBar`, `distTaxBar`, `distExpBar`, `distPensionBar`, with percent labels.
    - Full step-by-step breakdown table: `outRevenue`, `outExpenses`, `outProfitBefore`, `outZA`, `outStarters`, `outMKB`, `outTaxableProfit`, `outZvw`, `outPensionDed`, `outTaxableIncome`, `outBox1Gross`, `outCredits`, `outTax`, `outNetTakeHome`.
    - Action controls: `btnCopyLink`, `btnReset`, `toastNotification`.

- [ ] **Step 1: Write `index.html` with Tailwind layout, clear typography, and accessible structure**
- [ ] **Step 2: Verify HTML syntax and element IDs**
- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: create modern responsive thetax.nl-style UI shell"
```

---

### Task 3: Interactive UI Controller, Period Switcher & URL Sync (`js/app.js`)

**Files:**
- Create: `js/app.js`

**Interfaces:**
- Consumes: `calculateZZPTax` from `js/tax-engine.js`
- Connects to: DOM elements in `index.html`
- Features:
  - Event listeners on all inputs (`input`, `change`) triggering debounced/instant `recalculateAndRender()`.
  - Hourly presets click handler (updates hourly rate input and recalculates).
  - Mode toggle: switches between hourly rate + hours view and direct annual revenue view.
  - Active period tab switcher: updates the thetax.nl-style period breakdown view (Year, Quarter, Month, Week, Day, Hour).
  - URL hash syncing: reads inputs from `#rate=135&hours=1500...` on load; updates URL hash so users can bookmark and share configurations.
  - Share link button: copies URL to clipboard with friendly toast notification.
  - Reset button: restores default 2026 settings.

- [ ] **Step 1: Implement `js/app.js`**
- [ ] **Step 2: Test script loading in browser / check syntax with `node -c js/app.js`**
- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: implement reactive UI controller, period switcher, and URL sharing"
```

---

### Task 4: Documentation, Verification & Git Integration

**Files:**
- Create: `README.md`
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore` ignoring OS files and temp files**
- [ ] **Step 2: Create comprehensive `README.md`**
  - Document project overview, Dutch tax rules summary (2025 vs 2026), live GitHub Pages link, and how to test locally.
- [ ] **Step 3: Run automated test suite**
  - Run `node --test tests/tax-engine.test.js` to ensure 100% test pass.
- [ ] **Step 4: Commit**

```bash
git add README.md .gitignore
git commit -m "docs: add project README and gitignore"
```

---

### Task 5: GitHub Repository Creation & GitHub Pages Deployment

**Files:**
- Remote: `https://github.com/towerrelay007/dutch-zzp-tax-calculator`

- [ ] **Step 1: Create public GitHub repository using `gh`**
  - Run `gh repo create towerrelay007/dutch-zzp-tax-calculator --public --source=. --remote=origin --push`
- [ ] **Step 2: Enable GitHub Pages on `main` branch**
  - Run `gh api -X POST /repos/towerrelay007/dutch-zzp-tax-calculator/pages -f source='{"branch":"main","path":"/"}'` or verify GitHub Pages status via `gh api /repos/towerrelay007/dutch-zzp-tax-calculator/pages`.
- [ ] **Step 3: Verify repository and live GitHub Pages URL accessibility**
  - Live URL: `https://towerrelay007.github.io/dutch-zzp-tax-calculator/`
