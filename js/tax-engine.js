/**
 * Pure mathematical Dutch ZZP tax calculator engine for years 2025 and 2026.
 * Implements Box 1 brackets, general tax credit (Algemene heffingskorting),
 * labor credit (Arbeidskorting), entrepreneurial deductions (Zelfstandigenaftrek & Startersaftrek),
 * MKB-winstvrijstelling, and Zvw healthcare contribution.
 */

export const TAX_CONFIG = {
  2026: {
    year: 2026,
    b1Limit: 38883,
    b2Limit: 78426,
    r1: 0.3575,
    r2: 0.3756,
    r3: 0.4950,
    mkbRate: 0.1270,
    zelfstandigenaftrek: 1200,
    startersaftrek: 2123,
    zvwRate: 0.0485,
    zvwCap: 79409,
    maxAlgemeneHeffingskorting: 3115,
    ahkThreshold: 29736,
    ahkRate: 0.06398,
    calculateArbeidskorting: (income) => {
      if (income <= 0) return 0;
      if (income <= 11965) {
        return income * 0.08324;
      } else if (income <= 25845) {
        return 996 + 0.31009 * (income - 11965);
      } else if (income <= 45592) {
        return 5300 + 0.01950 * (income - 25845);
      } else if (income <= 132920) {
        return Math.max(0, 5685 - 0.06510 * (income - 45592));
      }
      return 0;
    }
  },
  2025: {
    year: 2025,
    b1Limit: 38441,
    b2Limit: 76817,
    r1: 0.3582,
    r2: 0.3748,
    r3: 0.4950,
    mkbRate: 0.1270,
    zelfstandigenaftrek: 2470,
    startersaftrek: 2123,
    zvwRate: 0.0532,
    zvwCap: 75860,
    maxAlgemeneHeffingskorting: 3068,
    ahkThreshold: 28406,
    ahkRate: 0.06337,
    calculateArbeidskorting: (income) => {
      if (income <= 0) return 0;
      if (income <= 11490) {
        return income * 0.08425;
      } else if (income <= 24820) {
        return 968 + 0.31433 * (income - 11490);
      } else if (income <= 43770) {
        return 5158 + 0.02471 * (income - 24820);
      } else if (income <= 127916) {
        return Math.max(0, 5626 - 0.06510 * (income - 43770));
      }
      return 0;
    }
  }
};

/**
 * Calculates Box 1 tax, general tax credit, and labor tax credit.
 */
export function calculateBox1Tax(taxableIncome, laborIncome, config) {
  if (taxableIncome <= 0) {
    return {
      grossTax: 0,
      algemeneHeffingskorting: 0,
      arbeidskorting: 0,
      totalTaxCredits: 0,
      finalTax: 0
    };
  }

  let grossTax = 0;
  if (taxableIncome <= config.b1Limit) {
    grossTax = taxableIncome * config.r1;
  } else if (taxableIncome <= config.b2Limit) {
    grossTax = (config.b1Limit * config.r1) + ((taxableIncome - config.b1Limit) * config.r2);
  } else {
    grossTax = (config.b1Limit * config.r1) +
               ((config.b2Limit - config.b1Limit) * config.r2) +
               ((taxableIncome - config.b2Limit) * config.r3);
  }

  // Algemene Heffingskorting
  let ahk = config.maxAlgemeneHeffingskorting;
  if (taxableIncome > config.ahkThreshold) {
    ahk = Math.max(0, config.maxAlgemeneHeffingskorting - config.ahkRate * (taxableIncome - config.ahkThreshold));
  }

  // Arbeidskorting (based on labor income / profit)
  const arbeidskorting = config.calculateArbeidskorting(laborIncome || taxableIncome);

  const totalCredits = Math.min(grossTax, ahk + arbeidskorting);
  const finalTax = Math.max(0, grossTax - totalCredits);

  return {
    grossTax,
    algemeneHeffingskorting: ahk,
    arbeidskorting,
    totalTaxCredits: totalCredits,
    finalTax
  };
}

