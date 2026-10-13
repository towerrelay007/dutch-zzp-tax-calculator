# Dutch ZZP Tax Calculator (thetax.nl Style) — Design Specification

## Overview
A fast, responsive, modern single-page web application designed for Dutch ZZP'ers (freelancers and sole proprietors / *eenmanszaken*) to calculate their net take-home income, income tax (Box 1), healthcare premium (Zvw), entrepreneurial deductions, and social contributions for tax years 2025 and 2026.

The design takes inspiration from **thetax.nl** with period breakdown tabs (Year, Month, Week, Day, Hour), clean financial tables, visual distribution charts, informative tooltips, and URL state bookmarking, delivered as a zero-dependency static site hosted on GitHub Pages.

---

## 1. Architecture & Technology Stack

- **Frontend Core:** Clean semantic HTML5, modern vanilla JavaScript (ES modules).
- **Styling:** Tailwind CSS (via official modern script / CDN).
- **Zero-Build Architecture:** No `package.json`, bundlers, or build pipelines required to run or deploy. Opens directly in any browser.
- **Testing:** Pure Node.js unit tests using the native Node.js test runner (`node --test`) to verify financial calculations without external testing dependencies.
- **Hosting & CI/CD:** Hosted directly on GitHub Pages (`https://towerrelay007.github.io/dutch-zzp-tax-calculator/`) from the `main` branch of public repository `towerrelay007/dutch-zzp-tax-calculator`.

### File Structure
```
dutch-zzp-tax-calculator/
├── index.html                               # Responsive application UI & Tailwind layout
├── js/
│   ├── tax-engine.js                        # Pure mathematical Dutch tax engine (2025 & 2026)
│   └── app.js                               # State management, DOM events, period views & URL sync
├── tests/
│   └── tax-engine.test.js                   # Unit tests covering tax brackets, credits & deductions
├── docs/
│   └── superpowers/specs/
│       └── 2026-10-13-dutch-zzp-tax-calculator-design.md
├── README.md                                # Project documentation, tax guide, and live links
└── .gitignore
```

---

## 2. Tax Engine Specification & Dutch Rules (2025 & 2026)

### 2.1 Inputs
- `taxYear`: `2026` or `2025`
- `calculationMode`: `hourly` (hourly rate + billable hours) or `annual` (direct gross turnover)
- `hourlyRate`: Hourly rate in EUR (default: €135)
- `billableHours`: Annual billable hours (default: 1,500)
- `annualRevenue`: Direct annual turnover if in annual mode
- `operatingExpenses`: Annual business costs (software, equipment, travel, accounting; default: €10,000)
- `aovInsurance`: Annual disability insurance premium (default: €5,000)
- `pensionContribution`: Annual deductible pension/lijfrente deposit (default: €15,000)
- `hasUrencriterium`: Boolean; eligibility for entrepreneurial deductions (requires ≥ 1,225 hours)
- `hasStartersaftrek`: Boolean; eligibility for starter deduction (first 3 years of entrepreneurship)

### 2.2 Parameters by Year

| Parameter | 2025 | 2026 |
| :--- | :--- | :--- |
| **Zelfstandigenaftrek** | €2,470 | €1,200 |
| **Startersaftrek** | €2,123 | €2,123 |
| **MKB-Winstvrijstelling** | 12.70% | 12.70% |
| **Zvw Rate (Freelance/ZZP)** | 5.32% | 4.85% |
| **Zvw Maximum Base** | €75,860 | €79,409 |
| **Box 1 Bracket 1 Limit** | €38,441 @ 35.82% | €38,883 @ 35.75% |
| **Box 1 Bracket 2 Limit** | €76,817 @ 37.48% | €78,426 @ 37.56% |
| **Box 1 Bracket 3 Rate** | > €76,817 @ 49.50% | > €78,426 @ 49.50% |
| **Max Algemene Heffingskorting** | €3,068 (phase-out > €28,406 @ 6.337%) | €3,115 (phase-out > €29,736 @ 6.398%) |
| **Arbeidskorting** | 2025 official tiered schedule | 2026 official tiered schedule |

### 2.3 Formula & Sequential Order
1. **Gross Revenue ($R$):**
   $$R = \text{hourlyRate} \times \text{billableHours} \quad (\text{or } \text{annualRevenue})$$
2. **Gross Business Profit ($P$):**
   $$P = \max(0, R - (\text{operatingExpenses} + \text{aovInsurance}))$$
