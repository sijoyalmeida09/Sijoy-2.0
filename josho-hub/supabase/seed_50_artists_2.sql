-- ═══════════════════════════════════════════════════════════════
--  Sohaya — 50 More Seed Musicians (Artists 51–100)
--  Run AFTER seed_50_artists.sql
-- ═══════════════════════════════════════════════════════════════

-- ── STEP 1: Create auth users 51–100 ────────────────────────
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, instance_id, aud, role)
VALUES
  ('b1000000-0000-0000-0000-000000000051','alphonso.pereira@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Alphonso Pereira"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000052','rashida.begum@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Rashida Begum"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000053','ganesh.iyer@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Ganesh Iyer"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000054','bridget.vas@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Bridget Vas"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000055','mohsin.ali@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Mohsin Ali"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000056','sunanda.rao@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Sunanda Rao"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000057','raymond.dcunha@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Raymond DCunha"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000058','pallavi.joshi@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Pallavi Joshi"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000059','tariq.hussain@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Tariq Hussain"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000060','veronica.monteiro@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Veronica Monteiro"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000061','ramesh.patil@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Ramesh Patil"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000062','nadia.khan@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Nadia Khan"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000063','benedict.gomes@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Benedict Gomes"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000064','meenakshi.pillai@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Meenakshi Pillai"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000065','farhan.siddiqui@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Farhan Siddiqui"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000066','carolyn.dmello@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Carolyn DMello"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000067','shyam.bhat@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Shyam Bhat"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000068','lubna.mirza@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Lubna Mirza"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000069','maxwell.fernandes@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Maxwell Fernandes"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000070','savita.naik@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Savita Naik"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000071','augustine.lobo@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Augustine Lobo"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000072','preethi.thomas@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Preethi Thomas"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000073','wasim.shaikh@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Wasim Shaikh"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000074','gloria.rodrigues@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Gloria Rodrigues"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000075','harish.nair@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Harish Nair"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000076','sabrina.costa@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Sabrina Costa"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000077','devraj.menon@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Devraj Menon"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000078','shakira.patel@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Shakira Patel"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000079','lionel.gonsalves@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Lionel Gonsalves"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000080','amruta.desai@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Amruta Desai"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000081','cyril.mascarenhas@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Cyril Mascarenhas"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000082','iqra.ansari@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Iqra Ansari"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000083','vijay.kulkarni@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Vijay Kulkarni"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000084','felicia.alvares@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Felicia Alvares"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000085','santosh.sharma@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Santosh Sharma"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000086','leena.dcosta@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Leena DCosta"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000087','ibrahim.khan@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Ibrahim Khan"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000088','rhea.miranda@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Rhea Miranda"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000089','krishna.pillai@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Krishna Pillai"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000090','miranda.pinto@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Miranda Pinto"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000091','suraj.yadav@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Suraj Yadav"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000092','teresa.gomes@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Teresa Gomes"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000093','ahmed.shaikh@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Ahmed Shaikh"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000094','natasha.pereira@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Natasha Pereira"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000095','dilip.sawant@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Dilip Sawant"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000096','irene.vaz@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Irene Vaz"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000097','mukesh.tiwari@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Mukesh Tiwari"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000098','agnes.fernandes@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Agnes Fernandes"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000099','rohit.sharma@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Rohit Sharma"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated'),
  ('b1000000-0000-0000-0000-000000000100','cynthia.lobo@sohaya.in',crypt('Artist2026!',gen_salt('bf')),now(),now(),now(),'{"full_name":"Cynthia Lobo"}'::jsonb,'00000000-0000-0000-0000-000000000000','authenticated','authenticated')
ON CONFLICT (id) DO NOTHING;

-- ── STEP 2: Create profiles ──────────────────────────────────
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, (raw_user_meta_data->>'full_name'), 'musician'
FROM auth.users
WHERE id::text LIKE 'b1000000-0000-0000-0000-0000000000%'
  AND id::text > 'b1000000-0000-0000-0000-000000000050'
ON CONFLICT (id) DO UPDATE SET role = 'musician';

-- ── STEP 3: Insert artist_profiles 51–100 ───────────────────
INSERT INTO public.artist_profiles
  (id, user_id, stage_name, bio, event_rate, city, available, verification_status, featured, search_rank, total_bookings, avg_rating)
