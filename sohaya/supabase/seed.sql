-- Sohaya Seed Data: 50 Diverse Indian Artists
-- photo_urls use DiceBear fun-emoji avatars as placeholders
-- Run after migrations: paste into Supabase SQL editor
-- Execution order: auth.users → profiles → providers

-- ── 0. pgcrypto (required for crypt()) ──────────────────────────────────────
create extension if not exists pgcrypto;

-- ── 1. auth.users — must exist before profiles (FK constraint) ──────────────
insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
)
select
  ('11111111-1111-1111-1111-1111111111' || lpad(gs::text, 2, '0'))::uuid,
  'artist_seed_' || gs || '@sohaya.app',
  crypt('SeedPassword123!', gen_salt('bf')),
  now(), now(), now(),
  jsonb_build_object('full_name', 'Seed Artist ' || gs, 'role', 'provider'),
  'authenticated',
  'authenticated'
from generate_series(1, 50) as gs
on conflict (id) do nothing;

-- ── 2. Profiles ─────────────────────────────────────────────────────────────
do $$
declare
  profile_ids uuid[] := array[
    '11111111-1111-1111-1111-111111111101'::uuid,
    '11111111-1111-1111-1111-111111111102'::uuid,
    '11111111-1111-1111-1111-111111111103'::uuid,
    '11111111-1111-1111-1111-111111111104'::uuid,
    '11111111-1111-1111-1111-111111111105'::uuid,
    '11111111-1111-1111-1111-111111111106'::uuid,
    '11111111-1111-1111-1111-111111111107'::uuid,
    '11111111-1111-1111-1111-111111111108'::uuid,
    '11111111-1111-1111-1111-111111111109'::uuid,
    '11111111-1111-1111-1111-111111111110'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '11111111-1111-1111-1111-111111111112'::uuid,
    '11111111-1111-1111-1111-111111111113'::uuid,
    '11111111-1111-1111-1111-111111111114'::uuid,
    '11111111-1111-1111-1111-111111111115'::uuid,
    '11111111-1111-1111-1111-111111111116'::uuid,
    '11111111-1111-1111-1111-111111111117'::uuid,
    '11111111-1111-1111-1111-111111111118'::uuid,
    '11111111-1111-1111-1111-111111111119'::uuid,
    '11111111-1111-1111-1111-111111111120'::uuid,
    '11111111-1111-1111-1111-111111111121'::uuid,
    '11111111-1111-1111-1111-111111111122'::uuid,
    '11111111-1111-1111-1111-111111111123'::uuid,
    '11111111-1111-1111-1111-111111111124'::uuid,
    '11111111-1111-1111-1111-111111111125'::uuid,
    '11111111-1111-1111-1111-111111111126'::uuid,
    '11111111-1111-1111-1111-111111111127'::uuid,
    '11111111-1111-1111-1111-111111111128'::uuid,
    '11111111-1111-1111-1111-111111111129'::uuid,
    '11111111-1111-1111-1111-111111111130'::uuid,
    '11111111-1111-1111-1111-111111111131'::uuid,
    '11111111-1111-1111-1111-111111111132'::uuid,
    '11111111-1111-1111-1111-111111111133'::uuid,
    '11111111-1111-1111-1111-111111111134'::uuid,
    '11111111-1111-1111-1111-111111111135'::uuid,
    '11111111-1111-1111-1111-111111111136'::uuid,
    '11111111-1111-1111-1111-111111111137'::uuid,
    '11111111-1111-1111-1111-111111111138'::uuid,
    '11111111-1111-1111-1111-111111111139'::uuid,
    '11111111-1111-1111-1111-111111111140'::uuid,
    '11111111-1111-1111-1111-111111111141'::uuid,
    '11111111-1111-1111-1111-111111111142'::uuid,
    '11111111-1111-1111-1111-111111111143'::uuid,
    '11111111-1111-1111-1111-111111111144'::uuid,
    '11111111-1111-1111-1111-111111111145'::uuid,
    '11111111-1111-1111-1111-111111111146'::uuid,
    '11111111-1111-1111-1111-111111111147'::uuid,
    '11111111-1111-1111-1111-111111111148'::uuid,
    '11111111-1111-1111-1111-111111111149'::uuid,
    '11111111-1111-1111-1111-111111111150'::uuid
  ];
  p_id uuid;
  idx int := 1;
begin
  foreach p_id in array profile_ids loop
    insert into profiles (id, email, full_name, role)
    values (p_id, 'artist_seed_' || idx || '@sohala.app', 'Seed Artist ' || idx, 'provider')
    on conflict (id) do nothing;
    idx := idx + 1;
  end loop;
end $$;

-- ── 2. Providers ───────────────────────────────────────────────────────────
insert into providers (
  profile_id, entity_type, display_name, bio, ai_generated_bio,
  categories, state, city, languages,
  base_rate_inr, hourly_rate_inr, travel_radius_km,
  avg_rating, total_gigs, is_online, is_founder,
  commission_tier, band_promotion_tier, subscription_tier,
  response_rate, profile_completeness, status,
  photo_urls, instruments
) values

