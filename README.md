# ClinicNow: Clinic Appointment and Management System

A MERN stack web application (MongoDB, Express.js, React, Node.js) that combines a public "Find a Doctor" booking site with a staff dashboard for running a clinic. The look and flow follow the mWell Clinic Management System page: blue brand color, Poppins font, rounded cards, pill buttons, a clinic landing page and a doctor search and booking flow.

## Key features

| Module | What it does |
|---|---|
| Appointments | Patients book in-person or video slots; double-booking is blocked by a database index; staff update status and cancel. |
| Patients and EMR | Patient profiles (allergies, HMO, emergency contact) and encounters with vitals, diagnosis, treatment, notes, prescriptions, lab orders and follow-up date. |
| Billing and Invoicing | Invoices (also one click from an appointment), partial payments (cash, GCash, card, bank), HMO claim tracking, void and print. |
| Pharmacy and Inventory | Medicines, supplies and equipment, low-stock and expiry alerts, stock in/out/adjust with audit trail, dispensing a prescription deducts stock. |
| Staff and Payroll | Employees, duty roster (morning, afternoon, night), semi-monthly payroll with SSS, PhilHealth, Pag-IBIG and withholding tax estimates, printable payslips. |
| Reports and Analytics | Patient volume, revenue per day, popular specialties and services, top doctors, payment methods, outstanding balances, CSV export. |
| Admin | Replace every placeholder image, manage doctors, user accounts with per-module permissions, demo requests from the landing page. |

## Folder structure

```
clinic-appointment-system/
├── package.json            root scripts (dev, seed, build)
├── client/                 React 19 + Vite + Tailwind v4
│   └── src/
│       ├── api.js          fetch wrapper with JWT header
│       ├── store.jsx       auth and site-settings context
│       ├── hooks.js        useFetch, hash router
│       ├── lib.js          shared styles and formatters
│       ├── data/           constants (features, plans, roles)
│       ├── components/     Navbar, Footer, Placeholder, ImageUpload, Tile, DoctorCard, Crud, ui, BarChart
│       └── pages/          Landing, Home (find a doctor), Browse, Search, Doctor, Book, Auth, Appointments
│           └── dashboard/  Overview, AppointmentsAdmin, Patients, PatientRecord, Billing, Pharmacy,
│                           StaffPayroll, Reports, Doctors, SiteImages, Inquiries, Users
└── server/                 Express + Mongoose
    ├── uploads/            images uploaded by the admin
    └── src/
        ├── app.js, index.js, seed.js
        ├── config/         env, MongoDB connection
        ├── middleware/     auth (JWT + permissions), validate, sanitize, upload, error, crud factory
        ├── models/         User, Site, Doctor, Patient, Appointment, Record, Invoice, Item, Movement,
        │                   Staff, Shift, Payroll, Inquiry
        ├── routes/         auth, site, doctors, appointments, patients, records, invoices, inventory,
        │                   staff (staff, shifts, payroll), users, inquiries, reports
        └── utils/          counter, dates, payroll
```

## Run it

You need Node.js 18 or newer and MongoDB (local, or a free MongoDB Atlas connection string).

```bash
npm run install:all
cp server/.env.example server/.env      # on Windows: copy server\.env.example server\.env
# edit server/.env if your MongoDB is not on localhost
npm run seed                            # loads demo data (this wipes the database)
npm run dev                             # API on :5000, website on http://localhost:5173
```

Production build: `npm run build`, then `npm start`. The API serves `client/dist` as well, so one server hosts everything. Set a long random `JWT_SECRET` first.

## Deployment

For the hosted split setup used in this project (MongoDB Atlas -> Render API -> Vercel frontend), follow [DEPLOYMENT.md](DEPLOYMENT.md). The included `render.yaml`, `vercel.json`, and environment examples are ready for that flow.

## Demo accounts (password for all: `admin123`)

| Email | Role | Access |
|---|---|---|
| admin@clinic.ph | Admin | everything |
| doctor@clinic.ph | Doctor | own appointments and EMR |
| reception@clinic.ph | Receptionist | appointments, billing |
| pharmacy@clinic.ph | Pharmacist | inventory, dispensing |
| cashier@clinic.ph | Cashier | billing |
| nurse@clinic.ph | Nurse | appointments, EMR |
| patient@clinic.ph | Patient | booking portal |

Change these passwords before any real deployment. New sign-ups are always patients; only an admin can create staff accounts (Dashboard, Users and Access).

## Flow

Public: Landing page (clinic system, features, plans, pricing, request a demo) -> Find a Doctor -> search and filters -> doctor profile (date, time, in-person or video) -> log in or sign up -> patient details -> confirmation -> My Appointments.

Clinic: Log in -> Dashboard -> Appointments -> open patient record -> save encounter (appointment becomes Completed) -> Dispense medicines (stock drops) -> Create invoice -> record payment or HMO claim -> Reports.

## Placeholder images

Every picture starts as a placeholder. In Dashboard, Site and Images the admin uploads replacements for the landing page hero and five feature sections, the video banner, and every specialty, condition, service and hospital tile. Doctor photos are set in Dashboard, Doctors. Files are stored in `server/uploads` (JPG, PNG, WEBP, GIF, 2MB max).

## Project objectives and where to find them

1. MERN full-stack: `client/` (React), `server/` (Express, Node), MongoDB through Mongoose.
2. React concepts: components and props, `useState`/`useEffect`, custom hooks (`useFetch`, `useRoute`), context (`store.jsx`), routing (hash router in `hooks.js` and `App.jsx`), controlled forms, API integration (`api.js`).
3. CRUD and REST: `middleware/crud.js` generates list, read, create, update and delete routes; custom routes for appointments, invoices, payroll and inventory.
4. Authentication and security: JWT login, bcrypt password hashing, role and module permissions, express-validator input validation, mass-assignment whitelists, NoSQL-operator stripping, Helmet headers, rate limiting, upload type and size limits (SVG blocked), no password in API responses, generic login error.
5. System design and documentation: this README, models and routes grouped by module, seed data for demonstrations.

## API summary

All routes are under `/api`. Public: `GET /site`, `GET /doctors`, `GET /doctors/:id`, `GET /doctors/:id/taken?date=`, `POST /auth/login`, `POST /auth/register`, `POST /inquiries`. Everything else needs `Authorization: Bearer <token>` and the matching module permission: `/appointments`, `/patients`, `/records`, `/invoices`, `/inventory`, `/staff`, `/shifts`, `/payroll`, `/reports`, `/users`, `/upload`, `PATCH /site`.

## Notes and limits

- The design uses the colors, fonts and layout patterns of the supplied boilerplate, which follows the mWell page. Brand colors are three tokens in `client/src/index.css`.
- Payroll deductions are estimates using commonly published employee shares and the TRAIN tax table (`server/src/utils/payroll.js`). Check them against current SSS, PhilHealth, Pag-IBIG and BIR tables before real use.
- The landing page prices are sample values in `client/src/data/constants.js`.
- Video consult is a booking option only; there is no video call feature.
- Automated tests are not included. The API was checked for startup, validation, authentication guards and the payroll and invoice math; run the app against your own MongoDB to test the full flow.
