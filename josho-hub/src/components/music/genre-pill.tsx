"use client";

interface GenrePillProps {
  slug: string;
  name: string;
  active: boolean;
  onClick: (slug: string) => void;
}

export function GenrePill({ slug, name, active, onClick }: GenrePillProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(slug)}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
        active
          ? "bg-joshoBlue text-white shadow-md"
          : "border border-blue-800/40 bg-transparent text-blue-200 hover:border-joshoBlue/60 hover:text-white"
      }`}
    >
      {name}
    </button>
  );
}
