import Link from "next/link";

interface ArtistCardProps {
  id: string;
  stageName: string;
  profilePhoto: string | null;
  genres: string[];
  instruments: string[];
  avgRating: number;
  totalBookings: number;
  eventRate: number | null;
  featured: boolean;
  available: boolean;
}

export function ArtistCard({
  id,
  stageName,
  profilePhoto,
  genres,
  instruments,
  avgRating,
  totalBookings,
  eventRate,
  featured,
  available
}: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-blue-900/30 bg-[#13213d] transition-all hover:border-joshoBlue/60 hover:shadow-panel"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0d1a30]">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={stageName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-blue-700">
            {stageName.charAt(0)}
          </div>
        )}

        {featured && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
            Featured
          </span>
        )}

        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-sm font-medium text-white/80">Currently Unavailable</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/80 to-transparent px-3 pb-3 pt-10">
          <h3 className="text-lg font-semibold text-white">{stageName}</h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {genres.slice(0, 2).map((g) => (
              <span key={g} className="rounded-full bg-joshoBlue/20 px-2 py-0.5 text-[10px] font-medium text-blue-200">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs text-blue-200">
          <span className="flex items-center gap-0.5">
            <span className="text-amber-400">&#9733;</span> {avgRating.toFixed(1)}
          </span>
          <span className="text-blue-700">|</span>
          <span>{totalBookings} gigs</span>
        </div>
        {eventRate && (
          <span className="text-xs font-medium text-blue-100">
            &#8377;{eventRate.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 px-3 pb-3">
        {instruments.slice(0, 3).map((i) => (
          <span key={i} className="rounded bg-[#1a2d4d] px-1.5 py-0.5 text-[10px] text-blue-300">
            {i}
          </span>
        ))}
      </div>
    </Link>
  );
}
