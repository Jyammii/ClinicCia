import { MODULES, ROLES, ROLE_DEFAULTS } from "../../data/constants";
import { Badge } from "../../components/ui";
import Crud from "../../components/Crud";

function Users() {
  const fields = [
    { key: "name", label: "Full name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "password", label: "Password (leave blank to keep current)", type: "password" },
    { key: "phone", label: "Mobile", type: "tel" },
    { key: "role", label: "Role", type: "select", required: true, default: "receptionist", options: ROLES.map((r) => [r, r[0].toUpperCase() + r.slice(1)]),
      afterChange: (role) => ({ permissions: ROLE_DEFAULTS[role] || [] }) },
    { key: "permissions", label: "Module access (selecting a role fills sensible defaults)", type: "multi", options: MODULES, default: [] },
    { key: "active", label: "Account is active", type: "checkbox", default: true },
  ];
  const columns = [
    { label: "Name", render: (u) => <><p className="font-medium">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></> },
    { label: "Role", render: (u) => <span className="capitalize">{u.role}</span> },
    { label: "Access", render: (u) => (u.role === "admin" ? "Everything" : u.role === "patient" ? "Patient portal" : u.permissions.map((p) => MODULES.find((m) => m[0] === p)?.[1] || p).join(", ") || "None") },
    { label: "Status", render: (u) => <Badge tone={u.active ? "green" : "slate"}>{u.active ? "Active" : "Disabled"}</Badge> },
  ];
  return (
    <Crud noun="user" endpoint="/users" columns={columns} fields={fields} newLabel="New user" modalWide empty={{ permissions: ROLE_DEFAULTS.receptionist }}
      />
  );
}
export default Users;
