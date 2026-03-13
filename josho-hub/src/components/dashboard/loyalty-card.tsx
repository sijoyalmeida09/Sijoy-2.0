interface LoyaltyCardProps {
  points: number;
}

function tier(points: number) {
  if (points >= 1200) return "Empire Elite";
  if (points >= 600) return "Empire Pro";
  if (points >= 200) return "Empire Plus";
  return "Empire Starter";
}

export function LoyaltyCard({ points }: LoyaltyCardProps) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-joshoNavy to-joshoBlue px-4 py-3 shadow-panel">
      <p className="text-xs uppercase tracking-wide text-blue-100">JoSho Loyalty Card</p>
      <p className="mt-1 text-sm font-medium text-white">{tier(points)}</p>
      <p className="text-2xl font-bold text-white">{points} pts</p>
    </div>
  );
}
