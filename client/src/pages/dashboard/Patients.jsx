import { useAuth, useSite, can } from "../../store";
import { age } from "../../lib";
import Crud from "../../components/Crud";
import PatientRecord from "./PatientRecord";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function Patients({ sub, query }) {
  const { user } = useAuth();
  const { site } = useSite();
  if (sub) return <PatientRecord id={sub} query={query} />;
  const fields = [
    { key: "name", label: "Full name", required: true },
    { key: "birthdate", label: "Birthdate", type: "date" },
    { key: "sex", label: "Sex", type: "select", options: [["Male", "Male"], ["Female", "Female"], ["Other", "Other"]] },
    { key: "bloodType", label: "Blood type", type: "select", options: BLOOD.map((b) => [b, b]) },
    { key: "phone", label: "Mobile number", type: "tel" },
    { key: "email", label: "Email", type: "email" },
    { key: "address", label: "Address", full: true },
    { key: "allergies", label: "Allergies (comma separated)", type: "list", full: true },
    { key: "hmo", label: "HMO", type: "select", options: site.hmos.map((h) => [h, h]) },
    { key: "hmoNo", label: "HMO member no." },
    { key: "emergencyName", label: "Emergency contact" },
    { key: "emergencyPhone", label: "Emergency phone", type: "tel" },
  ];
  const columns = [
    { label: "Patient no.", key: "patientNo" },
    { label: "Name", render: (p) => <a href={can(user, "emr") ? `#/dashboard/patients/${p._id}` : undefined} className={can(user, "emr") ? "font-medium text-brand hover:underline" : "font-medium"}>{p.name}</a> },
    { label: "Age / Sex", render: (p) => [p.birthdate ? `${age(p.birthdate)} yrs` : "", p.sex].filter(Boolean).join(" · ") || "-" },
    { label: "Mobile", render: (p) => p.phone || "-" },
    { label: "HMO", render: (p) => p.hmo || "-" },
    { label: "Allergies", render: (p) => (p.allergies?.length ? <span className="text-red-500">{p.allergies.join(", ")}</span> : "-") },
  ];
  return (
    <Crud noun="patient" endpoint="/patients" columns={columns} fields={fields} newLabel="New patient" modalWide canDelete={can(user, "emr")}
      rowActions={(p) => can(user, "emr") && <a href={`#/dashboard/patients/${p._id}`} className="text-brand">Record</a>} />
  );
}
export default Patients;