-- 01 · Ghazal · Pune
(
  '11111111-1111-1111-1111-111111111101', 'individual', 'Rajan Mishra',
  'Award-winning ghazal vocalist from Pune with 15 years on stage.',
  'Rajan Mishra weaves timeless Urdu poetry into evenings that linger long after the last note fades. With 400+ performances across India''s finest venues, his voice carries the weight of tradition and the lightness of pure emotion.',
  array['ghazal','classical'], 'Maharashtra', 'Pune', array['Hindi','Urdu','Marathi'],
  15000, 3000, 100, 4.8, 87, false, true,
  'founder','basic','pro', 98, 95, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=RajanMishra'], array['Harmonium','Tabla']
),

-- 02 · Bollywood Band · Mumbai
(
  '11111111-1111-1111-1111-111111111102', 'band', 'The Mumbai Beats',
  'High-energy Bollywood band covering 3 decades of Hindi cinema hits.',
  'The Mumbai Beats are the heartbeat of every celebration they touch. Their 7-piece ensemble blends live instruments with impeccable vocals to recreate Bollywood magic from Kishore Kumar''s golden era to today''s chart-toppers.',
  array['bollywood-band','wedding-specialist'], 'Maharashtra', 'Mumbai', array['Hindi','English','Marathi'],
  45000, null, 200, 4.9, 234, true, true,
  'founder','featured','enterprise', 99, 100, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=MumbaBeats'], array['Guitar','Bass','Keyboard','Drums','Violin']
),

-- 03 · DJ · Mumbai
(
  '11111111-1111-1111-1111-111111111103', 'individual', 'DJ Priya',
  'Mumbai''s top female DJ — Bollywood, commercial and EDM fusion.',
  'DJ Priya has redefined what it means to command a dance floor. Her signature blend of Bollywood anthems and commercial house keeps crowds dancing from 9pm to sunrise at Mumbai''s most coveted venues.',
  array['dj'], 'Maharashtra', 'Mumbai', array['Hindi','English'],
  20000, 5000, 150, 4.7, 156, true, false,
  'standard','basic','pro', 95, 88, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=DJPriya'], array['CDJ','Mixer']
),

-- 04 · Bharatnatyam · Chennai
(
  '11111111-1111-1111-1111-111111111104', 'individual', 'Meena Krishnan',
  'Bharatnatyam dancer with Kalakshetra training, performing at weddings and corporates.',
  'Meena Krishnan''s Bharatnatyam is a conversation between ancient temple traditions and contemporary Indian identity. Trained at Kalakshetra Foundation, she brings rigorous classical training to every performance.',
  array['dancer','childrens-act'], 'Tamil Nadu', 'Chennai', array['Tamil','Hindi','English'],
  12000, 2500, 80, 4.9, 112, false, true,
  'founder','basic','basic', 100, 92, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=MeenaKrishnan'], array[]::text[]
),

-- 05 · Stand-up Comedian · Delhi
(
  '11111111-1111-1111-1111-111111111105', 'individual', 'Vikram Sharma',
  'Stand-up comedian and corporate emcee from Delhi with 8 years on stage.',
  'Vikram Sharma has made boardrooms burst with laughter and wedding halls erupt in joy. His sharp observational comedy and bilingual delivery make him the most-booked emcee for corporate awards nights across Delhi NCR.',
  array['comedian','emcee','corporate-speaker'], 'Delhi', 'New Delhi', array['Hindi','English','Punjabi'],
  18000, 4000, 200, 4.6, 89, false, false,
  'standard','basic','pro', 92, 85, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=VikramSharma'], array[]::text[]
),

-- 06 · Dhol · Punjab
(
  '11111111-1111-1111-1111-111111111106', 'individual', 'Arjun Dhol',
  'Professional dhol player from Punjab with Bhangra expertise.',
  'Arjun''s dhol isn''t just music — it''s an invitation to lose yourself completely. Born into a family of traditional musicians in Amritsar, he brings the raw energy of Punjab''s harvest celebrations to every baraat he leads.',
  array['dhol','folk'], 'Punjab', 'Chandigarh', array['Punjabi','Hindi'],
  8000, null, 300, 4.8, 203, true, false,
  'standard','basic','free', 97, 78, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=ArjunDhol'], array['Dhol','Dholki']
),

-- 07 · Sufi Folk · Ahmedabad
(
  '11111111-1111-1111-1111-111111111107', 'individual', 'Sana Qureshi',
  'Sufi and folk vocalist performing in Hindi, Urdu and Gujarati.',
  'Sana Qureshi sings at the intersection of the sacred and the celebratory. Her Sufi renditions carry the mystical depth of centuries-old qawwali traditions while her folk songs capture the joyful essence of Gujarat''s vibrant culture.',
  array['folk','ghazal','wedding-specialist'], 'Gujarat', 'Ahmedabad', array['Hindi','Urdu','Gujarati'],
  10000, 2000, 150, 4.7, 64, false, false,
  'standard','basic','basic', 88, 82, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=SanaQureshi'], array['Harmonium']
),

