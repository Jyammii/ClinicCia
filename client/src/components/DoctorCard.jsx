import Placeholder from "./Placeholder";

function DoctorCard({ doctor, specialty, hospital }) {
  return (
    <a href={`#/doctor/${doctor._id}`} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
      <Placeholder src={doctor.image} label="Doctor photo" round className="h-20 w-20 shrink-0" />
      <div className="min-w-0">
        <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
        <p className="text-sm text-brand">{specialty?.name}</p>
        <p className="mt-1 text-sm text-slate-500">{hospital?.name}</p>
        <p className="mt-2 text-sm font-semibold">₱{Number(doctor.fee).toLocaleString()} <span className="font-normal text-slate-400">consultation</span></p>
        {doctor.online && <span className="mt-2 inline-block rounded-full bg-brand-light px-3 py-0.5 text-xs font-medium text-brand">Video consult</span>}
      </div>
    </a>
  );
}
export default DoctorCard;
