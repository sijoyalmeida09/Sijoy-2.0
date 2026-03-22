-- ═══════════════════════════════════════════════════════════════
--  Sohaya — 50 Seed Musicians
--  Run in Supabase SQL Editor
--  Pastes after FRESH_SETUP.sql has been run
-- ═══════════════════════════════════════════════════════════════

-- ── STEP 1: Create 50 auth users ────────────────────────────
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, instance_id, aud, role)
VALUES
  ('b1000000-0000-0000-0000-000000000001','maria.fernandes@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Maria Fernandes"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000002','kevin.dsouza@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Kevin DSouza"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000003','suresh.tabla@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Suresh Sharma"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000004','zainab.khan@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Zainab Khan"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000005','rahul.verma@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Rahul Verma"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000006','anita.patel@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Anita Patel"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000007','john.baptist@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"John Baptist"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000008','pooja.nair@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Pooja Nair"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000009','akash.rodrigues@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Akash Rodrigues"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000010','fatima.shaikh@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Fatima Shaikh"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000011','ravi.mishra@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Ravi Mishra"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000012','celina.costa@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Celina Costa"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000013','arjun.menon@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Arjun Menon"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000014','deepa.iyer@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Deepa Iyer"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000015','marcus.almeida@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Marcus Almeida"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000016','neha.gupta@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Neha Gupta"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000017','steve.pinto@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Steve Pinto"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000018','kavya.reddy@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Kavya Reddy"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000019','danish.qureshi@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Danish Qureshi"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000020','priyanka.bose@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Priyanka Bose"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000021','jose.pereira@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Jose Pereira"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000022','sunita.joshi@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Sunita Joshi"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000023','tony.gonsalves@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Tony Gonsalves"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000024','meera.pillai@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Meera Pillai"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000025','imran.siddiqui@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Imran Siddiqui"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000026','diana.lobo@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Diana Lobo"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000027','kiran.thakur@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Kiran Thakur"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000028','rose.pinto@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Rose Pinto"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000029','vikram.singh@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Vikram Singh"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000030','lena.menezes@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Lena Menezes"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000031','aditya.kumar@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Aditya Kumar"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000032','sarah.dcosta@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Sarah DCosta"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000033','nikhil.pawar@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Nikhil Pawar"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000034','yasmin.ali@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Yasmin Ali"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000035','george.fernandez@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"George Fernandez"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000036','riya.chopra@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Riya Chopra"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000037','felix.correia@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Felix Correia"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000038','swati.kulkarni@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Swati Kulkarni"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000039','omar.khan@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Omar Khan"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000040','jessica.vas@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Jessica Vas"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000041','sameer.khan@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Sameer Khan"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000042','nisha.thomas@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Nisha Thomas"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000043','peter.mascarenhas@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Peter Mascarenhas"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000044','shreya.mehta@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Shreya Mehta"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000045','carlos.miranda@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Carlos Miranda"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000046','tanvi.desai@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Tanvi Desai"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000047','andrew.philip@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Andrew Philip"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000048','aisha.malik@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Aisha Malik"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000049','rohan.naik@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Rohan Naik"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000050','linda.pais@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Linda Pais"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated')
ON CONFLICT (id) DO NOTHING;

-- ── STEP 2: Create profiles ──────────────────────────────────
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, (raw_user_meta_data->>'full_name'), 'musician'
FROM auth.users
WHERE id::text LIKE 'b1000000%'
ON CONFLICT (id) DO UPDATE SET role = 'musician';

-- ── STEP 3: Insert 50 artist_profiles ───────────────────────
INSERT INTO public.artist_profiles
  (id, user_id, stage_name, bio, event_rate, city, available, verification_status, featured, search_rank, total_bookings, avg_rating)