-- 08 · Jazz Ensemble · Bangalore
(
  '11111111-1111-1111-1111-111111111108', 'band', 'Bangalore Jazz Collective',
  'Premium jazz ensemble for corporate events, restaurants and upscale receptions.',
  'The Bangalore Jazz Collective redefines sophistication in live entertainment. Their seamless blend of American jazz standards, Brazilian bossa nova, and original Indo-jazz compositions has made them the house band of Bangalore''s finest five-star hotels.',
  array['classical','bollywood-band'], 'Karnataka', 'Bangalore', array['English','Hindi','Kannada'],
  35000, 8000, 100, 4.9, 178, false, true,
  'founder','spotlight','enterprise', 100, 98, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=BangaloreJazz'], array['Saxophone','Double Bass','Piano','Drums','Trumpet']
),

-- 09 · Motivational Speaker · Mumbai
(
  '11111111-1111-1111-1111-111111111109', 'individual', 'Rahul Kapoor',
  'Motivational speaker and life coach with TEDx credentials.',
  'Rahul Kapoor has the rare gift of turning corporate jargon into human stories. His TEDx talks have been viewed over 2 million times, and his keynotes consistently rank as the highlight of leadership summits across India.',
  array['motivational','corporate-speaker'], 'Maharashtra', 'Mumbai', array['Hindi','English'],
  50000, null, 500, 4.8, 45, false, false,
  'standard','basic','pro', 90, 90, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=RahulKapoor'], array[]::text[]
),

-- 10 · Wedding Host · Kochi
(
  '11111111-1111-1111-1111-111111111110', 'individual', 'Kavita Nair',
  'Professional wedding host and bilingual emcee based in Kochi.',
  'Kavita Nair makes every wedding feel like it was made for cinema. Fluent in Malayalam, Hindi and English, she moves effortlessly between cultures, stitching together the most important day of your life with warmth, wit and grace.',
  array['wedding-host','emcee'], 'Kerala', 'Kochi', array['Malayalam','Hindi','English'],
  15000, 3500, 120, 4.8, 93, true, false,
  'standard','basic','basic', 96, 87, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=KavitaNair'], array[]::text[]
),

-- 11 · Tabla Maestro · Varanasi
(
  '11111111-1111-1111-1111-111111111111', 'individual', 'Pandit Suresh Tiwari',
  'Tabla maestro from Varanasi''s Benaras gharana with 30 years of classical concerts.',
  'Pandit Suresh Tiwari speaks a language older than words. His tabla conversations range from the intimate whisper of a morning raga to the thunderous climax of a festival concert — each beat precisely placed, each composition a meditation.',
  array['classical'], 'Uttar Pradesh', 'Varanasi', array['Hindi','Bhojpuri'],
  20000, 4000, 200, 4.9, 320, false, false,
  'standard','basic','pro', 85, 90, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=SureshTiwari'], array['Tabla']
),

-- 12 · Carnatic Vocalist · Chennai
(
  '11111111-1111-1111-1111-111111111112', 'individual', 'Vidya Subramanian',
  'Carnatic vocalist and music teacher, performing at sabhas and weddings across Tamil Nadu.',
  'Vidya Subramanian''s voice is a vessel for the ancient language of Carnatic music. Trained under Vidushi Sudha Raghunathan, she renders krithis with a clarity and devotion that silences even the most restless audience.',
  array['classical'], 'Tamil Nadu', 'Chennai', array['Tamil','Telugu','Sanskrit'],
  14000, 3000, 80, 4.8, 145, false, false,
  'standard','basic','basic', 92, 88, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=VidyaSubramanian'], array['Veena','Harmonium']
),

-- 13 · Kathak Dancer · Lucknow
(
  '11111111-1111-1111-1111-111111111113', 'individual', 'Ananya Chaturvedi',
  'Kathak dancer trained in the Lucknow gharana, performing at weddings and cultural events.',
  'Ananya Chaturvedi''s footwork tells stories the spoken word cannot. Her Kathak — deeply rooted in the Lucknow gharana''s graceful nawabi aesthetic — turns every stage into a royal court where the ghungroo are the only authority.',
  array['dancer'], 'Uttar Pradesh', 'Lucknow', array['Hindi','English'],
  10000, 2500, 150, 4.7, 78, false, false,
  'standard','basic','basic', 90, 85, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=AnanyaChaturvedi'], array[]::text[]
),

-- 14 · Rajasthani Folk Band · Jaipur
(
  '11111111-1111-1111-1111-111111111114', 'band', 'Manganiyar Desert Winds',
  'Hereditary folk musicians from Rajasthan performing Manganiyar and Langa traditions.',
  'Manganiyar Desert Winds carry five centuries of musical memory from the Thar Desert to your event. Their instruments — khamaycha, morchang, dholak — sound like the desert itself is singing, and their voices reach places modern music cannot.',
  array['folk'], 'Rajasthan', 'Jaipur', array['Rajasthani','Hindi'],
  25000, null, 250, 4.9, 167, true, false,
  'standard','basic','pro', 94, 88, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=ManganiyarDesert'], array['Khamaycha','Morchang','Dholak','Sarangi']
),

-- 15 · Rabindra Sangeet · Kolkata
(
  '11111111-1111-1111-1111-111111111115', 'individual', 'Debashree Banerjee',
  'Rabindra Sangeet vocalist and Visva-Bharati alumna performing across Bengal and beyond.',
  'Debashree Banerjee carries Tagore''s legacy not as a museum piece but as a living conversation. Each song she sings feels like a private letter from the poet himself — intimate, philosophical, and quietly devastating in its beauty.',
  array['classical','folk'], 'West Bengal', 'Kolkata', array['Bengali','Hindi','English'],
  12000, 2500, 100, 4.8, 110, false, false,
  'standard','basic','basic', 91, 86, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=DebashreeBanerjee'], array['Esraj','Harmonium']
),

