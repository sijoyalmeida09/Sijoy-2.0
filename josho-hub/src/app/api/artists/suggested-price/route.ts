import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instrumentsParam = searchParams.get("instruments");
  const region = searchParams.get("region") ?? "Vasai-Virar";

  if (!instrumentsParam) {
    return NextResponse.json({ error: "Missing instruments" }, { status: 400 });
  }

  const slugs = instrumentsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (slugs.length === 0) {
    return NextResponse.json({ error: "No instruments provided" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const regionFilter = region === "Vasai-Virar" ? "Palghar" : region;

  const { data: instruments } = await supabase
    .from("instruments")
    .select("id")
    .in("slug", slugs);
  const instrumentIds = (instruments ?? []).map((i) => i.id);
  if (instrumentIds.length === 0) {
    return NextResponse.json({ suggested: null, count: 0, message: "No instruments found" });
  }

  const { data: links } = await supabase
    .from("artist_instruments")
    .select("artist_id")
    .in("instrument_id", instrumentIds);
  const artistIds = [...new Set((links ?? []).map((l) => l.artist_id))];
  if (artistIds.length === 0) {
    return NextResponse.json({ suggested: null, count: 0, message: "No artists with these instruments" });
  }

  const { data: artists } = await supabase
    .from("artist_profiles")
    .select("event_rate")
    .in("id", artistIds)
    .eq("region", regionFilter)
    .eq("verification_status", "verified")
    .not("event_rate", "is", null);

  const rates = (artists ?? [])
    .map((a) => a.event_rate as number)
    .filter((r): r is number => typeof r === "number" && r > 0);

  if (rates.length === 0) {
    return NextResponse.json({ suggested: null, count: 0, message: "No data for this combination yet" });
  }

  rates.sort((a, b) => a - b);
  const mid = Math.floor(rates.length / 2);
  const median = rates.length % 2 ? rates[mid] : (rates[mid - 1] + rates[mid]) / 2;

  return NextResponse.json({
    suggested: Math.round(median),
    count: rates.length,
    min: Math.min(...rates),
    max: Math.max(...rates)
  });
}
