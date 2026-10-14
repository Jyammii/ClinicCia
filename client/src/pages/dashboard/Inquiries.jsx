import { fmt } from "../../lib";
import { Badge } from "../../components/ui";
import Crud from "../../components/Crud";

function Inquiries() {
  const fields = [
    { key: "status", label: "Status", type: "select", required: true, options: ["New", "Contacted", "Closed"].map((s) => [s, s]) },
    { key: "notes", label: "Internal notes", type: "textarea" },
  ];
  const columns = [
    { label: "Received", render: (i) => fmt(i.createdAt) },
    { label: "Contact", render: (i) => <><p className="font-medium">{i.name}</p><p className="text-xs text-slate-400">{i.email}{i.phone ? ` · ${i.phone}` : ""}</p></> },
    { label: "Clinic", render: (i) => i.clinic || "-" },
    { label: "Message", render: (i) => <p className="max-w-xs whitespace-pre-wrap text-slate-600">{i.message || "-"}</p> },
    { label: "Status", render: (i) => <Badge>{i.status}</Badge> },
  ];
  return <Crud noun="demo request" endpoint="/inquiries" columns={columns} fields={fields} canCreate={false} emptyText="No demo requests yet." />;
}
export default Inquiries;