-- 16 · Rock Band · Goa
(
  '11111111-1111-1111-1111-111111111116', 'band', 'The Konkani Rockers',
  'Goa''s premier rock band blending classic rock with Konkani folk influences.',
  'The Konkani Rockers were born on Goa''s beach-shack circuit and grew into arenas. Their signature sound fuses Hendrix-era rock with the lilting rhythms of Konkani folk music — a collision that shouldn''t work but is somehow irresistible.',
  array['bollywood-band'], 'Goa', 'Panaji', array['Konkani','Hindi','English'],
  30000, null, 150, 4.7, 89, true, false,
  'standard','basic','pro', 88, 90, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=KonkaniRockers'], array['Electric Guitar','Bass','Drums','Keyboard']
),

-- 17 · Bihu Group · Assam
(
  '11111111-1111-1111-1111-111111111117', 'band', 'Bihu Rong',
  'Traditional Assamese Bihu dance and music troupe available for cultural programmes.',
  'Bihu Rong brings the electric joy of Rongali Bihu to stages across India. Dressed in traditional mekhela-chador, their dancers spin with an abandon that is contagious — by the third song, the audience is always on their feet.',
  array['dancer','folk'], 'Assam', 'Guwahati', array['Assamese','Bengali','Hindi'],
  18000, null, 200, 4.8, 56, false, false,
  'standard','basic','basic', 89, 82, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=BihuRong'], array['Dhol','Pepa','Toka','Gogona']
),

-- 18 · Qawwali Group · Hyderabad
(
  '11111111-1111-1111-1111-111111111118', 'band', 'Nizami Qawwal Party',
  'Hyderabad-based Sufi qawwali ensemble performing devotional and celebratory qawwali.',
  'The Nizami Qawwal Party has been carrying the flame of Hyderabadi Sufi music for three generations. Their qawwali builds slowly like a fire — gentle devotion that gradually engulfs the entire room in spiritual ecstasy.',
  array['folk','ghazal'], 'Telangana', 'Hyderabad', array['Urdu','Hindi','Telugu'],
  20000, null, 200, 4.9, 134, false, false,
  'standard','basic','pro', 96, 91, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=NizamiQawwal'], array['Harmonium','Tabla','Dholak']
),

-- 19 · Mohiniyattam · Thiruvananthapuram
(
  '11111111-1111-1111-1111-111111111119', 'individual', 'Lakshmi Menon',
  'Mohiniyattam dancer and Kerala Sangeetha Nataka Akademi awardee.',
  'Lakshmi Menon dances like water moving — fluid, inevitable, hypnotic. Her Mohiniyattam, honed over two decades under legendary gurus, has won audiences from the Kerala Kalamandalam to international dance festivals in Europe.',
  array['dancer'], 'Kerala', 'Thiruvananthapuram', array['Malayalam','Hindi','English'],
  13000, 3000, 100, 4.9, 98, false, false,
  'standard','basic','pro', 95, 92, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=LakshmiMenon'], array[]::text[]
),

-- 20 · EDM DJ · Bengaluru
(
  '11111111-1111-1111-1111-111111111120', 'individual', 'DJ Aryan Flux',
  'Progressive house and techno DJ based in Bengaluru with international festival credits.',
  'DJ Aryan Flux builds dance floors from scratch. His four-hour sets are architectural — a careful construction of tension and release, sunrise moments and floor-shaking drops, beloved by Bengaluru''s underground rave circuit and corporate crowds alike.',
  array['dj'], 'Karnataka', 'Bangalore', array['English','Hindi','Kannada'],
  25000, 6000, 200, 4.7, 112, true, false,
  'standard','basic','pro', 93, 87, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=AryanFlux'], array['CDJ','Synthesizer','Ableton']
),

-- 21 · Bansuri Flute · Rishikesh
(
  '11111111-1111-1111-1111-111111111121', 'individual', 'Pt. Deepak Sharma',
  'Hindustani bansuri player, disciple of Pandit Hariprasad Chaurasia''s school.',
  'Pt. Deepak Sharma''s bansuri does not merely play Hindustani ragas — it breathes them. Each morning raga feels like sunrise over the Ganga; each evening raga, like the last light fading from the mountains.',
  array['classical'], 'Uttarakhand', 'Rishikesh', array['Hindi','English'],
  16000, 3500, 300, 4.9, 201, false, true,
  'founder','basic','pro', 94, 93, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=DeepakSharma'], array['Bansuri']
),

-- 22 · Shehnai · Varanasi
(
  '11111111-1111-1111-1111-111111111122', 'individual', 'Ustad Fareed Khan',
  'Shehnai player from Varanasi performing at weddings and religious ceremonies.',
  'Ustad Fareed Khan''s shehnai has blessed ten thousand weddings, and each one felt like the first. His lineage traces directly to the legendary Bismillah Khan, and in his playing you can still hear that master''s reverence and grace.',
  array['classical','wedding-specialist'], 'Uttar Pradesh', 'Varanasi', array['Hindi','Urdu'],
  10000, null, 150, 4.8, 445, true, false,
  'standard','basic','basic', 97, 80, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=FareedKhan'], array['Shehnai']
),

