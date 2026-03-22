// Artist wallet page — balance, transaction history, tips tracking
import { requireProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MyWalletPage() {
  const profile = await requireProfile();
  if (profile.role !== "musician" && profile.role !== "admin") redirect("/dashboard");

  const supabase = createServerSupabaseClient();

  const { data: artist } = await supabase
    .from("artist_profiles")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!artist) return <p className="text-blue-300">No artist profile found.</p>;

  const { data: wallet } = await supabase
    .from("artist_wallets")
    .select("balance_inr, total_earned_inr, total_fees_paid_inr, total_tips_inr, last_transaction_at")
    .eq("provider_id", artist.id)
    .maybeSingle();

  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("id, tx_type, amount_inr, balance_after, note, created_at")
    .eq("wallet_id",
      wallet
        ? (await supabase.from("artist_wallets").select("id").eq("provider_id", artist.id).single()).data?.id ?? ""
        : ""
    )
    .order("created_at", { ascending: false })
    .limit(30);

  const txTypeLabel: Record<string, string> = {
    booking_earning: "Gig Earned",
    platform_fee:    "Platform Fee",
    tip_credit:      "Tip",
    withdrawal:      "Withdrawal",
    adjustment:      "Adjustment",
  };

  const txTypeColor: Record<string, string> = {
    booking_earning: "text-green-300",
    platform_fee:    "text-red-400",
    tip_credit:      "text-amber-300",
    withdrawal:      "text-blue-300",
    adjustment:      "text-blue-300",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">My Wallet</h2>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-green-800/30 bg-[#0d2818] p-4">
          <p className="text-xs uppercase tracking-wide text-green-400">Available Balance</p>
          <p className="mt-1 text-2xl font-bold text-white">
            &#8377;{(wallet?.balance_inr ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-blue-800/30 bg-[#0d1a30] p-4">
          <p className="text-xs uppercase tracking-wide text-blue-400">Total Earned</p>
          <p className="mt-1 text-2xl font-bold text-white">
            &#8377;{(wallet?.total_earned_inr ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-amber-800/30 bg-[#1a2210] p-4">
          <p className="text-xs uppercase tracking-wide text-amber-400">Total Tips</p>
          <p className="mt-1 text-2xl font-bold text-white">
            &#8377;{(wallet?.total_tips_inr ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-red-900/30 bg-[#1a0d0d] p-4">
          <p className="text-xs uppercase tracking-wide text-red-400">Platform Fees Paid</p>
          <p className="mt-1 text-2xl font-bold text-white">
            &#8377;{(wallet?.total_fees_paid_inr ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* No wallet yet */}
      {!wallet && (
        <div className="rounded-xl border border-blue-900/30 bg-[#0d1a30] p-6 text-center">
          <p className="text-sm text-blue-300">No wallet yet. Complete your first gig to start earning.</p>
        </div>
      )}

      {/* Transaction History */}
      {(transactions ?? []).length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-400">
            Transaction History
          </h3>
          <div className="space-y-2">
            {(transactions ?? []).map((tx) => (
              <div
                key={tx.id as string}
                className="flex items-center justify-between rounded-lg border border-blue-900/20 bg-[#0d1a30] p-3"
              >
                <div>
                  <p className={`text-sm font-medium ${txTypeColor[tx.tx_type as string] ?? "text-white"}`}>
                    {txTypeLabel[tx.tx_type as string] ?? tx.tx_type as string}
                  </p>
                  {(tx.note as string | null) && (
                    <p className="text-xs text-blue-500">{tx.note as string}</p>
                  )}
                  <p className="text-xs text-blue-600">{String(tx.created_at).slice(0, 10)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${(tx.amount_inr as number) >= 0 ? "text-green-300" : "text-red-400"}`}>
                    {(tx.amount_inr as number) >= 0 ? "+" : ""}&#8377;{Math.abs(tx.amount_inr as number).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-blue-500">
                    Bal: &#8377;{(tx.balance_after as number).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
