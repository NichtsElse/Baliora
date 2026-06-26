-- Purpose: Seeds the BALIORA Supabase schema with demo data for local-to-Supabase migration testing.
-- Used by: Supabase SQL editor after the schema migration has been created.
-- Main dependencies: the public tables defined in supabase/migrations/001_init.sql.
-- Public objects: demo app users, villas, inquiries, owners, blog posts, ba_faqs, ba_testimonials, website settings, and activity logs.
-- Side effects: Inserts or upserts demo rows into the public schema.

insert into public.ba_app_users (id, email, full_name, role, contact_number, status)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@baliora.local', 'BALIORA Admin', 'admin', '+62 812-3456-7890', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'villa.manager@baliora.local', 'Villa Manager', 'villa_manager', '+62 812-3456-7891', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'reservation.staff@baliora.local', 'Reservation Staff', 'reservation_staff', '+62 812-5555-1234', 'active'),
  ('44444444-4444-4444-4444-444444444444', 'content.manager@baliora.local', 'Content Manager', 'content_manager', '+62 813-2222-3344', 'active'),
  ('55555555-5555-5555-5555-555555555555', 'user@baliora.local', 'Read Only User', 'user', '+62 811-0000-0000', 'active')
on conflict (email) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  contact_number = excluded.contact_number,
  status = excluded.status,
  updated_at = now();