-- 23 · Odissi · Bhubaneswar
(
  '11111111-1111-1111-1111-111111111123', 'individual', 'Priyanka Mohapatra',
  'Odissi dancer trained under Guru Kelucharan Mohapatra''s tradition.',
  'Priyanka Mohapatra''s Odissi is sculptural. Each pose could be lifted directly from the walls of Konark — and she is aware of that. Her performances create a dialogue between the ancient stone and the living body that is impossible to forget.',
  array['dancer'], 'Odisha', 'Bhubaneswar', array['Odia','Hindi','English'],
  11000, 2500, 150, 4.8, 73, false, false,
  'standard','basic','basic', 89, 85, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=PriyankaMohapatra'], array[]::text[]
),

-- 24 · Lavani · Kolhapur
(
  '11111111-1111-1111-1111-111111111124', 'individual', 'Sunanda Patil',
  'Tamasha Lavani performer from Kolhapur with high-energy stage shows.',
  'Sunanda Patil''s Lavani is a force of nature. Her nava-rasa storytelling through song and dance draws equally from the earthy sensibility of rural Maharashtra and the sophisticated poetic tradition of sant literature.',
  array['dancer','folk'], 'Maharashtra', 'Kolhapur', array['Marathi','Hindi'],
  9000, null, 100, 4.7, 188, false, false,
  'standard','basic','basic', 91, 79, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=SunandaPatil'], array['Dholki','Halgi']
),

-- 25 · Tamil Folk · Madurai
(
  '11111111-1111-1111-1111-111111111125', 'individual', 'Muthu Selvam',
  'Tamil folk singer performing Nadar and Kongu folk songs at village festivals and weddings.',
  'Muthu Selvam sings the songs that Tamil Nadu''s villages have sung for centuries — harvest hymns, love laments, battle cries — with a voice that carries the dust of red earth roads and the sweetness of jasmine garlands.',
  array['folk'], 'Tamil Nadu', 'Madurai', array['Tamil'],
  6000, null, 100, 4.7, 267, true, false,
  'standard','basic','free', 93, 75, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=MuthuSelvam'], array['Udukkai','Nayanam']
),

-- 26 · Hindustani Classical Vocalist · Kolkata
(
  '11111111-1111-1111-1111-111111111126', 'individual', 'Amitava Dey',
  'Hindustani khayal vocalist from the Patiala gharana, trained under Ustad Rashid Khan.',
  'Amitava Dey''s khayal unfolds like a slow dawn — unhurried, inevitable, and absolutely transformative. His vilambit compositions create a meditative space that concert-goers describe as the closest thing to silence that music can achieve.',
  array['classical'], 'West Bengal', 'Kolkata', array['Bengali','Hindi','Urdu'],
  18000, 4000, 150, 4.9, 134, false, false,
  'standard','basic','pro', 88, 91, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=AmitavaDey'], array['Harmonium','Tanpura']
),

-- 27 · Veena · Mysuru
(
  '11111111-1111-1111-1111-111111111127', 'individual', 'Dr. Kamala Rao',
  'Saraswati Veena exponent and music professor performing at Carnatic sabhas and weddings.',
  'Dr. Kamala Rao''s veena speaks in the language of temples and starlit courtyards. Her mastery of Carnatic gamaka brings a depth to each note that can only come from 40 years of daily communion with this most demanding of instruments.',
  array['classical'], 'Karnataka', 'Mysuru', array['Kannada','Telugu','Tamil','Hindi'],
  14000, 3000, 80, 4.8, 156, false, false,
  'standard','basic','pro', 92, 89, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=KamalaRao'], array['Veena']
),

-- 28 · Blues Guitarist · Bengaluru
(
  '11111111-1111-1111-1111-111111111128', 'individual', 'Marcus D''Souza',
  'Blues and roots guitarist from Bangalore with 12 years of international gigging.',
  'Marcus D''Souza plays blues the way the old masters intended — with a grievance and a grin. His slide guitar work, shaped by years studying Delta blues and Carnatic slide techniques, is unlike anything else on the Indian music scene.',
  array['bollywood-band'], 'Karnataka', 'Bangalore', array['English','Kannada','Hindi'],
  15000, 3500, 150, 4.7, 92, true, false,
  'standard','basic','basic', 87, 84, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=MarcusDSouza'], array['Electric Guitar','Slide Guitar','Harmonica']
),

-- 29 · Bhajan Singer · Vrindavan
(
  '11111111-1111-1111-1111-111111111129', 'individual', 'Radha Devi',
  'Devotional bhajan and kirtan singer based in Vrindavan, available for puja and events.',
  'Radha Devi''s bhajans have filled the courtyards of Vrindavan''s temples for twenty years. Her voice carries the complete surrender of a devotee — and that authenticity reaches across faiths, touching hearts that have never heard Sanskrit before.',
  array['folk'], 'Uttar Pradesh', 'Mathura', array['Hindi','Braj Bhasha','Sanskrit'],
  7000, null, 100, 4.9, 312, false, false,
  'standard','basic','free', 96, 77, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=RadhaDevi'], array['Harmonium','Manjira']
),