VALUES
  ('d1000000-0000-0000-0000-000000000051','b1000000-0000-0000-0000-000000000051','Alphonso Guitar','East Indian folk and classical guitarist. Mando, dulpod, and acoustic fingerstyle.',2800,'Vasai',true,'verified',false,65,91,4.7),
  ('d1000000-0000-0000-0000-000000000052','b1000000-0000-0000-0000-000000000052','Rashida Ghazal','Ghazal and thumri vocalist. Trained at Gandharva Mahavidyalaya. Intimate performances.',4200,'Nalasopara',true,'verified',false,70,53,4.8),
  ('d1000000-0000-0000-0000-000000000053','b1000000-0000-0000-0000-000000000053','Ganesh Mridangam','Mridangam and tabla percussionist. Carnatic and Hindustani fusion. Concert-ready.',3500,'Mumbai',true,'verified',false,68,44,4.7),
  ('d1000000-0000-0000-0000-000000000054','b1000000-0000-0000-0000-000000000054','Bridget Church Choir','Leads a 7-voice Catholic choir. First communions, baptisms, Christmas masses.',9500,'Vasai',true,'verified',true,93,61,4.9),
  ('d1000000-0000-0000-0000-000000000055','b1000000-0000-0000-0000-000000000055','Mohsin Sarangi','Rare sarangi player. Classical and folk instrumental. Unique addition to any ensemble.',3800,'Virar',true,'verified',false,64,29,4.8),
  ('d1000000-0000-0000-0000-000000000056','b1000000-0000-0000-0000-000000000056','Sunanda Devotional','Devotional and bhajan vocalist. Morning programs, pujas, and spiritual retreats.',2000,'Nalasopara',true,'verified',false,62,134,4.8),
  ('d1000000-0000-0000-0000-000000000057','b1000000-0000-0000-0000-000000000057','Raymond Jazz Trio','Jazz pianist and band leader. Trio setup — piano, bass, drums. Corporate and restaurant.',8500,'Mumbai',true,'verified',false,75,47,4.7),
  ('d1000000-0000-0000-0000-000000000058','b1000000-0000-0000-0000-000000000058','Pallavi Kathak','Kathak dancer with live tabla and harmonium. Cultural programs and school events.',5500,'Virar',true,'verified',false,69,31,4.8),
  ('d1000000-0000-0000-0000-000000000059','b1000000-0000-0000-0000-000000000059','Tariq Tabla Maestro','Advanced tabla player. Solo recitals and accompaniment for classical vocalists.',4000,'Vasai',true,'verified',false,71,72,4.9),
  ('d1000000-0000-0000-0000-000000000060','b1000000-0000-0000-0000-000000000060','Veronica Soprano','Trained soprano vocalist. Western classical, opera arias, and sacred music.',5500,'Mumbai',true,'verified',true,86,38,4.9),
  ('d1000000-0000-0000-0000-000000000061','b1000000-0000-0000-0000-000000000061','Ramesh Dhol Tasha','Traditional dhol-tasha pathak. Ganesh utsav, processions, and cultural celebrations.',3000,'Vasai',true,'verified',false,63,198,4.6),
  ('d1000000-0000-0000-0000-000000000062','b1000000-0000-0000-0000-000000000062','Nadia Pop Queen','Contemporary pop vocalist. English and Hindi. Social media presence, very popular.',4500,'Mumbai',true,'verified',false,74,167,4.7),
  ('d1000000-0000-0000-0000-000000000063','b1000000-0000-0000-0000-000000000063','Benedict Organ','Church organist and pianist. Classical hymns and contemporary worship music.',3200,'Vasai',true,'verified',false,66,83,4.8),
  ('d1000000-0000-0000-0000-000000000064','b1000000-0000-0000-0000-000000000064','Meenakshi Veena','Veena and carnatic vocalist. Traditional South Indian classical for cultural programs.',4000,'Mumbai',true,'verified',false,67,26,4.8),
  ('d1000000-0000-0000-0000-000000000065','b1000000-0000-0000-0000-000000000065','Farhan Rap Artist','Hindi and Urdu rap and spoken word. Corporate events and college fests.',3500,'Nalasopara',true,'verified',false,65,59,4.5),
  ('d1000000-0000-0000-0000-000000000066','b1000000-0000-0000-0000-000000000066','Carolyn Folk Singer','Goan and East Indian folk vocalist. Mandolin and voice. Intimate events.',2500,'Vasai',true,'verified',false,61,77,4.7),
  ('d1000000-0000-0000-0000-000000000067','b1000000-0000-0000-0000-000000000067','Shyam Blues Guitar','Blues and jazz guitarist. Corporate lounge and intimate concerts.',3800,'Mumbai',true,'verified',false,68,54,4.6),
  ('d1000000-0000-0000-0000-000000000068','b1000000-0000-0000-0000-000000000068','Lubna Sufi Ensemble','5-piece Sufi ensemble. Kafi, doha, and qawwali. Spiritual and private events.',10000,'Vasai',true,'verified',true,91,42,4.9),
  ('d1000000-0000-0000-0000-000000000069','b1000000-0000-0000-0000-000000000069','Maxwell Drum Corps','Marching drum corps — 8-piece percussion ensemble. Processions and stage shows.',11000,'Virar',true,'verified',false,73,33,4.7),
  ('d1000000-0000-0000-0000-000000000070','b1000000-0000-0000-0000-000000000070','Savita Lavani','Marathi Lavani performer. Stage shows, Ganesh utsav, and cultural programs.',3500,'Nalasopara',true,'verified',false,66,89,4.8),
  ('d1000000-0000-0000-0000-000000000071','b1000000-0000-0000-0000-000000000071','Augustine Brass','Trumpet and flugelhorn soloist. Jazz standards and Bollywood brass covers.',3200,'Vasai',true,'verified',false,64,61,4.6),
  ('d1000000-0000-0000-0000-000000000072','b1000000-0000-0000-0000-000000000072','Preethi Kerala Folk','Kerala folk and Mohiniyattam dancer with live chenda and mridangam.',6000,'Mumbai',true,'verified',false,70,28,4.8),
  ('d1000000-0000-0000-0000-000000000073','b1000000-0000-0000-0000-000000000073','Wasim Santoor','Santoor player. Instrumental Bollywood and classical fusion. Meditative and elegant.',3500,'Nalasopara',true,'verified',false,63,37,4.7),
  ('d1000000-0000-0000-0000-000000000074','b1000000-0000-0000-0000-000000000074','Gloria Wedding Band','Full 8-piece wedding band. Bollywood, Western, Gospel — everything for the big day.',14000,'Vasai',true,'verified',true,95,74,4.9),
  ('d1000000-0000-0000-0000-000000000075','b1000000-0000-0000-0000-000000000075','Harish Carnatic Violin','Carnatic violin specialist. South Indian classical and devotional.',3500,'Mumbai',true,'verified',false,65,48,4.7),
  ('d1000000-0000-0000-0000-000000000076','b1000000-0000-0000-0000-000000000076','Sabrina Indie Pop','Indie pop and singer-songwriter. Original compositions and covers. Rooftop events.',3800,'Mumbai',true,'verified',false,67,62,4.6),
  ('d1000000-0000-0000-0000-000000000077','b1000000-0000-0000-0000-000000000077','Devraj Sitar Fusion','Sitar and world music fusion. East meets West — unique concert experience.',4500,'Mumbai',true,'verified',false,69,31,4.8),
  ('d1000000-0000-0000-0000-000000000078','b1000000-0000-0000-0000-000000000078','Shakira Belly Dance','Belly dance and Middle Eastern music performer. Birthday parties and themed events.',5000,'Virar',true,'verified',false,68,44,4.7),
  ('d1000000-0000-0000-0000-000000000079','b1000000-0000-0000-0000-000000000079','Lionel Acoustic Duo','Acoustic guitar and vocals duo. Romantic covers and originals. Dinners and rooftops.',4500,'Vasai',true,'verified',false,70,81,4.8),
  ('d1000000-0000-0000-0000-000000000080','b1000000-0000-0000-0000-000000000080','Amruta Flute Classical','Classical bansuri. Raga performances and fusion. Background music for events.',2500,'Nalasopara',true,'verified',false,62,93,4.7),
  ('d1000000-0000-0000-0000-000000000081','b1000000-0000-0000-0000-000000000081','Cyril Rock Band','5-piece rock and fusion band. Corporate concerts, college fests, and private parties.',11000,'Vasai',true,'verified',false,74,57,4.5),
  ('d1000000-0000-0000-0000-000000000082','b1000000-0000-0000-0000-000000000082','Iqra Nasheed','Islamic nasheed vocalist. Milad, aqeeqa, and Muslim wedding celebrations.',2500,'Nalasopara',true,'verified',false,61,66,4.8),
  ('d1000000-0000-0000-0000-000000000083','b1000000-0000-0000-0000-000000000083','Vijay Mandolin','Western and Carnatic mandolin. Unique and versatile for any event style.',2800,'Virar',true,'verified',false,63,42,4.6),
  ('d1000000-0000-0000-0000-000000000084','b1000000-0000-0000-0000-000000000084','Felicia Harp Piano','Concert harpist and pianist duo. Luxury weddings and formal events.',9000,'Mumbai',true,'verified',true,88,21,4.9),
  ('d1000000-0000-0000-0000-000000000085','b1000000-0000-0000-0000-000000000085','Santosh Harmonium','Classical harmonium and Bollywood accompanist. Extremely versatile and experienced.',2000,'Vasai',true,'verified',false,60,114,4.7),
  ('d1000000-0000-0000-0000-000000000086','b1000000-0000-0000-0000-000000000086','Leena Choir Director','Trained choir director. Builds custom vocal ensembles for events. Gospel and classical.',7000,'Vasai',true,'verified',false,72,39,4.9),
  ('d1000000-0000-0000-0000-000000000087','b1000000-0000-0000-0000-000000000087','Ibrahim Tabla Percussion','Tabla and dholki specialist. Bollywood and folk accompaniment.',2200,'Nalasopara',true,'verified',false,61,127,4.6),
  ('d1000000-0000-0000-0000-000000000088','b1000000-0000-0000-0000-000000000088','Rhea R&B','R&B and soul vocalist. English and Hindi fusion. Corporate and private events.',4200,'Mumbai',true,'verified',false,68,71,4.7),
  ('d1000000-0000-0000-0000-000000000089','b1000000-0000-0000-0000-000000000089','Krishna Pakhawaj','Pakhawaj and classical percussion. Rare instrument for traditional performances.',3500,'Mumbai',true,'verified',false,64,23,4.8),
  ('d1000000-0000-0000-0000-000000000090','b1000000-0000-0000-0000-000000000090','Miranda Classical Duo','Piano and violin classical duo. Elegant and refined for formal events.',7500,'Vasai',true,'verified',false,73,35,4.9),
  ('d1000000-0000-0000-0000-000000000091','b1000000-0000-0000-0000-000000000091','Suraj DJ Urban','Urban and hip-hop DJ. College fests, birthday parties, and youth events.',5500,'Virar',true,'verified',false,67,143,4.5),
  ('d1000000-0000-0000-0000-000000000092','b1000000-0000-0000-0000-000000000092','Teresa Gospel Singer','Gospel and praise vocalist. Sunday services, revivals, and Christian weddings.',3200,'Vasai',true,'verified',false,65,97,4.8),
  ('d1000000-0000-0000-0000-000000000093','b1000000-0000-0000-0000-000000000093','Ahmed Naat Khwan','Naat and Hamd vocalist. Islamic celebrations, milad events, and Ramadan programs.',2800,'Nalasopara',true,'verified',false,62,81,4.9),
  ('d1000000-0000-0000-0000-000000000094','b1000000-0000-0000-0000-000000000094','Natasha Cabaret Band','Retro cabaret and jazz band. 5-piece with brass and piano. Themed events.',9500,'Mumbai',true,'verified',true,89,29,4.8),
  ('d1000000-0000-0000-0000-000000000095','b1000000-0000-0000-0000-000000000095','Dilip Shehnai','Traditional shehnai player. Weddings, religious ceremonies, and auspicious occasions.',2500,'Vasai',true,'verified',false,60,108,4.7),
  ('d1000000-0000-0000-0000-000000000096','b1000000-0000-0000-0000-000000000096','Irene Worship Band','Contemporary Christian worship band — 6 musicians. Church events and conferences.',10000,'Vasai',true,'verified',true,90,53,4.9),
  ('d1000000-0000-0000-0000-000000000097','b1000000-0000-0000-0000-000000000097','Mukesh Classical Vocal','Hindustani classical vocalist. Khayal and thumri. Concert and private mehfil.',5000,'Mumbai',true,'verified',false,71,44,4.8),
  ('d1000000-0000-0000-0000-000000000098','b1000000-0000-0000-0000-000000000098','Agnes Vasai Folk','East Indian folk singer. Traditional wedding songs, songs of the harvest and sea.',2200,'Vasai',true,'verified',false,60,96,4.8),
  ('d1000000-0000-0000-0000-000000000099','b1000000-0000-0000-0000-000000000099','Rohit Bollywood Live','Male Bollywood vocalist. Live karaoke-style performances. Great crowd entertainer.',3500,'Virar',true,'verified',false,66,182,4.6),
  ('d1000000-0000-0000-0000-000000000100','b1000000-0000-0000-0000-000000000100','Cynthia String Quartet','String quartet — 2 violins, viola, cello. Western classical and film music.',13000,'Mumbai',true,'verified',true,92,19,4.9)
