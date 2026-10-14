// Resets the database with demo content:  npm run seed
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Site from "./models/Site.js";
import Doctor from "./models/Doctor.js";
import Patient from "./models/Patient.js";
import Appointment from "./models/Appointment.js";
import Record from "./models/Record.js";
import Invoice from "./models/Invoice.js";
import Item from "./models/Item.js";
import Staff from "./models/Staff.js";
import Shift from "./models/Shift.js";
import { ROLE_DEFAULTS } from "./models/User.js";
import { addDays, todayPH } from "./utils/dates.js";

const PASSWORD = "admin123"; // demo accounts only. Change before any real deployment.
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const tiles = (arr) => arr.map((n) => ({ id: slug(n), name: n, image: "" }));
const named = (id, name) => ({ id, name, image: "" });

export async function runSeed(disconnect = false) {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  for (const c of await mongoose.connection.db.collections()) await c.deleteMany({});
  await Promise.all(mongoose.modelNames().map((m) => mongoose.model(m).syncIndexes()));

// ---- Site content (all images empty = placeholders the admin can replace) ---
await Site.create({
  siteName: "ClinicNow",
  contact: { address: "Ciudad de Cavite, Philippines", email: "hello@clinicnow.ph", phone: "+63 900 000 0000" },
  specialties: [
    named("primary-care", "Primary Care & General Medicine"), named("ob-gyn", "OB-GYN's & Women's Health"), named("pediatrics", "Pediatrics"),
    named("endocrinology", "Diabetes & Endocrinology"), named("eye", "Eye & Vision Doctor"), named("cardiology", "Heart & Cardiology"),
    named("dermatology", "Skin & Dermatology"), named("pulmonology", "Lungs, Chest & Pulmonology"), named("gastro", "Stomach, Digestion & Gastroenterology"),
    named("ent", "Ears, Nose & Throat"), named("nephrology", "Kidney & Urine"), named("neurology", "Brain & Nerves"),
  ],
  conditions: tiles(["Acne & Eczema", "Allergic Rhinitis", "Arthritis & Gout", "Back Pain", "Cancer", "Colds & Flu", "Depression, Anxiety & Mental Health", "Diabetes", "High Blood Pressure (Hypertension)", "High Cholesterol & Dyslipidemia", "UTI (Urinary Tract Infection)"]),
  services: tiles(["Children's Vaccinations", "COVID-19 Consultations", "Medical Certificates", "Vaccination Forms", "LASIK", "Cataract Surgery", "Cortisone Injections", "IUDs & Other Birth Control"]),
  hospitals: ["Hospital / Clinic One", "Hospital / Clinic Two", "Hospital / Clinic Three", "Hospital / Clinic Four"].map((n, i) => named("h" + (i + 1), n)),
  hmos: ["Generali", "HPPI", "Maxicare", "Intellicare", "AVEGA", "MediCard", "Cocolife", "PhilCare", "Etiqa", "ValuCare"],
});

// ---- Accounts ---------------------------------------------------------------
const mk = (name, email, role) => User.create({ name, email, password: PASSWORD, role, permissions: ROLE_DEFAULTS[role] });
const admin = await mk("Admin", "admin@clinic.ph", "admin");
const docUser = await mk("Dr. Juan Dela Cruz", "doctor@clinic.ph", "doctor");
await mk("Rina Mercado", "reception@clinic.ph", "receptionist");
await mk("Paolo Lim", "pharmacy@clinic.ph", "pharmacist");
await mk("Carla Ramos", "cashier@clinic.ph", "cashier");
await mk("Nurse Liza Tan", "nurse@clinic.ph", "nurse");
const patientUser = await mk("Maria Clara", "patient@clinic.ph", "patient");

// ---- Doctors ----------------------------------------------------------------
const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
const [d1, d2, d3, d4] = await Doctor.create([
  { name: "Dr. Juan Dela Cruz", specialty: "primary-care", hospital: "h1", fee: 800, hmos: ["Maxicare", "MediCard"], online: true, bio: "General practitioner focused on preventive care and family health.", slots, conditions: ["colds-flu", "high-blood-pressure-hypertension"], services: ["medical-certificates"], user: docUser._id },
  { name: "Dr. Maria Santos", specialty: "pediatrics", hospital: "h2", fee: 1000, hmos: ["Intellicare", "PhilCare"], online: true, bio: "Pediatrician caring for infants, children and adolescents.", slots, conditions: ["colds-flu", "allergic-rhinitis"], services: ["children-s-vaccinations", "vaccination-forms"] },
  { name: "Dr. Jose Reyes", specialty: "cardiology", hospital: "h3", fee: 1500, hmos: ["Maxicare"], online: false, bio: "Cardiologist specializing in hypertension and heart disease.", slots, conditions: ["high-blood-pressure-hypertension", "high-cholesterol-dyslipidemia"], services: ["medical-certificates"] },
  { name: "Dr. Ana Garcia", specialty: "dermatology", hospital: "h1", fee: 1200, hmos: ["Etiqa", "Cocolife"], online: true, bio: "Dermatologist for acne, eczema and skin health.", slots, conditions: ["acne-eczema"], services: ["cortisone-injections"] },
]);
const doctors = [d1, d2, d3, d4];

// ---- Pharmacy / inventory ---------------------------------------------------
const today = todayPH();
const items = await Item.create([
  { name: "Paracetamol 500mg", sku: "MED-001", category: "Medicine", unit: "tabs", qty: 420, reorderLevel: 100, cost: 1.5, price: 3, expiry: addDays(today, 400), supplier: "MedSource PH" },
  { name: "Amoxicillin 500mg", sku: "MED-002", category: "Medicine", unit: "caps", qty: 60, reorderLevel: 80, cost: 6, price: 12, expiry: addDays(today, 200), supplier: "MedSource PH" },
  { name: "Losartan 50mg", sku: "MED-003", category: "Medicine", unit: "tabs", qty: 240, reorderLevel: 60, cost: 5, price: 10, expiry: addDays(today, 300), supplier: "PharmaLink" },
  { name: "Cetirizine 10mg", sku: "MED-004", category: "Medicine", unit: "tabs", qty: 18, reorderLevel: 50, cost: 3, price: 7, expiry: addDays(today, 40), supplier: "PharmaLink" },
  { name: "Metformin 500mg", sku: "MED-005", category: "Medicine", unit: "tabs", qty: 300, reorderLevel: 80, cost: 2.5, price: 6, expiry: addDays(today, 500), supplier: "MedSource PH" },
  { name: "Disposable gloves (box)", sku: "SUP-001", category: "Supply", unit: "box", qty: 14, reorderLevel: 10, cost: 180, price: 0, supplier: "CleanCare Supply", location: "Store Room" },
  { name: "Syringe 3ml", sku: "SUP-002", category: "Supply", unit: "pcs", qty: 220, reorderLevel: 100, cost: 4, price: 0, supplier: "CleanCare Supply", location: "Store Room" },
  { name: "Alcohol 70% (500ml)", sku: "SUP-003", category: "Supply", unit: "btl", qty: 6, reorderLevel: 12, cost: 75, price: 0, supplier: "CleanCare Supply", location: "Store Room" },
  { name: "Digital BP monitor", sku: "EQP-001", category: "Equipment", unit: "unit", qty: 4, reorderLevel: 2, cost: 2200, price: 0, supplier: "MediTech", location: "Nurse Station" },
  { name: "Pulse oximeter", sku: "EQP-002", category: "Equipment", unit: "unit", qty: 5, reorderLevel: 2, cost: 1100, price: 0, supplier: "MediTech", location: "Nurse Station" },
]);

// ---- Patients, visits, billing (spread over the last two weeks for the reports) --
const patients = await Patient.create([
  { name: "Maria Clara", birthdate: "1990-05-14", sex: "Female", phone: "0917 100 0001", address: "Imus, Cavite", bloodType: "O+", allergies: ["Penicillin"], hmo: "Maxicare", hmoNo: "MX-100234", emergencyName: "Jose Clara", emergencyPhone: "0917 100 0099", user: patientUser._id },
  { name: "Juan Santos", birthdate: "1978-11-02", sex: "Male", phone: "0917 100 0002", address: "Bacoor, Cavite", bloodType: "A+", allergies: [], hmo: "MediCard" },
  { name: "Ana Reyes", birthdate: "2016-03-21", sex: "Female", phone: "0917 100 0003", address: "Cavite City", bloodType: "B+", allergies: ["Peanuts"] },
  { name: "Pedro Villanueva", birthdate: "1965-08-30", sex: "Male", phone: "0917 100 0004", address: "Kawit, Cavite", bloodType: "AB+", allergies: [], hmo: "PhilCare" },
  { name: "Liza Fernandez", birthdate: "1995-01-09", sex: "Female", phone: "0917 100 0005", address: "Rosario, Cavite", bloodType: "O-", allergies: [] },
]);

const reasons = ["Fever and cough", "High blood pressure check-up", "Skin rash", "Child vaccination", "Follow-up consultation", "Medical certificate"];
const dx = ["Acute upper respiratory infection", "Hypertension, stage 1", "Contact dermatitis", "Routine immunization", "Controlled, continue medication", "Fit to work"];
const medFor = [[0, 1], [2], [3], [], [4], []];
let n = 0;
for (let back = 13; back >= 1; back--) {
  const count = 1 + (back % 3); // 1-3 visits a day
  for (let k = 0; k < count; k++, n++) {
    const doc = doctors[n % 4], pat = patients[n % 5], date = addDays(today, -back), time = slots[(k * 2 + back) % slots.length];
    const ri = n % reasons.length;
    const appt = await Appointment.create({ doctor: doc._id, bookedBy: admin._id, patient: pat._id, patientName: pat.name, phone: pat.phone, date, time, type: n % 5 === 0 ? "video" : "clinic", reason: reasons[ri], status: n % 9 === 0 ? "Cancelled" : "Completed", active: n % 9 !== 0 });
    if (appt.status !== "Completed") continue;
    await Record.create({
      patient: pat._id, doctor: doc._id, appointment: appt._id, date,
      complaint: reasons[ri], diagnosis: dx[ri], treatment: "Rest, hydration and medication as prescribed.",
      vitals: { bp: "120/80", hr: 72 + (n % 10), temp: 36.6 + (n % 4) / 10, spo2: 98, weight: 55 + n, height: 160 },
      prescriptions: medFor[ri].map((i) => ({ item: items[i]._id, medicine: items[i].name, dosage: "1 tab every 8 hours", qty: 10 })),
      followUp: addDays(date, 14), dispensed: false, createdBy: docUser._id,
    });
    const lines = [{ description: `Consultation - ${doc.name}`, qty: 1, unitPrice: doc.fee }, ...medFor[ri].map((i) => ({ description: items[i].name, qty: 10, unitPrice: items[i].price }))];
    const pay = new Date(`${date}T0${(time.startsWith("0") ? 9 : 1)}:30:00+08:00`);
    const inv = new Invoice({ patient: pat._id, appointment: appt._id, items: lines, createdBy: admin._id, createdAt: pay });
    inv.recalc();
    if (n % 6 === 1) { inv.claim = { hmo: pat.hmo || "Maxicare", claimNo: `CLM-${1000 + n}`, amount: inv.total, status: "Submitted" }; }
    else if (n % 6 === 4) { inv.payments.push({ amount: Math.round(inv.total / 2), method: "GCash", ref: `GC${n}`, date: pay }); }
    else inv.payments.push({ amount: inv.total, method: ["Cash", "GCash", "Card"][n % 3], date: pay });
    await inv.save();
    appt.invoice = inv._id;
    await appt.save();
  }
}
// A few upcoming bookings.
for (const [i, who] of [[1, patients[0]], [2, patients[1]], [3, patients[3]]]) {
  await Appointment.create({ doctor: doctors[i]._id, bookedBy: patientUser._id, patient: who._id, patientName: who.name, phone: who.phone, date: addDays(today, i), time: slots[i], reason: "Consultation" });
}

// ---- Staff & duty roster ----------------------------------------------------
const staff = await Staff.create([
  { name: "Rina Mercado", position: "Receptionist", department: "Front Desk", dailyRate: 650, allowance: 500, hireDate: "2024-02-01", phone: "0917 200 0001" },
  { name: "Nurse Liza Tan", position: "Registered Nurse", department: "Nursing", dailyRate: 900, allowance: 800, hireDate: "2023-06-15", phone: "0917 200 0002" },
  { name: "Paolo Lim", position: "Pharmacist", department: "Pharmacy", dailyRate: 1000, allowance: 800, hireDate: "2023-09-01", phone: "0917 200 0003" },
  { name: "Carla Ramos", position: "Cashier", department: "Billing", dailyRate: 650, allowance: 500, hireDate: "2024-05-20", phone: "0917 200 0004" },
  { name: "Mang Ben Cruz", position: "Utility", department: "Maintenance", dailyRate: 580, allowance: 300, hireDate: "2022-11-10", phone: "0917 200 0005" },
]);
const types = ["Morning", "Afternoon", "Morning", "Morning", "Afternoon"];
for (let back = 14; back >= -6; back--) {
  const date = addDays(today, -back);
  if (new Date(`${date}T00:00:00Z`).getUTCDay() === 0) continue; // Sundays off
  for (const [i, s] of staff.entries()) await Shift.create({ staff: s._id, date, type: types[i], status: back > 0 ? "Present" : "Scheduled" });
}

  console.log(`Seeded. Log in with admin@clinic.ph / ${PASSWORD} (other demo roles: doctor@, reception@, pharmacy@, cashier@, nurse@, patient@clinic.ph).`);
  if (disconnect) {
    await mongoose.disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  runSeed(true);
}