-- 30 · Acoustic Singer-Songwriter · Pune
(
  '11111111-1111-1111-1111-111111111130', 'individual', 'Ishaan Malhotra',
  'Acoustic indie pop singer-songwriter performing at cafes, small venues and weddings.',
  'Ishaan Malhotra writes songs that fit perfectly in the quiet moment between the ceremony and the party. His acoustic pop sits at the intersection of John Mayer and early Arijit Singh — intimate, melodic, and impossible to tune out.',
  array['bollywood-band','wedding-specialist'], 'Maharashtra', 'Pune', array['Hindi','English','Marathi'],
  12000, 3000, 100, 4.6, 67, true, false,
  'standard','basic','basic', 90, 83, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=IshaanMalhotra'], array['Acoustic Guitar','Cajon']
),

-- 31 · Kashmiri Sufi · Srinagar
(
  '11111111-1111-1111-1111-111111111131', 'individual', 'Altaf Wani',
  'Kashmiri Sufiana Kalam and Chakri singer performing traditional songs of the valley.',
  'Altaf Wani''s Sufiana Kalam arrives from a place of deep stillness. Born in Srinagar, he grew up hearing these devotional verses echo off Dal Lake''s houseboats. His performance is less a concert and more a journey to the Kashmir of the imagination.',
  array['folk','ghazal'], 'Jammu and Kashmir', 'Srinagar', array['Kashmiri','Urdu','Hindi'],
  11000, 2500, 200, 4.8, 88, false, false,
  'standard','basic','basic', 87, 82, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=AltafWani'], array['Santoor','Tabla','Saz-e-Kashmir']
),

-- 32 · Baul · Santiniketan
(
  '11111111-1111-1111-1111-111111111132', 'individual', 'Gour Das Baul',
  'UNESCO-recognised Baul singer from Birbhum performing mystical Bengali folk songs.',
  'Gour Das Baul carries the ancient wandering tradition of Bengal''s mystic minstrels into the 21st century. His ektara and dubki set a pulse that feels older than religion, and his lyrics about the inner universe leave audiences thoughtfully quiet.',
  array['folk'], 'West Bengal', 'Santiniketan', array['Bengali'],
  8000, null, 200, 4.9, 143, false, false,
  'standard','basic','basic', 91, 80, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=GourDasBaul'], array['Ektara','Dubki','Khamak']
),

-- 33 · Sitar · Delhi
(
  '11111111-1111-1111-1111-111111111133', 'individual', 'Rohan Bose',
  'Young sitar virtuoso trained under the Maihar gharana tradition, Delhi-based.',
  'Rohan Bose plays sitar the way a poet writes — with absolute economy and explosive consequence. At 28, he is already being spoken of in the same breath as the next generation of great Maihar musicians.',
  array['classical'], 'Delhi', 'New Delhi', array['Hindi','Bengali','English'],
  17000, 4000, 200, 4.8, 66, false, false,
  'standard','basic','pro', 89, 88, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=RohanBose'], array['Sitar','Tanpura']
),

-- 34 · Hip-Hop · Delhi
(
  '11111111-1111-1111-1111-111111111134', 'individual', 'MC Sher',
  'Delhi-based Hindi hip-hop artist and battle rapper performing at colleges and festivals.',
  'MC Sher grew up on Delhi''s streets and memorised them in rhyme. His Hindi rap is cinematic, angry, funny and tender all at once — the kind of music that makes you feel seen whether you''re from Laxmi Nagar or South Ex.',
  array['bollywood-band'], 'Delhi', 'New Delhi', array['Hindi','Punjabi','English'],
  14000, 3500, 150, 4.6, 54, true, false,
  'standard','basic','basic', 85, 82, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=MCSher'], array['Microphone']
),

-- 35 · Lounge Jazz Singer · Mumbai
(
  '11111111-1111-1111-1111-111111111135', 'individual', 'Zara Singh',
  'Jazz and lounge vocalist performing Hindi jazz standards and original compositions.',
  'Zara Singh sings jazz the way Mumbai nights feel — warm, a little melancholy, glamorous without effort. Her signature arrangements of Hindi film classics in jazz idiom have made her the most requested act at the city''s finest rooftop restaurants.',
  array['bollywood-band','wedding-specialist'], 'Maharashtra', 'Mumbai', array['Hindi','English'],
  22000, 5000, 100, 4.8, 101, true, false,
  'standard','basic','pro', 93, 90, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=ZaraSingh'], array['Microphone','Piano']
),

-- 36 · Fusion Percussionist · Chennai
(
  '11111111-1111-1111-1111-111111111136', 'individual', 'Karthik Natarajan',
  'World percussion and mridangam artist fusing Carnatic rhythms with world music.',
  'Karthik Natarajan treats the global percussion tradition as one vast conversation and inserts himself at every point of intersection. His ensemble work brings mridangam, djembe, cajon and kanjira into a single rhythmic argument that resolves in joy.',
  array['classical'], 'Tamil Nadu', 'Chennai', array['Tamil','English','Hindi'],
  16000, 3500, 150, 4.8, 87, false, false,
  'standard','basic','pro', 91, 87, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=KarthikNatarajan'], array['Mridangam','Djembe','Kanjira','Cajon']
),

