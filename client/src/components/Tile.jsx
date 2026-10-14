import Placeholder from "./Placeholder";

function Tile({ item, to }) {
  return (
    <a
      href={to}
      className="card-hover group flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center text-sm font-medium text-[#172238] shadow-sm ring-1 ring-[#E2E9ED] transition"
    >
      <div className="overflow-hidden rounded-xl">
        <Placeholder
          src={item.image}
          label={`${item.name} illustration`}
          round
          className="h-16 w-16 transition group-hover:scale-105"
        />
      </div>
      <span className="text-xs font-semibold leading-tight text-[#172238] group-hover:text-[#2D8982]">
        {item.name}
      </span>
    </a>
  );
}

export default Tile;
