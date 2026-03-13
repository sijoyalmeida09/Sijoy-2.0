export type Role = "admin" | "musician" | "client" | "user";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  loyalty_points: number;
  metadata: Record<string, unknown> | null;
}

// ── Vasaikar Live ──────────────────────────────

export type BookingStatus =
  | "requested"
  | "accepted"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "disputed";

export type PayoutStatus = "pending" | "processing" | "settled" | "failed";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type EscrowStatus =
  | "awaiting_deposit"
  | "deposit_held"
  | "full_payment_held"
  | "released"
  | "refunded"
  | "disputed";

export const VALID_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested: ["accepted", "cancelled"],
  accepted: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "disputed"],
  completed: ["disputed"],
  cancelled: [],
  disputed: ["completed", "cancelled"]
};

export interface Genre {
  id: number;
  slug: string;
  name: string;
}

export interface Instrument {
  id: number;
  slug: string;
  name: string;
}

export interface ArtistProfile {
  id: string;
  user_id: string;
  stage_name: string;
  bio: string | null;
  hourly_rate: number | null;
  event_rate: number | null;
  city: string;
  region: string;
  available: boolean;
  commission_pct: number;
  profile_photo: string | null;
  cover_photo: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  phone_visible: boolean;
  search_rank: number;
  total_bookings: number;
  avg_rating: number;
  featured: boolean;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  metadata: Record<string, unknown> | null;
  genres?: Genre[];
  instruments?: Instrument[];
}

export interface ArtistMedia {
  id: string;
  artist_id: string;
  media_type: "image" | "video" | "audio" | "youtube";
  url: string;
  thumbnail: string | null;
  title: string | null;
  sort_order: number;
}

export interface EventBooking {
  id: string;
  organizer_id: string;
  artist_id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  event_end_date: string | null;
  venue: string | null;
  city: string;
  description: string | null;
  agreed_amount: number;
  platform_fee_pct: number;
  artist_payout: number;
  platform_revenue: number;
  status: BookingStatus;
  escrow_status: EscrowStatus;
  deposit_amount: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_id: string | null;
  payout_status: PayoutStatus;
  payout_settled_at: string | null;
  referral_code: string | null;
  cancellation_reason: string | null;
  metadata: Record<string, unknown> | null;
}

export interface BookingReview {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
}

export interface ArtistShareLink {
  id: string;
  artist_id: string;
  code: string;
  clicks: number;
  bookings: number;
}