-- 37 · Kirtan Group · Amritsar
(
  '11111111-1111-1111-1111-111111111137', 'band', 'Waheguru Jatha',
  'Sikh kirtan group performing at gurudwaras, weddings and anand karaj ceremonies.',
  'The Waheguru Jatha has been singing gurbani at the Golden Temple since 1985. Their kirtan carries the serenity of the Darbar Sahib — and when they perform at an Anand Karaj, even the most distracted mind falls quiet.',
  array['folk','wedding-specialist'], 'Punjab', 'Amritsar', array['Punjabi','Hindi'],
  12000, null, 300, 5.0, 567, false, false,
  'standard','basic','basic', 99, 85, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=WaheguruJatha'], array['Harmonium','Tabla','Sarangi']
),

-- 38 · Chhau Dance · Odisha
(
  '11111111-1111-1111-1111-111111111138', 'band', 'Saraikela Chhau Academy',
  'Mask dance troupe performing Chhau — UNESCO Intangible Cultural Heritage.',
  'The Saraikela Chhau Academy preserves one of India''s most visually dramatic dance forms. Their masked warriors leap across stages enacting episodes from the Mahabharata and Ramayana with an athleticism and theatricality that leaves audiences breathless.',
  array['dancer','folk'], 'Odisha', 'Bhubaneswar', array['Odia','Hindi'],
  20000, null, 200, 4.9, 102, false, false,
  'standard','basic','pro', 93, 88, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=SaraiBelaChhau'], array['Dhol','Shehnai','Mahuri']
),

-- 39 · Children's Entertainer · Pune
(
  '11111111-1111-1111-1111-111111111139', 'individual', 'Jadu Baba',
  'Professional magician, puppeteer and storyteller for children''s parties and school events.',
  'Jadu Baba has made 50,000 children''s eyes go wide with wonder. His blend of close-up magic, shadow puppetry, and interactive storytelling creates a bubble of pure childhood joy that even the most distracted four-year-old cannot escape.',
  array['childrens-act','comedian'], 'Maharashtra', 'Pune', array['Marathi','Hindi','English'],
  8000, 2000, 100, 4.9, 423, false, false,
  'standard','basic','basic', 97, 82, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=JaduBaba'], array[]::text[]
),

-- 40 · Jazz Piano · Kolkata
(
  '11111111-1111-1111-1111-111111111140', 'individual', 'Sebastian Rodrigues',
  'Classical and jazz pianist from Kolkata''s Anglo-Indian musical tradition.',
  'Sebastian Rodrigues is a living bridge between Kolkata''s faded colonial music halls and its vibrant jazz present. His piano style draws on Art Tatum, Oscar Peterson, and his grandmother''s collection of 78rpm records that filled their Park Street flat.',
  array['classical','bollywood-band'], 'West Bengal', 'Kolkata', array['English','Bengali','Hindi'],
  18000, 4000, 100, 4.8, 76, false, false,
  'standard','basic','pro', 88, 87, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=SebastianRodrigues'], array['Grand Piano','Electric Piano']
),

-- 41 · Wedding Playback Vocalist · Delhi
(
  '11111111-1111-1111-1111-111111111141', 'individual', 'Nikhil Pandey',
  'Bollywood playback-style wedding singer performing live at sangeet and reception.',
  'Nikhil Pandey was told his voice sounds like Arijit Singh on a better day. He has spent ten years trying to prove his voice teacher wrong and his fans right. His live renditions of current Bollywood hits are indistinguishable from the original — only warmer.',
  array['bollywood-band','wedding-specialist'], 'Delhi', 'New Delhi', array['Hindi','English'],
  16000, 3500, 200, 4.7, 145, true, false,
  'standard','basic','pro', 92, 89, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=NikhilPandey'], array['Microphone']
),

-- 42 · Saxophone · Goa
(
  '11111111-1111-1111-1111-111111111142', 'individual', 'Carlos Fernandes',
  'Goan saxophone player performing jazz, pop and Konkani instrumentals at events.',
  'Carlos Fernandes learned saxophone in his church, played it in beach shacks, and now performs it at weddings, corporate parties and jazz festivals. His tone is the audio equivalent of a sunset over Calangute — golden, unhurried and totally at peace.',
  array['bollywood-band'], 'Goa', 'Panaji', array['Konkani','English','Hindi'],
  13000, 3000, 100, 4.7, 118, true, false,
  'standard','basic','basic', 90, 84, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=CarlosFernandes'], array['Saxophone','Clarinet']
),

-- 43 · Semi-classical Vocalist · Bengaluru
(
  '11111111-1111-1111-1111-111111111143', 'individual', 'Preethi Hegde',
  'Semi-classical and light music vocalist performing thumri, dadra and Bollywood covers.',
  'Preethi Hegde occupies the sweet spot between classical rigour and popular appeal. Her thumri renditions carry genuine raga grammar, but she can pivot to a film song without losing that quality — making her equally loved at sabhas and receptions.',
  array['classical','wedding-specialist'], 'Karnataka', 'Bangalore', array['Kannada','Hindi','Telugu','English'],
  13000, 3000, 120, 4.8, 97, false, false,
  'standard','basic','basic', 91, 86, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=PreethiHegde'], array['Harmonium']
),