insert into public.ba_villa_listings (
  id, slug, name, location, address_area, bedrooms, bathrooms, max_guests, price_per_night,
  short_description, full_description, amenities, image_urls, house_rules, highlight_tags,
  status, rating, review_count
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'villa-tirta-canggu',
    'Villa Tirta Canggu',
    'Canggu',
    'Berawa',
    4, 4, 8, 450,
    'A serene four-bedroom estate with rice field views and a generous private pool near Echo Beach.',
    'Villa Tirta Canggu blends quiet tropical living with quick access to Bali dining and surf culture. Guests enjoy open-plan living, landscaped gardens, a private pool, and a dedicated hospitality team that keeps every stay effortless.',
    array['Private Pool', 'Rice Field View', 'Daily Housekeeping', 'Fast Wi-Fi', 'Airport Transfer'],
    array['https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=1200&q=80', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80'],
    array['No parties without prior approval', 'No smoking indoors', 'Quiet hours after 10 PM'],
    array['Family Friendly', 'Rice Field Views', 'Managed Stay'],
    'available', 4.90, 24
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'villa-karang-seminyak',
    'Villa Karang Seminyak',
    'Seminyak',
    'Petitenget',
    3, 3, 6, 380,
    'An elegant garden villa steps from Seminyak dining, beach clubs, and sunset walks.',
    'Villa Karang Seminyak is designed for guests who want privacy without losing easy access to the island''s most vibrant neighborhood. The villa pairs refined interiors, lush landscaping, and warm service for relaxed, stylish stays.',
    array['Private Pool', 'Breakfast Included', 'Honeymoon Setup', 'Housekeeping', 'Walkable Location'],
    array['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80', 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80'],
    array['Registered guests only', 'No loud music after 10 PM', 'Pets by request only'],
    array['Central Seminyak', 'Romantic Escape', 'Private Garden'],
    'available', 4.80, 41
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'villa-watu-uluwatu',
    'Villa Watu Uluwatu',
    'Uluwatu',
    'Pecatu',
    5, 5, 10, 750,
    'A dramatic clifftop escape with ocean panoramas, sunset decks, and event-ready spaces.',
    'Villa Watu Uluwatu is built for memorable group stays. Floor-to-ceiling views, a large infinity pool, and generous indoor-outdoor entertaining spaces make it ideal for milestone trips, private retreats, and luxury family travel.',
    array['Private Pool', 'Ocean View', 'Private Chef', 'Sunset Deck', 'Driver on Request'],
    array['https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&q=80', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'],
    array['Children must be supervised near cliff areas', 'Events require prior approval', 'No outside vendors without coordination'],
    array['Oceanfront', 'Group Stays', 'Sunset Views'],
    'available', 5.00, 18
  )
on conflict (slug) do update set
  name = excluded.name,
  location = excluded.location,
  address_area = excluded.address_area,
  bedrooms = excluded.bedrooms,
  bathrooms = excluded.bathrooms,
  max_guests = excluded.max_guests,
  price_per_night = excluded.price_per_night,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  amenities = excluded.amenities,
  image_urls = excluded.image_urls,
  house_rules = excluded.house_rules,
  highlight_tags = excluded.highlight_tags,
  status = excluded.status,
  rating = excluded.rating,
  review_count = excluded.review_count,
  updated_at = now();

insert into public.ba_owner_inquiries (
  id, name, email, whatsapp, villa_location, bedroom_count, current_status, message, status, source
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'Ratna',
    'ratna@gmail.com',
    '08962726256',
    'Canggu',
    3,
    'rental',
    'Need help with airport transfer and overall villa consultation.',
    'new',
    'website'
  )
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  whatsapp = excluded.whatsapp,
  villa_location = excluded.villa_location,
  bedroom_count = excluded.bedroom_count,
  current_status = excluded.current_status,
  message = excluded.message,
  status = excluded.status,
  source = excluded.source,
  updated_at = now();

insert into public.ba_booking_inquiries (
  id, villa_id, villa_name, guest_name, email, whatsapp, check_in, check_out, guests, special_requests, status, source
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'Villa Karang Seminyak',
    'Ratna',
    'ratna@gmail.com',
    '08962726256',
    '2026-06-24',
    '2026-06-25',
    3,
    'Airport transfer',
    'new',
    'website'
  )
on conflict (id) do update set
  villa_id = excluded.villa_id,
  villa_name = excluded.villa_name,
  guest_name = excluded.guest_name,
  email = excluded.email,
  whatsapp = excluded.whatsapp,
  check_in = excluded.check_in,
  check_out = excluded.check_out,
  guests = excluded.guests,
  special_requests = excluded.special_requests,
  status = excluded.status,
  source = excluded.source,
  updated_at = now();

insert into public.ba_villa_assessments (
  id, owner_name, contact, villa_name, location, bedrooms, current_operation, rental_platform, average_occupancy, monthly_revenue, main_problem, status, source
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    'Wayan Darta',
    'wayan@example.com',
    'Villa Saba',
    'Ubud',
    4,
    'hybrid-use',
    'Airbnb, Booking.com',
    68,
    125000000,
    'Need help standardizing operations and improving occupancy consistency.',
    'reviewing',
    'website'
  )
on conflict (id) do update set
  owner_name = excluded.owner_name,
  contact = excluded.contact,
  villa_name = excluded.villa_name,
  location = excluded.location,
  bedrooms = excluded.bedrooms,
  current_operation = excluded.current_operation,
  rental_platform = excluded.rental_platform,
  average_occupancy = excluded.average_occupancy,
  monthly_revenue = excluded.monthly_revenue,
  main_problem = excluded.main_problem,
  status = excluded.status,
  source = excluded.source,
  updated_at = now();

insert into public.ba_villa_owners (
  id, name, email, whatsapp, nationality, contract_start, contract_end, revenue_share_percent, management_fee_type, notes, status
)
values
  (
    '50000000-0000-0000-0000-000000000001',
    'BALIORA Owner',
    'owner@example.com',
    '+62 812 9999 1111',
    'Indonesian',
    '2026-01-01',
    '2027-01-01',
    80,
    'percentage',
    'Primary demo owner record for migration testing.',
    'active'
  )
on conflict (email) do update set
  name = excluded.name,
  whatsapp = excluded.whatsapp,
  nationality = excluded.nationality,
  contract_start = excluded.contract_start,
  contract_end = excluded.contract_end,
  revenue_share_percent = excluded.revenue_share_percent,
  management_fee_type = excluded.management_fee_type,
  notes = excluded.notes,
  status = excluded.status,
  updated_at = now();

insert into public.ba_blog_posts (
  id, slug, title, excerpt, content, featured_image, category, tags, status, seo_title, seo_description, author, published_at
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '5-alasan-investasi-villa-di-bali',
    '5 Alasan Investasi Villa di Bali',
    'Bali tetap menjadi pasar properti paling konsisten di Indonesia untuk investasi villa.',
    '# 5 Alasan Investasi Villa di Bali

Bali tetap menjadi pasar properti paling konsisten di Indonesia untuk investasi villa. Berikut lima alasan utama berdasarkan data pasar dan struktur bisnis yang relevan.

## 1. Permintaan Wisatawan Stabil dan Terus Tumbuh

Bali menerima jutaan kunjungan wisatawan domestik dan internasional setiap tahun. Permintaan ini menciptakan pasar sewa jangka pendek yang konsisten melalui platform seperti Airbnb, Booking.com, dan Agoda.

## 2. Yield Sewa Lebih Tinggi Dibanding Kota Besar

Villa di Bali umumnya menghasilkan yield sewa kotor lebih tinggi dibanding apartemen di kota besar lain, terutama pada lokasi prime seperti Canggu, Seminyak, dan Uluwatu.

## 3. Skema Leasehold yang Fleksibel

Banyak investor asing memilih leasehold karena lebih mudah diakses dan memberi fleksibilitas investasi jangka menengah hingga panjang.

## 4. Pasar Premium yang Berkembang

Permintaan villa premium terus tumbuh seiring berkembangnya wisata luxury, wellness, dan remote work.

## 5. Operasi yang Bisa Dinormalisasi

Dengan manajemen profesional, villa dapat dijalankan layaknya aset hospitality yang terukur, transparan, dan scalable.',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
    'Villa Investment',
    array['Bali', 'Villa Investment', 'Real Estate'],
    'published',
    '5 Alasan Investasi Villa di Bali | BALIORA Villa Management',
    'Panduan singkat tentang alasan investasi villa di Bali.',
    'BALIORA Team',
    '2026-06-01 08:00:00+00'
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  featured_image = excluded.featured_image,
  category = excluded.category,
  tags = excluded.tags,
  status = excluded.status,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  author = excluded.author,
  published_at = excluded.published_at,
  updated_at = now();

insert into public.ba_faqs (id, question, answer, category, sort_order, status)
values
  (
    '70000000-0000-0000-0000-000000000001',
    'What types of villas do you manage?',
    'We manage luxury villas across Bali - from 2-bedroom private retreats to large compound estates.',
    'General',
    0,
    'active'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    'Do owners still have control over their property?',
    'Absolutely. Baliora operates as your management partner, not a replacement for ownership decisions.',
    'General',
    1,
    'active'
  ),
  (
    '70000000-0000-0000-0000-000000000003',
    'How often are reports sent?',
    'We provide comprehensive monthly reports covering financial performance, occupancy analytics, maintenance activities, guest reviews, and operational updates.',
    'Reporting',
    2,
    'active'
  )
on conflict (id) do update set
  question = excluded.question,
  answer = excluded.answer,
  category = excluded.category,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

insert into public.ba_testimonials (id, owner_name, country, villa_name, review, rating, photo_url, sort_order, is_featured, status)
values
  (
    '80000000-0000-0000-0000-000000000001',
    'Villa Owner',
    'Indonesia',
    'Seminyak Villa',
    'Since partnering with Baliora, our villa occupancy increased by 40% and we finally have complete visibility into every aspect of our property.',
    5,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    0,
    true,
    'active'
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    'Sarah W.',
    'Australia',
    'Villa Karang Seminyak',
    'The reporting is clear, the response time is fast, and the team makes ownership feel effortless.',
    5,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    1,
    true,
    'active'
  ),
  (
    '80000000-0000-0000-0000-000000000003',
    'John T.',
    'Singapore',
    'Villa Tirta Canggu',
    'We finally have a management partner that feels structured, responsive, and accountable.',
    5,
    null,
    2,
    true,
    'active'
  )
on conflict (id) do update set
  owner_name = excluded.owner_name,
  country = excluded.country,
  villa_name = excluded.villa_name,
  review = excluded.review,
  rating = excluded.rating,
  photo_url = excluded.photo_url,
  sort_order = excluded.sort_order,
  is_featured = excluded.is_featured,
  status = excluded.status,
  updated_at = now();

insert into public.ba_website_settings (key, value, label, category, type)
values
  ('company_name', 'BALIORA', 'Company Name', 'Company', 'text'),
  ('company_tagline', 'End-to-end villa management in Bali. Protecting your asset, elevating your returns.', 'Company Tagline', 'Company', 'text'),
  ('contact_email', 'info@v-teki.com', 'Contact Email', 'Contact', 'email'),
  ('whatsapp_number', '+62-822 2788 8025', 'WhatsApp Number', 'Contact', 'text'),
  ('address', 'Bali, Indonesia', 'Address', 'Contact', 'text'),
  ('website_url', 'www.balioravilla.com', 'Website URL', 'Contact', 'text'),
  ('hero_eyebrow', 'Villa Management in Bali', 'Hero Eyebrow', 'Hero', 'text'),
   ('hero_title', 'End-to-End Villa Management in Bali', 'Hero Title', 'Hero', 'text'),
  ('hero_subtitle', 'Protecting your asset, elevating your returns.', 'Hero Subtitle', 'Hero', 'text'),
  ('hero_image', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80', 'Hero Background Image', 'Hero', 'url'),
  ('trust_statement', 'Your villa is an investment. We manage it like one.', 'Trust Statement', 'Home', 'text'),
  ('testimonial_image', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', 'Homepage Testimonial Image', 'Homepage', 'url'),
  ('about_hero_title', 'Your Dedicated Villa Management Partner', 'About Hero Title', 'About', 'text'),
  ('about_hero_desc', 'Owning a villa in Bali should be rewarding, not demanding. Baliora exists to bridge that gap with professional, end-to-end management.', 'About Hero Description', 'About', 'text'),
  ('about_image', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', 'About Image', 'About', 'url'),
  ('about_story_title', 'Built for Villa Owners Who Expect More', 'About Story Title', 'About', 'text'),
  ('about_story_p1', 'Baliora was founded on a simple observation: most villa owners in Bali are underserved.', 'About Story Paragraph 1', 'About', 'text'),
  ('about_story_p2', 'We handle operations, finance, maintenance, staffing, compliance, guest experience, and owner reporting.', 'About Story Paragraph 2', 'About', 'text'),
  ('about_story_p3', 'Our team brings together hospitality expertise, financial discipline, and deep local knowledge.', 'About Story Paragraph 3', 'About', 'text'),
  ('about_mission_title', 'To set the standard for professional villa management in Bali', 'About Mission Title', 'About', 'text'),
  ('about_mission_desc', 'We believe every villa owner deserves a management partner who treats their property with the same care and accountability as they would.', 'About Mission Description', 'About', 'text'),
  ('services_page_title', 'Six Pillars of Complete Villa Management', 'Services Page Title', 'Services', 'text'),
  ('services_page_desc', 'Every aspect of your villa - managed, maintained, and optimized by a single accountable team.', 'Services Page Description', 'Services', 'text'),
  ('services_cta_title', 'Ready for Professional Management?', 'Services CTA Title', 'Services', 'text'),
  ('services_cta_subtitle', 'Tell us about your villa. We''ll show you what complete management looks like.', 'Services CTA Subtitle', 'Services', 'text'),
  ('nav_links', '[{"label":"Villa Management","path":"/services"},{"label":"Rental Villas","path":"/villas"},{"label":"How It Works","path":"/how-it-works"},{"label":"Journal","path":"/blog"},{"label":"About","path":"/about"}]', 'Navigation Links', 'navbar', 'json'),
  ('cta_buttons', '[{"label":"Owner Consultation","path":"/contact","style":"primary"}]', 'CTA Buttons', 'navbar', 'json')
on conflict (key) do update set
  value = excluded.value,
  label = excluded.label,
  category = excluded.category,
  type = excluded.type,
  updated_at = now();

insert into public.ba_activity_logs (id, entity_type, action, details, user_name)
values
  (
    '90000000-0000-0000-0000-000000000001',
    'WebsiteSetting',
    'Seeded website settings',
    'Initial Supabase migration seed',
    'BALIORA Admin'
  )
on conflict (id) do update set
  entity_type = excluded.entity_type,
  action = excluded.action,
  details = excluded.details,
  user_name = excluded.user_name,
  updated_at = now();

-- Seed data for Reservations, Guests, and Communication Logs
insert into public.ba_reservations (id, villa_id, villa_name, guest_name, email, whatsapp, check_in, check_out, guests, total_price, status, payment_status, notes)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Villa Tirta Canggu',
    'Liam Vance',
    'liam.vance@example.com',
    '+628123456789',
    '2026-07-10',
    '2026-07-17',
    4,
    3150.00,
    'confirmed',
    'paid',
    'Honeymoon setup requested. Gluten-free breakfast choices.'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Villa Karang Seminyak',
    'Sophia Loren',
    'sophia.l@example.com',
    '+61491570156',
    '2026-08-01',
    '2026-08-05',
    2,
    1520.00,
    'confirmed',
    'partially_paid',
    'Needs airport pick-up.'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'Villa Tirta Canggu',
    'David Beck',
    'david@example.com',
    '+447911123456',
    '2026-06-10',
    '2026-06-15',
    6,
    2250.00,
    'checked_out',
    'paid',
    'Very satisfied.'
  )
on conflict (id) do update set
  villa_id = excluded.villa_id,
  villa_name = excluded.villa_name,
  guest_name = excluded.guest_name,
  email = excluded.email,
  whatsapp = excluded.whatsapp,
  check_in = excluded.check_in,
  check_out = excluded.check_out,
  guests = excluded.guests,
  total_price = excluded.total_price,
  status = excluded.status,
  payment_status = excluded.payment_status,
  notes = excluded.notes,
  updated_at = now();

insert into public.ba_guests (id, name, email, whatsapp, nationality, notes, total_bookings, total_spent, status)
values
  (
    '50000000-0000-0000-0000-000000000001',
    'Liam Vance',
    'liam.vance@example.com',
    '+628123456789',
    'Australian',
    'Prefers quiet rooms, gluten-free diet.',
    1,
    3150.00,
    'active'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'Sophia Loren',
    'sophia.l@example.com',
    '+61491570156',
    'Italian',
    'Requested baby cot in past bookings.',
    1,
    1520.00,
    'active'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'David Beck',
    'david@example.com',
    '+447911123456',
    'British',
    'Loyal guest, travels with family.',
    3,
    6750.00,
    'active'
  )
on conflict (email) do update set
  name = excluded.name,
  whatsapp = excluded.whatsapp,
  nationality = excluded.nationality,
  notes = excluded.notes,
  total_bookings = excluded.total_bookings,
  total_spent = excluded.total_spent,
  status = excluded.status,
  updated_at = now();

insert into public.ba_communication_logs (id, recipient_name, recipient_email, channel, subject, message, status)
values
  (
    '60000000-0000-0000-0000-000000000001',
    'Liam Vance',
    'liam.vance@example.com',
    'Email',
    'Villa Booking Confirmed - BALIORA',
    'Dear Liam Vance, your booking for Villa Tirta Canggu from 2026-07-10 to 2026-07-17 is confirmed. Thank you!',
    'sent'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'Sophia Loren',
    'sophia.l@example.com',
    'WhatsApp',
    'Pre-arrival Information',
    'Hi Sophia, we are preparing Villa Karang Seminyak for your stay starting Aug 1st. Do you need any airport transfer arrangements?',
    'sent'
  )
on conflict (id) do update set
  recipient_name = excluded.recipient_name,
  recipient_email = excluded.recipient_email,
  channel = excluded.channel,
  subject = excluded.subject,
  message = excluded.message,
  status = excluded.status,
  updated_at = now();

