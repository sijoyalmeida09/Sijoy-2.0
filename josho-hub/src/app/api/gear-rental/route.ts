import { NextResponse } from "next/server";

// Mock gear data with realistic Mumbai/Vasai listings
const MOCK_GEAR_LISTINGS = [
  {
    id: "g1",
    gear_type: "sound_system",
    name: "Behringer Europower PA System (2x15\")",
    description: "2x 15 inch powered speakers + 6-channel mixer + all cables. 1000W total. Perfect for indoor events up to 200 pax.",
    rate_per_day: 2500,
    available: true,
    city: "Vasai",
    musician_name: "Ravi Sound Services",
    musician_id: "m1",
    verified: true,
    photo: null,
    available_dates: null
  },
  {
    id: "g2",
    gear_type: "instrument",
    name: "Yamaha PSR-E473 Keyboard (61 keys)",
    description: "61-key arranger keyboard with 758 voices, 235 auto-accompaniment styles. Comes with stand and sustain pedal.",
    rate_per_day: 800,
    available: true,
    city: "Virar",
    musician_name: "Maria Keys",
    musician_id: "m2",
    verified: true,
    photo: null,
    available_dates: null
  },
  {
    id: "g3",
    gear_type: "lighting",
    name: "LED Stage Lighting Kit (8 par cans + controller)",
    description: "8x RGBW LED par cans with DMX controller and 30m cable. All clamps and rigging included. Professional stage look.",
    rate_per_day: 3500,
    available: true,
    city: "Nalasopara",
    musician_name: "Kevin Lighting Pro",
    musician_id: "m3",
    verified: true,
    photo: null,
    available_dates: null
  },
  {
    id: "g4",
    gear_type: "instrument",
    name: "Pearl Export 5-Piece Drum Kit",
    description: "Full 5-piece acoustic drum set with hi-hat, crash, and ride cymbals. Hardware included. Professional quality.",
    rate_per_day: 1500,
    available: false,
    city: "Vasai",
    musician_name: "Mike Drumsticks",
    musician_id: "m4",
    verified: true,
    photo: null,
    available_dates: null
  },
  {
    id: "g5",
    gear_type: "sound_system",
    name: "Shure-type Wireless Mic Set (3 mics)",
    description: "3 wireless handheld microphones with receiver unit. 50m range. Batteries included. Great for events.",
    rate_per_day: 600,
    available: true,
    city: "Mumbai",
    musician_name: "Priya Vocals",
    musician_id: "m5",
    verified: true,
    photo: null,
    available_dates: null
  },
  {
    id: "g6",
    gear_type: "instrument",
    name: "Squier Stratocaster + Fender Frontman Amp",
    description: "Electric guitar + 25W solid state amp combo. Great for practice, small gigs, or recordings.",
    rate_per_day: 700,
    available: true,
    city: "Virar",
    musician_name: "Akash Guitar",
    musician_id: "m6",
    verified: true,
    photo: null,
    available_dates: null
  },
  {
    id: "g7",
    gear_type: "lighting",
    name: "Fog Machine + 2 Laser Lights",
    description: "Professional fog machine + 2 RGB laser light units. Perfect for parties and club events.",
    rate_per_day: 1200,
    available: true,
    city: "Vasai",
    musician_name: "Event Pro Vasai",
    musician_id: "m7",
    verified: false,
    photo: null,
    available_dates: null
  },
  {
    id: "g8",
    gear_type: "instrument",
    name: "Traditional Dhol Set (2 dhols)",
    description: "Two professional-grade dhols with sticks and bags. Perfect for baraats and weddings.",
    rate_per_day: 800,
    available: true,
    city: "Nalasopara",
    musician_name: "Dhol Wala Suresh",
    musician_id: "m8",
    verified: true,
    photo: null,
    available_dates: null
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || null;
  const type = searchParams.get("type") || null;
  const availableOnly = searchParams.get("available") === "true";
  const date = searchParams.get("date") || null;

  let listings = [...MOCK_GEAR_LISTINGS];

  // Filter by city
  if (city && city !== "Anywhere") {
    listings = listings.filter((l) =>
      l.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Filter by type
  if (type) {
    listings = listings.filter((l) => l.gear_type === type);
  }

  // Filter by availability
  if (availableOnly) {
    listings = listings.filter((l) => l.available);
  }

  return NextResponse.json({
    listings,
    total: listings.length,
    filters: { city, type, available: availableOnly, date },
    generated_at: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      gear_type: string;
      name: string;
      description?: string;
      rate_per_day: number;
      city: string;
      available_dates?: string[];
      musician_id?: string;
    };

    const { gear_type, name, description, rate_per_day, city, available_dates, musician_id } = body;

    // Validate required fields
    if (!gear_type || !name || !rate_per_day || !city) {
      return NextResponse.json(
        { error: "gear_type, name, rate_per_day, and city are required" },
        { status: 400 }
      );
    }

    if (rate_per_day < 100 || rate_per_day > 50000) {
      return NextResponse.json(
        { error: "rate_per_day must be between ₹100 and ₹50,000" },
        { status: 400 }
      );
    }

    // In production: insert into gear_listings table
    // const supabase = createServerSupabaseClient();
    // const { data, error } = await supabase.from("gear_listings").insert({ ... })

    const newListing = {
      id: `g_${Date.now()}`,
      gear_type,
      name,
      description: description || null,
      rate_per_day,
      available: true,
      city,
      musician_name: "You",
      musician_id: musician_id || "unknown",
      verified: false,
      photo: null,
      available_dates: available_dates || null,
      created_at: new Date().toISOString()
    };

    return NextResponse.json(
      { success: true, listing: newListing, message: "Gear listing created successfully" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
