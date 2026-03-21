export type EntityType = 'individual' | 'band' | 'agency'
export type ProviderStatus = 'pending' | 'verified' | 'suspended' | 'rejected'
export type CommissionTier = 'founder' | 'standard' | 'premium'
export type BandPromotionTier = 'standard_penalty' | 'basic' | 'featured' | 'spotlight'
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise'
export type BookingStatus = 'pending' | 'pending_verification' | 'confirmed' | 'completed' | 'cancelled' | 'disputed'
export type LeadStatus = 'open' | 'matched' | 'quoted' | 'booked' | 'closed'
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired'
export type InstantGigStatus = 'broadcast' | 'accepted' | 'expired' | 'cancelled'
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed'
export type UserRole = 'client' | 'provider' | 'admin'

export interface Provider {
  id: string
  profile_id: string
  entity_type: EntityType
  band_name?: string
  display_name: string
  bio?: string
  ai_generated_bio?: string
  instruments?: string[]
  categories: string[]
  state: string
  city: string
  languages: string[]
  base_rate_inr: number
  hourly_rate_inr?: number
  travel_radius_km: number
  avg_rating: number
  total_gigs: number
  is_online: boolean
  live_location?: { lat: number; lng: number }
  is_founder: boolean
  commission_tier: CommissionTier
  band_promotion_tier: BandPromotionTier
  subscription_tier: SubscriptionTier
  response_rate: number
  profile_completeness: number
  status: ProviderStatus
  video_preview_url?: string
  photo_urls: string[]
  audio_urls: string[]
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  phone?: string
  role: UserRole
  full_name: string
  avatar_url?: string
  created_at: string
}

export interface Client {
  id: string
  profile_id: string
  profile?: Profile
  preferred_cities?: string[]
  saved_providers?: string[]
  created_at: string
}

export interface Category {
  slug: string
  name: string
  name_hi: string
  parent_id?: string
  icon: string
  sort_order: number
  children?: Category[]
}

export interface Lead {
  id: string
  client_id: string
  event_type: string
  event_date: string
  event_time?: string
  duration_hours?: number
  location_text: string
  location_lat?: number
  location_lng?: number
  budget_hint_inr?: number
  notes?: string
  status: LeadStatus
  ai_parsed_json?: AISearchResponse
  created_at: string
  client?: Client
  lead_providers?: LeadProvider[]
}

export interface LeadProvider {
  id: string
  lead_id: string
  provider_id: string
  sent_at: string
  viewed_at?: string
  provider?: Provider
}

export interface Quote {
  id: string
  lead_id: string
  provider_id: string
  quoted_amount_inr: number
  event_type: string
  commission_rate: number
  client_display_amount_inr: number
  services_description: string
  valid_until: string
  status: QuoteStatus
  created_at: string
  provider?: Provider
  lead?: Lead
}

export interface Booking {
  id: string
  lead_id?: string
  quote_id?: string
  provider_id: string
  client_id: string
  event_type: string
  event_date: string
  event_time?: string
  duration_hours?: number
  location: string
  total_amount_inr: number
  provider_payout_inr: number
  platform_commission_inr: number
  utr_number?: string
  razorpay_payment_id?: string
  razorpay_order_id?: string
  status: BookingStatus
  notes?: string
  created_at: string
  updated_at: string
  provider?: Provider
  client?: Client
}

export interface Review {
  id: string
  booking_id: string
  provider_id: string
  client_id: string
  rating: number
  title?: string
  body: string
  photo_urls?: string[]
  is_verified: boolean
  created_at: string
  client?: Client
}

export interface InstantGig {
  id: string
  event_type: string
  category_ids: string[]
  location_lat: number
  location_lng: number
  location_text: string
  start_time: string
  duration_hours: number
  budget_inr: number
  provider_payout_inr: number
  status: InstantGigStatus
  accepted_by_id?: string
  client_id: string
  broadcast_at: string
  expires_at: string
  created_at: string
  client?: Client
  accepted_provider?: Provider
}

export interface Message {
  id: string
  lead_id: string
  sender_profile_id: string
  body: string
  attachment_urls?: string[]
  read_at?: string
  created_at: string
  sender?: Profile
}

export interface Palette {
  id: string
  name: string
  event_type: string
  region: string
  provider_ids: string[]
  package_fee_percentage: number
  is_active: boolean
  description?: string
  providers?: Provider[]
  created_at: string
}

export interface CalendarEvent {
  id: string
  provider_id: string
  title: string
  event_type: string
  start_at: string
  end_at: string
  booking_id?: string
  source: 'manual' | 'booking' | 'google' | 'ical'
  blocks_leads: boolean
  is_public: boolean
  created_at: string
}

export interface CancellationPolicy {
  id: string
  provider_id: string
  name: string
  deposit_refundable: boolean
  balance_refundable: boolean
  cancellation_window_days: number
  is_default: boolean
  created_at: string
}

export interface Dispute {
  id: string
  booking_id: string
  reporter_id: string
  reason: string
  evidence_urls?: string[]
  status: DisputeStatus
  resolution_type?: string
  resolved_by?: string
  resolved_at?: string
  created_at: string
}

// LLM / AI Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AISearchResponse {
  categories: string[]
  city?: string
  state?: string
  event_type: string
  mood?: string
  budget_hint?: number
  guest_count?: number
  language_preference?: string
  narrative: string
}

export interface SearchResult {
  interpretation: AISearchResponse
  artists: Provider[]
  palette_suggestion?: PaletteSuggestion
}

export interface PaletteSuggestion {
  title: string
  description: string
  provider_types: string[]
  estimated_total_inr: number
  savings_percentage: number
}

export interface AdminAnalytics {
  online_providers: number
  active_gigs: number
  pending_leads: number
  pending_verifications: number
  gmv_today_inr: number
  gmv_month_inr: number
  commission_today_inr: number
  commission_month_inr: number
  total_providers: number
  total_clients: number
}

export interface EarningsSummary {
  total_inr: number
  this_month_inr: number
  pending_payout_inr: number
  completed_bookings: number
  avg_booking_value_inr: number
  commission_paid_inr: number
}
