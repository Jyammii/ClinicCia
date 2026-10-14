import { assetUrl } from "../api";

// Shows the admin-uploaded image, or a labelled placeholder when none is set.
function Placeholder({ src, label = "Image", className = "", round = false }) {
  if (src)
    return (
      <img
        src={assetUrl(src)}
        alt={label}
        className={`object-cover ${round ? "rounded-full" : ""} ${className}`}
      />
    );
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 bg-[#EAF5F1] text-[#2D8982]/50 ${round ? "rounded-full" : "rounded-2xl"} ${className}`}
      title={label}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-1/4 w-1/4 max-h-8 max-w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 16-5-5-9 9" />
      </svg>
      <span className="hidden text-[10px] font-medium">{label}</span>
    </div>
  );
}

export default Placeholder;