ON CONFLICT (id) DO NOTHING;

-- ── STEP 4: Link Genres ──────────────────────────────────────
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000051', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000051', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000052', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000052', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000053', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000054', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000055', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000055', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000056', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000056', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000057', id FROM public.genres WHERE slug='jazz' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000058', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000059', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000060', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000060', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000061', id FROM public.genres WHERE slug='marathi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000061', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000062', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000062', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000063', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000063', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000064', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000065', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000066', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000066', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000067', id FROM public.genres WHERE slug='jazz' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000067', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000068', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000069', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000069', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000070', id FROM public.genres WHERE slug='marathi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000071', id FROM public.genres WHERE slug='jazz' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000071', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000072', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000073', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000073', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000074', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000074', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000075', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000076', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000077', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000077', id FROM public.genres WHERE slug='fusion' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000078', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000079', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000079', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000080', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000081', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000082', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000083', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000083', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000084', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000084', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000085', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000085', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000086', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000087', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000087', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000088', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000088', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000089', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000090', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000090', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000091', id FROM public.genres WHERE slug='edm' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000091', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000092', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000092', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000093', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000094', id FROM public.genres WHERE slug='jazz' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000094', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000095', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000095', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000096', id FROM public.genres WHERE slug='gospel' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000097', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000097', id FROM public.genres WHERE slug='sufi' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000098', id FROM public.genres WHERE slug='vasaikar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000098', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000099', id FROM public.genres WHERE slug='bollywood' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000100', id FROM public.genres WHERE slug='classical' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_genres (artist_id, genre_id) SELECT 'd1000000-0000-0000-0000-000000000100', id FROM public.genres WHERE slug='western' ON CONFLICT DO NOTHING;