3. **Entrepreneurial Deductions ($D_{\text{ent}}$):**
   - If `hasUrencriterium`: $D_{\text{ent}} = \text{zelfstandigenaftrek} + (\text{hasStartersaftrek} ? \text{startersaftrek} : 0)$.
   - Capped at profit: $D_{\text{ent}} = \min(P, D_{\text{ent}})$.
   - Profit after entrepreneurial deduction: $P_1 = P - D_{\text{ent}}$.
4. **MKB-Winstvrijstelling ($MKB$):**
   $$MKB = P_1 \times 0.127$$
   $$\text{Taxable Business Profit } P_{\text{tax}} = P_1 - MKB$$
5. **Zvw Contribution ($Zvw$):**
   $$Zvw = \min(P_{\text{tax}}, \text{zvwCap}) \times \text{zvwRate}$$
6. **Box 1 Taxable Income ($I$):**
   $$I = \max(0, P_{\text{tax}} - \text{pensionContribution})$$
7. **Box 1 Gross Tax ($T_{\text{gross}}$):**
   Calculated across brackets 1, 2, and 3 according to statutory limits and rates.
8. **Tax Credits ($Credits$):**
   $$\text{Credits} = \text{Algemene Heffingskorting}(I) + \text{Arbeidskorting}(P_1)$$
   $$\text{Final Box 1 Tax } T_{\text{net}} = \max(0, T_{\text{gross}} - \text{Credits})$$
9. **Annual Net Take-Home ($N_{\text{annual}}$):**
   $$N_{\text{annual}} = R - \text{operatingExpenses} - \text{aovInsurance} - Zvw - T_{\text{net}} - \text{pensionContribution}$$
10. **Period Conversions:**
    - Annual: $N_{\text{annual}}$
    - Monthly: $N_{\text{annual}} / 12$
    - Weekly: $N_{\text{annual}} / 48$ (standard 48 working weeks)
    - Daily: $N_{\text{annual}} / (48 \times (\text{weeklyHours} / 8))$
    - Hourly: $N_{\text{annual}} / \text{billableHours}$

---

## 3. UI/UX Design & Features

### 3.1 Two-Column Responsive Grid
- **Left Column (Inputs Card):**
  - Year selector pills: `2026` (Active default) / `2025`.
  - Mode selector: Hourly Rate vs Annual Revenue.
  - Quick-preset chips for hourly rates: €85, €100, €125, €150.
  - Hours per year input with real-time conversion label: `e.g. 1500 hrs = 31.3 hrs/wk (~3.9 days/wk)`.
  - Operating expenses, AOV disability insurance, Pension inputs.
  - Toggles with info badges for `Urencriterium` (≥ 1,225 hrs) and `Startersaftrek`.
  - "Share Calculation" button (encodes inputs into URL hash for one-click sharing).
  - "Reset Defaults" button.

- **Right Column (Results & Breakdown):**
  - **Hero Net Income Card:**
    - High-contrast gradient banner displaying primary monthly take-home income and secondary annual take-home income.
    - Badges for Effective Tax Rate (`(Tax + Zvw) / Profit`) and Net Margin (`Net / Revenue`).
  - **thetax.nl Period Switcher Tabs:**
    - Switchable tabs: **Year** | **Quarter** | **Month** | **Week** | **Day** | **Hour**.
    - Instant tabular breakdown for each period: Gross Revenue, Expenses, Taxable Base, Zvw, Income Tax, and Net Income.
  - **Revenue Distribution Bar:**
    - Stacked visual bar showing breakdown percentages: Net Take-Home (green), Taxes & Zvw (rose), Business Expenses (slate), Pension (indigo).
  - **Full Step-by-Step Dutch Tax Breakdown Table:**
    - Detailed accounting rows clearly tracing from Gross Revenue down to Net Take-Home with explainer tooltips for Dutch tax terminology.

---

## 4. Git, Deployment & Verification

1. **Git Initialization:**
   - Initialize git repo in project directory.
   - Initial commit with application files, tests, spec, and documentation.
2. **GitHub Repository Creation:**
   - Use `gh repo create towerrelay007/dutch-zzp-tax-calculator --public --source=. --remote=origin`.
   - Push to `main` branch.
3. **GitHub Pages Deployment:**
   - Enable GitHub Pages on `main` branch at root path `/`.
   - Live URL: `https://towerrelay007.github.io/dutch-zzp-tax-calculator/`.
4. **Verification:**
   - Unit tests run and verified via `node --test tests/tax-engine.test.js`.
   - Local HTTP server check to ensure interactive UI, calculation reactivity, and period tab switching operate without errors.
