# 🇳🇱 Dutch ZZP & Freelance Tax Calculator (2025 & 2026)

A clean, responsive, single-page net income and Dutch tax calculator inspired by **thetax.nl**, specifically built for Dutch sole proprietors (*ZZP'ers* and *eenmanszaken*).

**Live Calculator:** [https://towerrelay007.github.io/dutch-zzp-tax-calculator/](https://towerrelay007.github.io/dutch-zzp-tax-calculator/)

---

## ✨ Features

- **Bilingual Interface (English 🇬🇧 & Dutch 🇳🇱):** Seamless one-click switching between English and official Dutch fiscal terminology, with language preferences saved to `localStorage` and URL hash.
- **thetax.nl Period View:** Switch between **Year**, **Quarter**, **Month**, **Week**, **Day**, and **Hour** breakdowns for instant financial clarity.
- **Tax Years 2025 & 2026:** Toggle between 2025 and 2026 tax plans with accurate statutory brackets and deductions.
- **Dual Input Modes:** Calculate based on **Hourly Rate + Billable Hours** or direct **Annual Turnover**.
- **Accurate Dutch Tax Model:**
  - **Zelfstandigenaftrek:** €1,200 (2026) / €2,470 (2025) under the urencriterium (≥ 1,225 hours).
  - **Startersaftrek:** Optional €2,123 starter deduction for your first 3 years.
  - **MKB-Winstvrijstelling:** 12.70% profit exemption for small businesses.
  - **Zvw Healthcare Contribution:** 4.85% (2026, capped at €79,409) / 5.32% (2025, capped at €75,860).
  - **Box 1 Income Tax:** Official 3-bracket system with statutory rates.
  - **Heffingskortingen:** Phased Algemene Heffingskorting (General Tax Credit) and Arbeidskorting (Labor Tax Credit).
- **Retirement & Insurance Deductions:** Deductible AOV (disability insurance) and Pension/Lijfrente (jaarruimte/reserveringsruimte).
- **Revenue Distribution Visualization:** Color-coded distribution bar displaying your revenue breakdown (Net income, Tax/Zvw, Pension, Expenses).
- **URL Bookmark & Share:** Inputs automatically synchronize with the URL hash for easy sharing and saving.
- **Zero-Build Architecture:** Pure HTML5, modern vanilla JavaScript (ES modules), and Tailwind CSS with no npm build dependencies required.

---

## 🧮 Dutch ZZP Tax Comparison (2025 vs. 2026)

| Parameter | 2025 Rules | 2026 Rules |
| :--- | :--- | :--- |
| **Zelfstandigenaftrek** | €2,470 (≥ 1,225 hrs) | €1,200 (≥ 1,225 hrs) |
| **Startersaftrek** | €2,123 | €2,123 |
| **MKB-Winstvrijstelling** | 12.70% | 12.70% |
| **Zvw Rate (Freelancers)** | 5.32% (max base €75,860) | 4.85% (max base €79,409) |
| **Box 1 Bracket 1** | €0 – €38,441 @ 35.82% | €0 – €38,883 @ 35.75% |
| **Box 1 Bracket 2** | €38,441 – €76,817 @ 37.48% | €38,883 – €78,426 @ 37.56% |
| **Box 1 Bracket 3** | Above €76,817 @ 49.50% | Above €78,426 @ 49.50% |
| **General Tax Credit (AHK)** | Max €3,068 | Max €3,115 |

---

## 🚀 Local Development & Testing

Since this project has no build step, you can run and test it directly in your browser:

### Run Locally
Using Python's built-in web server:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Run Automated Tests
Unit tests use the native Node.js test runner to verify calculation accuracy against official Dutch tax rules:
```bash
npm test
# or:
node --test tests/*.test.js
```

---

## 📄 License

MIT © [towerrelay007](https://github.com/towerrelay007)