VALUES
  ('d1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','Maria Fernandes','Versatile Bollywood & Gospel vocalist. 8 years of performing at weddings, communions, and corporate events across Vasai.',4500,'Vasai',true,'verified',true,98,134,4.9),
  ('d1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000002','Kevin DSouza','Folk and Vasaikar music specialist. Dholki, vocals, and traditional East Indian folk performance.',2800,'Vasai',true,'verified',true,92,89,4.8),
  ('d1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000003','Suresh Tabla','Classical tabla player trained under Ustad Rashid Khan. Available for classical, Bollywood, and fusion.',3500,'Virar',true,'verified',true,88,201,5.0),
  ('d1000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000004','Zainab Sufi','Sufi and ghazal vocalist. Soul-stirring qawwali performances for private and corporate events.',5500,'Nalasopara',true,'verified',true,95,67,4.9),
  ('d1000000-0000-0000-0000-000000000005','b1000000-0000-0000-0000-000000000005','DJ Rahul V','High-energy DJ set for weddings and parties. Bollywood, EDM, and mashup specialist.',6000,'Vasai',true,'verified',true,90,312,4.8),
  ('d1000000-0000-0000-0000-000000000006','b1000000-0000-0000-0000-000000000006','Anita Classical','Hindustani classical vocalist. Specializes in ragas and bhajans. Perfect for morning events and devotional programs.',3000,'Virar',true,'verified',false,80,45,4.7),
  ('d1000000-0000-0000-0000-000000000007','b1000000-0000-0000-0000-000000000007','John Baptist Guitar','Acoustic and lead guitarist with 12 years experience. Western, Bollywood, and Gospel.',3200,'Vasai',true,'verified',false,78,98,4.6),
  ('d1000000-0000-0000-0000-000000000008','b1000000-0000-0000-0000-000000000008','Pooja Violin','Classically trained violinist. Concert, wedding, and background music for films.',4000,'Mumbai',true,'verified',true,85,156,4.9),
  ('d1000000-0000-0000-0000-000000000009','b1000000-0000-0000-0000-000000000009','Akash Brass Band','Brass band leader — trumpet, saxophone, trombone ensemble. Weddings and processions.',8500,'Vasai',true,'verified',false,72,77,4.5),
  ('d1000000-0000-0000-0000-000000000010','b1000000-0000-0000-0000-000000000010','Fatima Harmonium','Harmonium and Sufi vocals. Devotional and qawwali events. 10+ years experience.',2500,'Nalasopara',true,'verified',false,70,120,4.7),
  ('d1000000-0000-0000-0000-000000000011','b1000000-0000-0000-0000-000000000011','Ravi Flute','Professional bansuri flute player. Classical, fusion, and background instrumental music.',2200,'Virar',true,'verified',false,68,88,4.6),
  ('d1000000-0000-0000-0000-000000000012','b1000000-0000-0000-0000-000000000012','Celina Gospel Choir','Leads a 5-voice gospel choir. Church events, communions, and Christmas concerts.',9000,'Vasai',true,'verified',true,94,43,4.9),
  ('d1000000-0000-0000-0000-000000000013','b1000000-0000-0000-0000-000000000013','Arjun Saxophone','Jazz and Bollywood saxophone. Perfect for corporate dinners and cocktail parties.',4500,'Mumbai',true,'verified',false,76,65,4.7),
  ('d1000000-0000-0000-0000-000000000014','b1000000-0000-0000-0000-000000000014','Deepa Bharatanatyam','Classical Bharatanatyam dancer with live musician ensemble. Cultural programs and festivals.',7000,'Virar',true,'verified',false,74,34,4.8),
  ('d1000000-0000-0000-0000-000000000015','b1000000-0000-0000-0000-000000000015','Marcus Keys','Keyboard and piano player. Jazz, Bollywood, and contemporary. Studio and live events.',3800,'Vasai',true,'verified',false,79,112,4.6),
  ('d1000000-0000-0000-0000-000000000016','b1000000-0000-0000-0000-000000000016','Neha Bollywood','Female Bollywood vocalist. Covers all chart-toppers from 90s to present. Dance-floor energy.',4200,'Nalasopara',true,'verified',true,87,178,4.8),
  ('d1000000-0000-0000-0000-000000000017','b1000000-0000-0000-0000-000000000017','Steve Bass','Bass guitarist and band leader. Rock, funk, and Bollywood fusion bands.',3500,'Vasai',true,'verified',false,71,93,4.5),
  ('d1000000-0000-0000-0000-000000000018','b1000000-0000-0000-0000-000000000018','Kavya Carnatic','Carnatic vocalist and violin. South Indian classical and fusion. Very popular for Tamil and Telugu events.',3800,'Mumbai',true,'verified',false,73,57,4.7),
  ('d1000000-0000-0000-0000-000000000019','b1000000-0000-0000-0000-000000000019','Danish Ghazal','Ghazal and nazm vocalist. Intimate evening performances and private gatherings.',4800,'Vasai',true,'verified',false,80,41,4.8),
  ('d1000000-0000-0000-0000-000000000020','b1000000-0000-0000-0000-000000000020','Priyanka Singer','Pop and contemporary Bollywood vocalist. Young energy, latest hits, crowd favorite.',3200,'Virar',true,'verified',false,69,143,4.6),
  ('d1000000-0000-0000-0000-000000000021','b1000000-0000-0000-0000-000000000021','Jose Latin Band','Latin music — salsa, merengue, and Goan folk fusion. Unique and memorable.',6500,'Vasai',true,'verified',false,75,28,4.7),
  ('d1000000-0000-0000-0000-000000000022','b1000000-0000-0000-0000-000000000022','Sunita Bhajan','Devotional bhajan and kirtan vocalist. Temple events, pujas, and spiritual gatherings.',1800,'Nalasopara',true,'verified',false,65,189,4.9),
  ('d1000000-0000-0000-0000-000000000023','b1000000-0000-0000-0000-000000000023','Tony Percussion','Percussionist — cajon, djembe, dhol, and congas. World music and fusion.',2800,'Vasai',true,'verified',false,67,76,4.6),
  ('d1000000-0000-0000-0000-000000000024','b1000000-0000-0000-0000-000000000024','Meera Odissi','Odissi dancer with live tabla and flute accompaniment. Cultural programs and festivals.',6000,'Mumbai',true,'verified',false,72,22,4.8),
  ('d1000000-0000-0000-0000-000000000025','b1000000-0000-0000-0000-000000000025','Imran Qawwali','Qawwali vocalist and ensemble. Urs, dargah programs, and private mehfils.',5500,'Nalasopara',true,'verified',true,89,95,4.9),
  ('d1000000-0000-0000-0000-000000000026','b1000000-0000-0000-0000-000000000026','Diana Pop','Contemporary pop and R&B vocalist. English, Hindi, and Portuguese repertoire.',3500,'Vasai',true,'verified',false,70,61,4.6),
  ('d1000000-0000-0000-0000-000000000027','b1000000-0000-0000-0000-000000000027','Kiran Marathi','Marathi folk and Lavani performer. Ganesh utsav, cultural programs, and stage shows.',2500,'Virar',true,'verified',false,66,107,4.7),
  ('d1000000-0000-0000-0000-000000000028','b1000000-0000-0000-0000-000000000028','Rose Harp','Concert harpist. Elegant weddings, corporate events, and film scoring.',7500,'Mumbai',true,'verified',false,77,18,4.9),
  ('d1000000-0000-0000-0000-000000000029','b1000000-0000-0000-0000-000000000029','Vikram Rock Band','Rock and fusion band leader. Corporate concerts and college festivals.',9500,'Vasai',true,'verified',false,73,52,4.5),
  ('d1000000-0000-0000-0000-000000000030','b1000000-0000-0000-0000-000000000030','Lena Menezes','Goan folk singer. Mando, dulpod, and dekhni. Weddings and cultural events.',2200,'Vasai',true,'verified',false,64,83,4.7),
  ('d1000000-0000-0000-0000-000000000031','b1000000-0000-0000-0000-000000000031','Aditya EDM','EDM and Bollywood DJ. Premium sound setup included. Club and party events.',7000,'Mumbai',true,'verified',false,76,229,4.6),
  ('d1000000-0000-0000-0000-000000000032','b1000000-0000-0000-0000-000000000032','Sarah Trumpet','Brass instrumentalist — trumpet and flugelhorn. Jazz quartets and classical ensembles.',3200,'Vasai',true,'verified',false,68,44,4.7),
  ('d1000000-0000-0000-0000-000000000033','b1000000-0000-0000-0000-000000000033','Nikhil Dholki','Traditional dholki and dhol player. Weddings, haldi, and processions.',2000,'Nalasopara',true,'verified',false,63,167,4.5),
  ('d1000000-0000-0000-0000-000000000034','b1000000-0000-0000-0000-000000000034','Yasmin Jazz','Jazz vocalist and piano. Intimate jazz evenings and corporate cocktail hours.',5000,'Mumbai',true,'verified',false,78,39,4.8),
  ('d1000000-0000-0000-0000-000000000035','b1000000-0000-0000-0000-000000000035','George Accordion','Accordion and keyboard. East Indian folk, Portuguese ballads, and Goan music.',2500,'Vasai',true,'verified',false,62,71,4.6),
  ('d1000000-0000-0000-0000-000000000036','b1000000-0000-0000-0000-000000000036','Riya Playback','Film-style playback singer. Covers all classic and modern Bollywood. Very popular at sangeets.',4000,'Virar',true,'verified',false,74,154,4.8),
  ('d1000000-0000-0000-0000-000000000037','b1000000-0000-0000-0000-000000000037','Felix Drummer','Professional rock and jazz drummer. Studio recordings and live band performances.',3000,'Vasai',true,'verified',false,67,88,4.5),
  ('d1000000-0000-0000-0000-000000000038','b1000000-0000-0000-0000-000000000038','Swati Flute','Classical and fusion flute. Instrumental background music and meditation events.',2000,'Nalasopara',true,'verified',false,61,93,4.7),
  ('d1000000-0000-0000-0000-000000000039','b1000000-0000-0000-0000-000000000039','Omar Sitar','Sitar and Indian classical strings. Unique and mesmerizing for cultural programs.',3800,'Mumbai',true,'verified',false,70,31,4.8),
  ('d1000000-0000-0000-0000-000000000040','b1000000-0000-0000-0000-000000000040','Jessica Pop Duo','Pop vocalist and acoustic guitar duo. Corporate events and rooftop parties.',4500,'Vasai',true,'verified',false,72,66,4.6),
  ('d1000000-0000-0000-0000-000000000041','b1000000-0000-0000-0000-000000000041','Sameer Sufi Band','4-piece Sufi ensemble. Kafi, doha, and qawwali. Private and stage performances.',8000,'Nalasopara',true,'verified',true,91,48,4.9),
  ('d1000000-0000-0000-0000-000000000042','b1000000-0000-0000-0000-000000000042','Nisha Gospel','Gospel and praise vocalist. Church services, communions, and Christmas caroling.',3000,'Vasai',true,'verified',false,69,112,4.8),
  ('d1000000-0000-0000-0000-000000000043','b1000000-0000-0000-0000-000000000043','Peter Mandolin','Mandolin and Spanish guitar. East Indian folk and classical guitar instrumental.',2200,'Vasai',true,'verified',false,60,55,4.6),
  ('d1000000-0000-0000-0000-000000000044','b1000000-0000-0000-0000-000000000044','Shreya Mehta Vocals','Versatile vocalist — Bollywood, classical, ghazal. 15+ years experience.',5000,'Mumbai',true,'verified',true,86,203,4.9),
  ('d1000000-0000-0000-0000-000000000045','b1000000-0000-0000-0000-000000000045','Carlos Salsa DJ','Latin DJ and dance music specialist. Salsa, reggaeton, and international hits.',5500,'Vasai',true,'verified',false,71,37,4.6),
  ('d1000000-0000-0000-0000-000000000046','b1000000-0000-0000-0000-000000000046','Tanvi Tabla','Female tabla virtuoso. Classical performances and fusion projects.',3200,'Virar',true,'verified',false,68,61,4.8),
  ('d1000000-0000-0000-0000-000000000047','b1000000-0000-0000-0000-000000000047','Andrew Cello','Concert cellist. Western classical and film music. Weddings and formal events.',4800,'Mumbai',true,'verified',false,73,24,4.7),
  ('d1000000-0000-0000-0000-000000000048','b1000000-0000-0000-0000-000000000048','Aisha Bollywood Band','6-piece Bollywood live band. Full band with vocals, guitars, drums, and keys.',12000,'Vasai',true,'verified',true,93,87,4.8),
  ('d1000000-0000-0000-0000-000000000049','b1000000-0000-0000-0000-000000000049','Rohan Singer','Male Bollywood vocalist. Romantic songs and retro hits. Very popular for receptions.',3800,'Nalasopara',true,'verified',false,74,149,4.7),
  ('d1000000-0000-0000-0000-000000000050','b1000000-0000-0000-0000-000000000050','Linda East Indian','East Indian folk singer and guitarist. Traditional Vasai music for weddings and festivals.',2800,'Vasai',true,'verified',false,66,78,4.7)