/**
 * Main calculation function for ZZP tax.
 */
export function calculateZZPTax(inputs = {}) {
  const taxYear = inputs.taxYear === 2025 ? 2025 : 2026;
  const config = TAX_CONFIG[taxYear];

  const calculationMode = inputs.calculationMode === 'annual' ? 'annual' : 'hourly';
  const hourlyRate = Math.max(0, parseFloat(inputs.hourlyRate) || 0);
  const billableHours = Math.max(0, parseFloat(inputs.billableHours) || 0);
  const annualRevenueInput = Math.max(0, parseFloat(inputs.annualRevenue) || 0);

  const grossRevenue = calculationMode === 'annual'
    ? annualRevenueInput
    : hourlyRate * billableHours;

  const operatingExpenses = Math.max(0, parseFloat(inputs.operatingExpenses) || 0);
  const aovInsurance = Math.max(0, parseFloat(inputs.aovInsurance) || 0);
  const pensionContribution = Math.max(0, parseFloat(inputs.pensionContribution) || 0);

  const totalExpenses = operatingExpenses + aovInsurance;
  const profitBeforeDeductions = Math.max(0, grossRevenue - totalExpenses);

  const hasUrencriterium = Boolean(inputs.hasUrencriterium);
  const hasStartersaftrek = Boolean(inputs.hasStartersaftrek);

  let zelfstandigenaftrek = 0;
  let startersaftrek = 0;

  if (hasUrencriterium && profitBeforeDeductions > 0) {
    zelfstandigenaftrek = Math.min(profitBeforeDeductions, config.zelfstandigenaftrek);
    const remainingForStarters = profitBeforeDeductions - zelfstandigenaftrek;
    if (hasStartersaftrek && remainingForStarters > 0) {
      startersaftrek = Math.min(remainingForStarters, config.startersaftrek);
    }
  }

  const totalEntrepreneurDeductions = zelfstandigenaftrek + startersaftrek;
  const profitAfterEntrepreneurDeductions = Math.max(0, profitBeforeDeductions - totalEntrepreneurDeductions);

  // MKB-winstvrijstelling (12.7%)
  const mkbWinstvrijstelling = profitAfterEntrepreneurDeductions * config.mkbRate;
  const taxableProfit = Math.max(0, profitAfterEntrepreneurDeductions - mkbWinstvrijstelling);

  // Zvw Healthcare Tax (capped)
  const zvwBase = Math.min(taxableProfit, config.zvwCap);
  const zvwContribution = zvwBase * config.zvwRate;

  // Box 1 Taxable Income
  const taxableIncomeBox1 = Math.max(0, taxableProfit - pensionContribution);

  // Box 1 Income Tax
  const box1Result = calculateBox1Tax(taxableIncomeBox1, profitAfterEntrepreneurDeductions, config);

  // Net annual take-home
  const netAnnual = grossRevenue - totalExpenses - zvwContribution - box1Result.finalTax - pensionContribution;
  const netMonthly = netAnnual / 12;

  // Period divisions
  // Standard full-time freelance model: 48 weeks/year
  const workingWeeks = 48;
  const workingHoursPerWeek = billableHours > 0 ? (billableHours / workingWeeks) : 36;
  const workingDaysPerWeek = Math.max(1, Math.min(7, workingHoursPerWeek / 8));
  const workingDaysPerYear = workingWeeks * workingDaysPerWeek;

  const periods = {
    year: {
      factor: 1,
      revenue: grossRevenue,
      expenses: totalExpenses,
      profit: profitBeforeDeductions,
      zvw: zvwContribution,
      tax: box1Result.finalTax,
      pension: pensionContribution,
      net: netAnnual
    },
    quarter: {
      factor: 4,
      revenue: grossRevenue / 4,
      expenses: totalExpenses / 4,
      profit: profitBeforeDeductions / 4,
      zvw: zvwContribution / 4,
      tax: box1Result.finalTax / 4,
      pension: pensionContribution / 4,
      net: netAnnual / 4
    },
    month: {
      factor: 12,
      revenue: grossRevenue / 12,
      expenses: totalExpenses / 12,
      profit: profitBeforeDeductions / 12,
      zvw: zvwContribution / 12,
      tax: box1Result.finalTax / 12,
      pension: pensionContribution / 12,
      net: netMonthly
    },
    week: {
      factor: workingWeeks,
      revenue: grossRevenue / workingWeeks,
      expenses: totalExpenses / workingWeeks,
      profit: profitBeforeDeductions / workingWeeks,
      zvw: zvwContribution / workingWeeks,
      tax: box1Result.finalTax / workingWeeks,
      pension: pensionContribution / workingWeeks,
      net: netAnnual / workingWeeks
    },
    day: {
      factor: workingDaysPerYear,
      revenue: workingDaysPerYear > 0 ? grossRevenue / workingDaysPerYear : 0,
      expenses: workingDaysPerYear > 0 ? totalExpenses / workingDaysPerYear : 0,
      profit: workingDaysPerYear > 0 ? profitBeforeDeductions / workingDaysPerYear : 0,
      zvw: workingDaysPerYear > 0 ? zvwContribution / workingDaysPerYear : 0,
      tax: workingDaysPerYear > 0 ? box1Result.finalTax / workingDaysPerYear : 0,
      pension: workingDaysPerYear > 0 ? pensionContribution / workingDaysPerYear : 0,
      net: workingDaysPerYear > 0 ? netAnnual / workingDaysPerYear : 0
    },
    hour: {
      factor: billableHours,
      revenue: billableHours > 0 ? (grossRevenue / billableHours) : 0,
      expenses: billableHours > 0 ? (totalExpenses / billableHours) : 0,
      profit: billableHours > 0 ? (profitBeforeDeductions / billableHours) : 0,
      zvw: billableHours > 0 ? (zvwContribution / billableHours) : 0,
      tax: billableHours > 0 ? (box1Result.finalTax / billableHours) : 0,
      pension: billableHours > 0 ? (pensionContribution / billableHours) : 0,
      net: billableHours > 0 ? (netAnnual / billableHours) : 0
    }
  };

  const effectiveTaxRate = profitBeforeDeductions > 0
    ? ((box1Result.finalTax + zvwContribution) / profitBeforeDeductions) * 100
    : 0;

  const netMargin = grossRevenue > 0
    ? (netAnnual / grossRevenue) * 100
    : 0;

  return {
    inputs: {
      taxYear,
      calculationMode,
      hourlyRate,
      billableHours,
      annualRevenue: annualRevenueInput,
      operatingExpenses,
      aovInsurance,
      pensionContribution,
      hasUrencriterium,
      hasStartersaftrek
    },
    grossRevenue,
    totalExpenses,
    profitBeforeDeductions,
    zelfstandigenaftrek,
    startersaftrek,
    totalEntrepreneurDeductions,
    profitAfterEntrepreneurDeductions,
    mkbWinstvrijstelling,
    taxableProfit,
    zvwContribution,
    zvwCap: config.zvwCap,
    zvwRate: config.zvwRate,
    pensionDeduction: pensionContribution,
    taxableIncomeBox1,
    box1GrossTax: box1Result.grossTax,
    algemeneHeffingskorting: box1Result.algemeneHeffingskorting,
    arbeidskorting: box1Result.arbeidskorting,
    totalTaxCredits: box1Result.totalTaxCredits,
    finalBox1Tax: box1Result.finalTax,
    netAnnual,
    netMonthly,
    netWeekly: periods.week.net,
    netDaily: periods.day.net,
    netHourly: periods.hour.net,
    effectiveTaxRate,
    netMargin,
    breakdownPeriods: periods
  };
}