-- ── STEP 5: Link Instruments ─────────────────────────────────
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000051', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000052', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000053', id FROM public.instruments WHERE slug='tabla' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000054', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000055', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000056', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000057', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000057', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000058', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000059', id FROM public.instruments WHERE slug='tabla' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000060', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000061', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000061', id FROM public.instruments WHERE slug='dholki' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000062', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000063', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000064', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000064', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000065', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000066', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000066', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000067', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000068', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000068', id FROM public.instruments WHERE slug='harmonium' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000069', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000070', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000071', id FROM public.instruments WHERE slug='trumpet' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000072', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000073', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000074', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000074', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000074', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000074', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000075', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000076', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000076', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000077', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000078', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000079', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000079', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000080', id FROM public.instruments WHERE slug='flute' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000081', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000081', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000082', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000083', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000084', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000084', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000085', id FROM public.instruments WHERE slug='harmonium' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000086', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000087', id FROM public.instruments WHERE slug='tabla' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000087', id FROM public.instruments WHERE slug='dholki' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000088', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000089', id FROM public.instruments WHERE slug='tabla' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000090', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000090', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000091', id FROM public.instruments WHERE slug='dj' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000092', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000093', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000094', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000094', id FROM public.instruments WHERE slug='saxophone' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000094', id FROM public.instruments WHERE slug='trumpet' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000094', id FROM public.instruments WHERE slug='keyboard' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000095', id FROM public.instruments WHERE slug='flute' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000096', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000096', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000096', id FROM public.instruments WHERE slug='drums' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000097', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000098', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000098', id FROM public.instruments WHERE slug='guitar' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000099', id FROM public.instruments WHERE slug='vocals' ON CONFLICT DO NOTHING;
INSERT INTO public.artist_instruments (artist_id, instrument_id) SELECT 'd1000000-0000-0000-0000-000000000100', id FROM public.instruments WHERE slug='violin' ON CONFLICT DO NOTHING;

-- ── Done ─────────────────────────────────────────────────────
-- Artists 51–100 added. Total now 100+ musicians on Sohaya.
-- Login: any @sohaya.in email / Artist2026!
