import Link from "next/link";

interface GearCardProps {
  name: string;
  type: "Sound System" | "Instrument" | "Lighting";
  rate_per_day: number;
  available: boolean;
  musician_name: string;
  city: string;
  description?: string;
  photo?: string | null;
}

const TYPE_CONFIG = {
  "Sound System": { color: "electric", icon: "🔊" },
  "Instrument": { color: "gold", icon: "🎸" },
  "Lighting": { color: "teal", icon: "💡" }
} as const;

export function GearCard({
  name,
  type,
  rate_per_day,
  available,
  musician_name,
  city,
  description,
  photo
}: GearCardProps) {
  const config = TYPE_CONFIG[type];

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-josho-surface transition-all duration-300 hover:-translate-y-0.5 ${
        available
          ? "border-josho-border hover:border-electric/40 hover:shadow-electric"
          : "border-josho-border opacity-60"
      }`}
    >
      {/* Photo or icon */}
      <div className="relative h-40 overflow-hidden bg-josho-elevated">
        {photo ? (
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl opacity-30">
            {config.icon}
          </div>
        )}
        {/* Type pill */}
        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${
              config.color === "electric"
                ? "border-electric/30 bg-electric/15 text-electric"
                : config.color === "gold"
                ? "border-gold/30 bg-gold/15 text-gold"
                : "border-teal/30 bg-teal/15 text-teal"
            }`}
          >
            {type}
          </span>
        </div>
        {/* Available badge */}
        {available && (
          <div className="absolute right-3 top-3">
            <span className="flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-bold text-teal border border-teal/30 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              Available Today
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 font-bold leading-tight text-[#eeeef8]">{name}</h3>
        {description && (
          <p className="mb-3 text-xs leading-relaxed text-[#505070] line-clamp-2">{description}</p>
        )}
        <div className="mt-auto">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-[#eeeef8]">
                ₹{rate_per_day.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-[#505070]">per day</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-[#9090b0]">by {musician_name}</p>
              <p className="text-[10px] text-[#505070]">{city}</p>
            </div>
          </div>
          {available ? (
            <Link
              href="/tonight"
              className="btn-electric block w-full py-2.5 text-center text-sm"
            >
              Rent Now
            </Link>
          ) : (
            <div className="block w-full rounded-xl bg-josho-elevated py-2.5 text-center text-sm text-[#505070]">
              Unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