ON CONFLICT (id) DO NOTHING;

-- ── STEP 4: Link Genres ──────────────────────────────────────
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000001', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000001', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000002', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000003', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000003', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000004', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000004', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000005', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000005', id FROM public.genres WHERE slug='edm' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000006', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000007', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000007', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000008', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000008', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000009', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000009', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000010', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000011', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000011', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000012', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000013', id FROM public.genres WHERE slug='jazz' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000013', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000014', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000015', id FROM public.genres WHERE slug='jazz' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000015', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000016', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000017', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000017', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000018', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000019', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000019', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000020', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000021', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000021', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000022', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000022', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000023', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000023', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000024', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000025', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000026', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000026', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000027', id FROM public.genres WHERE slug='marathi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000027', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000028', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000028', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000029', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000030', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000030', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000031', id FROM public.genres WHERE slug='edm' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000031', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000032', id FROM public.genres WHERE slug='jazz' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000032', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000033', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000033', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000034', id FROM public.genres WHERE slug='jazz' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000034', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000035', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000035', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000036', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000037', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000037', id FROM public.genres WHERE slug='jazz' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000038', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000038', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000039', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000039', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000040', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000040', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000041', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000042', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000042', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000043', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000043', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000044', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000044', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000045', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000046', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000047', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000047', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000048', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000049', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000050', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000050', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;