-- 44 · Manipuri Dance · Imphal
(
  '11111111-1111-1111-1111-111111111144', 'individual', 'Sorojini Devi',
  'Manipuri classical dancer and guru performing Ras Lila and Nata Sankirtana.',
  'Sorojini Devi''s Manipuri dance is a complete cosmology expressed through hand gestures, eye movements and costume. Her Ras Lila — the dance of Krishna and the gopis — is the result of 30 years of training and is recognised by the Sangeet Natak Akademi.',
  array['dancer','classical'], 'Manipur', 'Imphal', array['Meitei','Hindi'],
  12000, 2500, 300, 4.9, 61, false, false,
  'standard','basic','basic', 88, 87, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=SorojiniDevi'], array['Pung','Kartal']
),

-- 45 · Indie Rock Band · Mumbai
(
  '11111111-1111-1111-1111-111111111145', 'band', 'Monsoon Republic',
  'Mumbai indie rock band with original compositions and a massive festival following.',
  'Monsoon Republic write songs about Mumbai in the way Mumbai deserves — chaotically, lovingly, with the volume turned all the way up. Their debut album streamed 2 million times, and their live show is the reason people still love guitar music.',
  array['bollywood-band'], 'Maharashtra', 'Mumbai', array['Hindi','English'],
  40000, null, 200, 4.8, 67, true, false,
  'standard','spotlight','pro', 91, 93, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=MonsoonRepublic'], array['Electric Guitar','Bass','Drums','Keyboard']
),

-- 46 · Mridangam · Coimbatore
(
  '11111111-1111-1111-1111-111111111146', 'individual', 'Vaidyanathan Iyer',
  'Mridangam vidwan performing at Carnatic concerts and kutcheris across South India.',
  'Vaidyanathan Iyer''s mridangam is the conversation every Carnatic vocalist secretly wants — responsive, erudite, never dominant. His tani avartanam solos are mathematical prodigies that still swing.',
  array['classical'], 'Tamil Nadu', 'Coimbatore', array['Tamil','Telugu'],
  13000, 3000, 150, 4.8, 289, false, false,
  'standard','basic','pro', 94, 88, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=VaidyanathanIyer'], array['Mridangam']
),

-- 47 · Spoken Word Poet · Hyderabad
(
  '11111111-1111-1111-1111-111111111147', 'individual', 'Aisha Mirza',
  'Spoken word poet and open mic performer writing in Urdu, Hindi and English.',
  'Aisha Mirza''s spoken word is a controlled detonation. Her pieces — on identity, loss, and the particular absurdity of being young in modern India — have been viewed over 5 million times online and feel even more powerful in a room.',
  array['comedian','corporate-speaker'], 'Telangana', 'Hyderabad', array['Urdu','Hindi','English'],
  10000, 2500, 200, 4.8, 48, true, false,
  'standard','basic','basic', 86, 83, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=AishaMirza'], array[]::text[]
),

-- 48 · Carnatic Flutist · Chennai
(
  '11111111-1111-1111-1111-111111111148', 'individual', 'Flute Gopal',
  'Carnatic bamboo flute artist and disciple of the Palladam Sanjeeva Rao bani.',
  'Flute Gopal''s bamboo has one voice and infinite personalities. Whether he''s playing a Thodi raga at six in the morning or a Kapi after midnight, his phrasing is impeccable and his breath control is legendary among Carnatic connoisseurs.',
  array['classical'], 'Tamil Nadu', 'Chennai', array['Tamil','Telugu'],
  15000, 3500, 100, 4.9, 174, false, false,
  'standard','basic','pro', 93, 90, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=FluteGopal'], array['Carnatic Flute']
),

-- 49 · Harmonium · Prayagraj
(
  '11111111-1111-1111-1111-111111111149', 'individual', 'Pandit Ram Kripal',
  'Harmonium maestro and thumri accompanist from Prayagraj performing at classical events.',
  'Pandit Ram Kripal''s harmonium is an institution in the Allahabad music world. His solo recitals demonstrate that this imported instrument can speak pure Braj — and his accompaniment has been the silent support behind a generation of great vocalists.',
  array['classical'], 'Uttar Pradesh', 'Prayagraj', array['Hindi','Braj Bhasha','Urdu'],
  11000, 2500, 150, 4.8, 198, false, false,
  'standard','basic','basic', 90, 83, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=PanditRamKripal'], array['Harmonium']
),

-- 50 · Afro-Fusion Drummer · Mumbai
(
  '11111111-1111-1111-1111-111111111150', 'individual', 'Kwame Dey',
  'Ghanaian-Indian world music drummer fusing West African rhythms with Hindustani percussion.',
  'Kwame Dey was born in Accra, grew up in Mumbai, and studied tabla in Kolkata. His drumming is the product of all three places simultaneously — a polyrhythmic conversation that no one tradition alone could have started.',
  array['folk','bollywood-band'], 'Maharashtra', 'Mumbai', array['English','Hindi','Twi'],
  18000, 4000, 150, 4.8, 83, true, false,
  'standard','basic','pro', 89, 86, 'verified',
  array['https://api.dicebear.com/7.x/fun-emoji/svg?seed=KwameDey'], array['Djembe','Talking Drum','Tabla','Kpanlogo']
)

on conflict do nothing;
