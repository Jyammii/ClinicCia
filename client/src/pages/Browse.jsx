import { useSite } from "../store";
import Tile from "../components/Tile";

const KEYS = { specialties: ["specialty", "Specialties"], conditions: ["condition", "Conditions"], services: ["service", "Services"], hospitals: ["hospital", "Hospitals"], hmos: ["hmo", "HMOs"] };

function Browse({ kind }) {
  const { site } = useSite();
  const [param, title] = KEYS[kind] || KEYS.specialties;
  const items = site[kind in KEYS ? kind : "specialties"] || [];
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((i) => {
          const item = typeof i === "string" ? { id: i, name: i, image: "" } : i;
          return <Tile key={item.id} item={item} to={`#/search?${param}=${item.id}`} />;
        })}
      </div>
    </main>
  );
}
export default Browse;