-- ── STEP 5: Link Instruments ─────────────────────────────────
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000001', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000002', id FROM public.instruments WHERE slug='dholki' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000002', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000003', id FROM public.instruments WHERE slug='tabla' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000004', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000005', id FROM public.instruments WHERE slug='dj' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000005', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000006', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000007', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000008', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000009', id FROM public.instruments WHERE slug='trumpet' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000009', id FROM public.instruments WHERE slug='saxophone' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000010', id FROM public.instruments WHERE slug='harmonium' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000010', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000011', id FROM public.instruments WHERE slug='flute' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000012', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000013', id FROM public.instruments WHERE slug='saxophone' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000014', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000015', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000016', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000017', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000018', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000018', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000019', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000020', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000021', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000021', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000022', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000023', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000024', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000025', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000025', id FROM public.instruments WHERE slug='harmonium' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000026', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000027', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000028', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000029', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000029', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000030', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000030', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000031', id FROM public.instruments WHERE slug='dj' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000032', id FROM public.instruments WHERE slug='trumpet' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000033', id FROM public.instruments WHERE slug='dholki' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000034', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000034', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000035', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000036', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000037', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000038', id FROM public.instruments WHERE slug='flute' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000039', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000040', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000040', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000041', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000041', id FROM public.instruments WHERE slug='tabla' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000041', id FROM public.instruments WHERE slug='harmonium' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000042', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000043', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000044', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000045', id FROM public.instruments WHERE slug='dj' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000046', id FROM public.instruments WHERE slug='tabla' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000047', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000048', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000048', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000048', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000048', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000049', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000050', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000050', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;

-- ── Done ─────────────────────────────────────────────────────
-- 50 artists added. All verified, all available.
-- Login: any @sohaya.in email / Artist2026!
