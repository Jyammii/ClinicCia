import Placeholder from "./Placeholder";

function DoctorCard({ doctor, specialty, hospital }) {
  return (
    <a
      href={`#/doctor/${doctor._id}`}
      className="card-hover group flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E2E9ED] transition"
    >
      <div className="shrink-0 overflow-hidden rounded-xl">
        <Placeholder
          src={doctor.image}
          label="Doctor photo"
          round
          className="h-20 w-20 transition group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[#172238] group-hover:text-[#102943]">{doctor.name}</h3>
        <p className="mt-0.5 text-sm font-medium text-[#2D8982]">{specialty?.name}</p>
        <p className="mt-0.5 text-sm text-slate-500">{hospital?.name}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#172238]">
            ₱{Number(doctor.fee).toLocaleString()}{" "}
            <span className="font-normal text-slate-400">/ visit</span>
          </p>
          {doctor.online && (
            <span className="rounded-full bg-[#EAF5F1] px-2.5 py-0.5 text-xs font-semibold text-[#2D8982]">
              Video
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export default DoctorCard;
