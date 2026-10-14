/**
 * Internationalization (i18n) translation dictionary and helpers
 * Supporting English (en) and Dutch (nl).
 */

export const TRANSLATIONS = {
  en: {
    // Header
    appTitle: "Dutch ZZP Tax Calculator",
    thetaxBadge: "thetax style",
    appSubtitle: "Calculate net take-home pay, Box 1 income tax, Zvw healthcare tax, and deductions for Dutch sole proprietors (eenmanszaken).",
    shareBtn: "Share",
    resetBtn: "Reset",
    linkCopied: "Link copied to clipboard!",
    linkCopyFailed: "Could not copy link automatically",
    resetToast: "Reset to default values",

    // Input Modes & Presets
    businessInputsTitle: "💼 Business Inputs",
    modeHourly: "Hourly Rate",
    modeAnnual: "Annual Revenue",
    hourlyRateLabel: "Hourly Rate (€ / hr ex. VAT)",
    exBtw: "excl. 21% btw",
    billableHoursLabel: "Billable Hours / Year",
    billableHoursHelp: "Full-time standard freelance is ~1,400 to 1,600 billable hours across 48 weeks.",
    hoursDisplay: "{wkHours} hrs/wk (~{days} days)",
    annualRevenueLabel: "Annual Gross Turnover (€)",
    annualRevenueHelp: "excl. VAT / BTW",
    expensesLabel: "Operating Expenses (€ / year)",
    expensesHelp: "Equipment, laptop, accountant, software, subscriptions, mobile, travel.",
    aovLabel: "AOV Disability Insurance (€ / year)",
    aovHelp: "Arbeidsongeschiktheidsverzekering premiums are 100% tax-deductible.",
    pensionLabel: "Pension / Lijfrente (€ / year)",
    pensionHelp: "Tax-deductible retirement deposit (jaarruimte / reserveringsruimte).",
    urencriteriumTitle: "Urencriterium (≥ 1,225 hrs)",
    zaLabel2026: "Unlocks €1,200 Zelfstandigenaftrek",
    zaLabel2025: "Unlocks €2,470 Zelfstandigenaftrek",
    startersaftrekTitle: "Startersaftrek",
    startersaftrekSub: "Extra €2,123 deduction (first 3 yrs)",

    // Hero Take-Home Banner
    takeHomeHeader: "Estimated Net Take-Home",
    perMonth: "/ month",
    annualNetCash: "annual net cash in pocket",
    taxRateBadge: "{rate}% Tax Rate",
    netMarginBadge: "{margin}% Net Margin",

    // Period Breakdown
    periodBreakdownTitle: "⏱️ Period Breakdown",
    tabYear: "Year",
    tabQuarter: "Quarter",
    tabMonth: "Month",
    tabWeek: "Week",
    tabDay: "Day",
    tabHour: "Hour",
    periodGrossLabel: "Gross Revenue",
    periodExpensesLabel: "Expenses & AOV",
    periodTaxableLabel: "Taxable Profit",
    periodZvwLabel: "Zvw Health Premie",
    periodTaxLabel: "Box 1 Income Tax",
    periodNetLabel: "Net Take-Home",

    // Revenue Distribution
    distTitle: "Where Does Your Turnover Go?",
    distNet: "Net Take-Home:",
    distTax: "Tax & Zvw:",
    distPension: "Pension:",
    distExp: "Expenses:",

    // Detailed Table
    detailedTitle: "📊 Detailed Dutch Tax Breakdown",
    activeYearBadge: "Tax Year {year}",
    rowRevenue: "Gross Turnover (Omzet)",
    rowExpenses: "Operating Expenses & AOV Insurance",
    rowProfitBefore: "Gross Business Profit (Winst uit onderneming)",
    rowZA: "Zelfstandigenaftrek",
    rowStarters: "Startersaftrek",
    rowMKB: "MKB-Winstvrijstelling (12.7%)",
    rowTaxableProfit: "Taxable Business Profit (Fiscale Winst)",
    rowZvw: "Zvw Healthcare Tax ({rate}%)",
    rowPension: "Pension / Lijfrente Deduction",
    rowTaxableIncome: "Taxable Income (Box 1)",
    rowBox1Gross: "Gross Box 1 Tax (before credits)",
    rowCredits: "Applied Tax Credits (Heffingskortingen)",
    rowTax: "Final Box 1 Income Tax",
    rowNetTakeHome: "Annual Net Disposable Cash",

    // Tooltip Explanations
    tipZA: "Tax deduction for entrepreneurs who work at least 1,225 hours per year in their business. €1,200 in 2026 (€2,470 in 2025).",
    tipStarters: "Additional tax deduction of €2,123 for starting entrepreneurs, applicable in at most 3 of your first 5 years.",
    tipMKB: "Tax exemption of 12.7% on your business profit after deducting Zelfstandigenaftrek & Startersaftrek.",
    tipZvw: "Mandatory income-dependent healthcare contribution. In 2026: 4.85% capped at €79,409 base (max €3,851). In 2025: 5.32% capped at €75,860.",
    tipPension: "Tax-deductible deposits into an approved private annuity / pension account (lijfrente) within your annual allowance (jaarruimte).",
    tipAOV: "Premiums paid for an individual disability insurance policy (AOV) are 100% tax-deductible in Box 1.",
    tipUrencriterium: "Requirement to spend at least 1,225 hours per calendar year on business activities to qualify for entrepreneurial deductions.",
    tipCredits: "Direct reductions on Box 1 income tax: General Tax Credit (Algemene heffingskorting) and Labor Tax Credit (Arbeidskorting).",
    tipFiscaleWinst: "Taxable business profit after deducting operating expenses, entrepreneurial deductions, and the 12.7% MKB exemption.",
    tipTaxableIncome: "Box 1 taxable income (Fiscale winst minus deductible pension contributions).",

    // Footer
    footerDisclaimer: "Disclaimer: This calculator provides realistic estimates based on Dutch Ministry of Finance (Belastingdienst) rules for 2025 and 2026. Consult a registered Dutch tax adviser (belastingadviseur) for individual filings.",
    footerSource: "GitHub Source",
    footerBuildNote: "Built with zero build tools. Uses vanilla JS and Tailwind CSS. Hosted on GitHub Pages."
  },

  nl: {
    // Header
    appTitle: "Nederlandse ZZP Belastingcalculator",
    thetaxBadge: "thetax stijl",
    appSubtitle: "Bereken je netto besteedbaar inkomen, Box 1 inkomstenbelasting, Zvw premie en ondernemersaftrek voor ZZP en eenmanszaken.",
    shareBtn: "Delen",
    resetBtn: "Herstellen",
    linkCopied: "Link gekopieerd naar klembord!",
    linkCopyFailed: "Kon link niet automatisch kopiëren",
    resetToast: "Hersteld naar standaardwaarden",

    // Input Modes & Presets
    businessInputsTitle: "💼 Bedrijfsgegevens",
    modeHourly: "Uurtarief",
    modeAnnual: "Jaaromzet",
    hourlyRateLabel: "Uurtarief (€ / uur excl. btw)",
    exBtw: "excl. 21% btw",
    billableHoursLabel: "Declarabele uren per jaar",
    billableHoursHelp: "Standaard fulltime freelance is ~1.400 tot 1.600 declarabele uren over 48 weken.",
    hoursDisplay: "{wkHours} uur/wk (~{days} dagen)",
    annualRevenueLabel: "Bruto jaaromzet (€)",
    annualRevenueHelp: "excl. btw",
    expensesLabel: "Zakelijke kosten (€ / jaar)",
    expensesHelp: "Apparatuur, laptop, boekhouder, software, abonnementen, telefoon, reiskosten.",
    aovLabel: "AOV Arbeidsongeschiktheid (€ / jaar)",
    aovHelp: "Premies voor een arbeidsongeschiktheidsverzekering zijn 100% fiscaal aftrekbaar.",
    pensionLabel: "Pensioen / Lijfrente (€ / jaar)",
    pensionHelp: "Fiscaal aftrekbare inleg voor oudedagsvoorziening (jaarruimte / reserveringsruimte).",
    urencriteriumTitle: "Urencriterium (≥ 1.225 uur)",
    zaLabel2026: "Geeft recht op €1.200 Zelfstandigenaftrek",
    zaLabel2025: "Geeft recht op €2.470 Zelfstandigenaftrek",
    startersaftrekTitle: "Startersaftrek",
    startersaftrekSub: "Extra €2.123 aftrek (eerste 3 jaar)",

    // Hero Take-Home Banner
    takeHomeHeader: "Geschat Netto Inkomen",
    perMonth: "/ maand",
    annualNetCash: "jaarlijks netto besteedbaar",
    taxRateBadge: "{rate}% Effectieve Druk",
    netMarginBadge: "{margin}% Netto Marge",

    // Period Breakdown
    periodBreakdownTitle: "⏱️ Periode Overzicht",
    tabYear: "Jaar",
    tabQuarter: "Kwartaal",
    tabMonth: "Maand",
    tabWeek: "Week",
    tabDay: "Dag",
    tabHour: "Uur",
    periodGrossLabel: "Bruto Omzet",
    periodExpensesLabel: "Kosten & AOV",
    periodTaxableLabel: "Fiscale Winst",
    periodZvwLabel: "Zvw Zorgpremie",
    periodTaxLabel: "Inkomstenbelasting Box 1",
    periodNetLabel: "Netto Besteedbaar",

    // Revenue Distribution
    distTitle: "Waar gaat je omzet naartoe?",
    distNet: "Netto inkomen:",
    distTax: "Belasting & Zvw:",
    distPension: "Pensioen:",
    distExp: "Zakelijke kosten:",

    // Detailed Table
    detailedTitle: "📊 Gedetailleerde Fiscale Berekening",
    activeYearBadge: "Belastingjaar {year}",
    rowRevenue: "Bruto omzet (omzet ex. btw)",
    rowExpenses: "Zakelijke kosten & AOV premie",
    rowProfitBefore: "Winst uit onderneming (voor aftrek)",
    rowZA: "Zelfstandigenaftrek",
    rowStarters: "Startersaftrek",
    rowMKB: "MKB-winstvrijstelling (12,7%)",
    rowTaxableProfit: "Belastbare winst uit onderneming",
    rowZvw: "Zorgverzekeringswet premie ({rate}%)",
    rowPension: "Aftrekbare pensioeninleg (Lijfrente)",
    rowTaxableIncome: "Belastbaar inkomen uit werk en woning (Box 1)",
    rowBox1Gross: "Bruto inkomstenbelasting (voor heffingskorting)",
    rowCredits: "Toegepaste heffingskortingen (AHK + Arbeidskorting)",
    rowTax: "Te betalen inkomstenbelasting Box 1",
    rowNetTakeHome: "Jaarlijks netto besteedbaar inkomen",

    // Tooltip Explanations
    tipZA: "Fiscale aftrekpost voor ondernemers die minimaal 1.225 uur per kalenderjaar aan hun bedrijf besteden. €1.200 in 2026 (€2.470 in 2025).",
    tipStarters: "Aanvullende aftrek van €2.123 voor startende ondernemers, maximaal 3 keer toepasbaar in de eerste 5 jaar.",
    tipMKB: "Fiscale vrijstelling van 12,7% over de winst na aftrek van Zelfstandigenaftrek en Startersaftrek.",
    tipZvw: "Verplichte inkomensafhankelijke bijdrage Zorgverzekeringswet. In 2026: 4,85% tot max €79.409 grondslag (max €3.851). In 2025: 5,32% tot €75.860.",
    tipPension: "Fiscaal aftrekbare stortingen in een lijfrente- of pensioenrekening binnen je jaarruimte / reserveringsruimte.",
    tipAOV: "Betaalde premies voor een individuele arbeidsongeschiktheidsverzekering (AOV) zijn 100% fiscaal aftrekbaar in Box 1.",
    tipUrencriterium: "Voorwaarde om minimaal 1.225 uur per kalenderjaar aan je onderneming te besteden om recht te hebben op ondernemersaftrek.",
    tipCredits: "Directe verminderingen op de te betalen Box 1 belasting: Algemene heffingskorting en Arbeidskorting.",
    tipFiscaleWinst: "Belastbare winst uit onderneming na aftrek van kosten, ondernemersaftrek en de 12,7% MKB-winstvrijstelling.",
    tipTaxableIncome: "Belastbaar inkomen uit werk en woning (Fiscale winst minus aftrekbare pensioeninleg).",

    // Footer
    footerDisclaimer: "Disclaimer: Deze calculator biedt realistische schattingen op basis van de officiële Belastingdienst regels voor 2025 en 2026. Raadpleeg een geregistreerd belastingadviseur voor definitieve aangiften.",
    footerSource: "Broncode op GitHub",
    footerBuildNote: "Gebouwd zonder build-tools. Pure vanilla JS en Tailwind CSS. Gehost op GitHub Pages."
  }
};

/**
 * Returns translation for a given key, language, and optional variables.
 */
export function t(key, lang = 'en', vars = {}) {
  const bundle = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let text = bundle[key] || TRANSLATIONS.en[key] || key;

  if (vars && typeof vars === 'object') {
    Object.keys(vars).forEach(varKey => {
      text = text.replaceAll(`{${varKey}}`, vars[varKey]);
    });
  }

  return text;
}
