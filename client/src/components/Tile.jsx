import Placeholder from "./Placeholder";

function Tile({ item, to }) {
  return (
    <a href={to} className="flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:text-brand hover:shadow-lg">
      <Placeholder src={item.image} label={`${item.name} illustration`} round className="h-20 w-20" />
      {item.name}
    </a>
  );
}
export default Tile;
