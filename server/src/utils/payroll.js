import { round2 } from "./dates.js";

// Philippine payroll ESTIMATES for a semi-monthly cut-off (half of the monthly amount).
// Rates below are the commonly published employee shares; confirm them against the
// latest SSS, PhilHealth, Pag-IBIG and BIR tables before using this for real payroll.
const WORK_DAYS_PER_MONTH = 26;

// TRAIN-law annual income tax brackets (2023 onward).
function annualTax(t) {
  if (t <= 250000) return 0;
  if (t <= 400000) return (t - 250000) * 0.15;
  if (t <= 800000) return 22500 + (t - 400000) * 0.2;
  if (t <= 2000000) return 102500 + (t - 800000) * 0.25;
  if (t <= 8000000) return 402500 + (t - 2000000) * 0.3;
  return 2202500 + (t - 8000000) * 0.35;
}

export function computePay({ dailyRate = 0, daysWorked = 0, overtimeHours = 0, allowances = 0, otherDeductions = 0 }) {
  const basic = round2(dailyRate * daysWorked);
  const overtime = round2((dailyRate / 8) * 1.25 * overtimeHours);
  const gross = round2(basic + overtime + allowances);
  let sss = 0, philhealth = 0, pagibig = 0, tax = 0;
  if (gross > 0) {
    const monthly = dailyRate * WORK_DAYS_PER_MONTH;
    sss = round2((Math.min(Math.max(monthly, 5000), 35000) * 0.05) / 2);
    philhealth = round2((Math.min(Math.max(monthly, 10000), 100000) * 0.025) / 2);
    pagibig = round2((Math.min(monthly, 10000) * 0.02) / 2);
    const monthlyTaxable = Math.max(0, gross * 2 - (sss + philhealth + pagibig) * 2);
    tax = round2(annualTax(monthlyTaxable * 12) / 12 / 2);
  }
  const deductions = round2(sss + philhealth + pagibig + tax + otherDeductions);
  return { basic, overtime, gross, sss, philhealth, pagibig, tax, deductions, net: Math.max(0, round2(gross - deductions)) };
}
