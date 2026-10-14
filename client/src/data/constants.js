// Time slots offered by default for a new doctor.
export const DEFAULT_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

export const ROLES = ["admin", "doctor", "nurse", "receptionist", "pharmacist", "cashier", "patient"];
export const MODULES = [
  ["appointments", "Appointments"], ["emr", "Patients & EMR"], ["billing", "Billing & Claims"], ["inventory", "Pharmacy & Inventory"],
  ["staff", "Staff & Payroll"], ["reports", "Reports"], ["settings", "Site settings & doctors"], ["users", "User accounts"],
];
export const ROLE_DEFAULTS = {
  admin: MODULES.map((m) => m[0]), doctor: ["appointments", "emr"], nurse: ["appointments", "emr"],
  receptionist: ["appointments", "billing"], pharmacist: ["inventory", "emr"], cashier: ["billing"], patient: [],
};

// The five product areas shown on the landing page (same order as the mWell CMS layout).
export const FEATURES = [
  { key: "clinical", title: "Clinical Services", text: "From check-in to consultation, every visit lands in one electronic medical record that doctors and nurses can open from any workstation.", points: ["Patient profiles, allergies and HMO details", "Vitals, diagnosis and treatment notes per visit", "Prescriptions and lab orders in the same encounter"] },
  { key: "pharmacy", title: "Diagnostic & Pharmacy Services", text: "Prescribe from the consultation screen and let the pharmacy see it right away. Dispensing updates stock automatically.", points: ["Prescriptions linked to pharmacy stock", "One-click dispensing that deducts inventory", "Lab orders recorded with the visit"] },
  { key: "inventory", title: "Supplies & Inventory", text: "Know what is on the shelf before it runs out. Medicines, supplies and equipment are tracked with an audit trail for every movement.", points: ["Low-stock and near-expiry alerts", "Stock in, stock out and adjustments", "Supplier, cost and selling price per item"] },
  { key: "billing", title: "Billing & Claims", text: "Create invoices from appointments, take cash or e-wallet payments, and follow every HMO claim from submission to payment.", points: ["Auto invoice from a completed appointment", "Partial payments and daily revenue tracking", "HMO claim status: submitted, approved, paid"] },
  { key: "admin", title: "Clinic Administration", text: "Run the whole team from one place: duty rosters, payroll with Philippine deductions, access permissions and live reports.", points: ["Doctor schedules and nurse shifts", "Semi-monthly payroll with SSS, PhilHealth and Pag-IBIG", "Patient volume, revenue and popular services reports"] },
];

export const PLANS = ["Starter", "Standard", "Multi-branch"];
// [feature, [starter, standard, multi-branch]] grouped by section.
export const MATRIX = [
  ["Clinical Services", [["Online booking & appointment list", [1, 1, 1]], ["Patient records (EMR)", [1, 1, 1]], ["Prescriptions & lab orders", [0, 1, 1]], ["Video consult booking", [0, 1, 1]]]],
  ["Pharmacy & Inventory", [["Stock tracking", [1, 1, 1]], ["Low-stock & expiry alerts", [0, 1, 1]], ["Dispensing from prescriptions", [0, 1, 1]]]],
  ["Billing & Claims", [["Invoicing & payments", [1, 1, 1]], ["HMO claim tracking", [0, 1, 1]], ["Daily revenue report", [0, 1, 1]]]],
  ["Clinic Administration", [["Role-based staff access", [1, 1, 1]], ["Duty roster & payroll", [0, 1, 1]], ["Analytics & CSV export", [0, 1, 1]], ["Multiple branches", [0, 0, 1]]]],
];
// Sample pricing for the landing page (edit freely).
export const PRICE = { monthly: 2500, annual: 27500 };
