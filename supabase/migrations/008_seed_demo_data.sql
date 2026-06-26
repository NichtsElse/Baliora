-- Purpose: Seeds BALIORA demo data with fixed UUIDs so all foreign-key references are consistent.
-- Run this ONCE in the Supabase SQL editor AFTER running migrations 001–007.
-- Safe to re-run: every insert uses ON CONFLICT DO NOTHING.

-- ─── Fixed UUIDs ────────────────────────────────────────────────────────────
-- We pin UUIDs so all FK children can reference the same rows reliably.

-- Villa UUIDs
-- villa-tirta-canggu      → aaaaaaaa-0000-0000-0000-000000000001
-- villa-karang-seminyak   → aaaaaaaa-0000-0000-0000-000000000002
-- villa-watu-uluwatu      → aaaaaaaa-0000-0000-0000-000000000003
-- villa-hujan-ubud        → aaaaaaaa-0000-0000-0000-000000000004
-- villa-laut-sanur        → aaaaaaaa-0000-0000-0000-000000000005
-- villa-mentari-nusa-dua  → aaaaaaaa-0000-0000-0000-000000000006

-- Owner UUIDs
-- James Hartley    → bbbbbbbb-0000-0000-0000-000000000001
-- Sofia Andersson  → bbbbbbbb-0000-0000-0000-000000000002
-- BALIORA Owner    → bbbbbbbb-0000-0000-0000-000000000003

-- Clean up existing data to prevent unique constraint conflicts (e.g., on slug or other fields)
DELETE FROM public.ba_owner_revenue_entries;
DELETE FROM public.ba_owner_contracts;
DELETE FROM public.ba_villa_pricing_rules;
DELETE FROM public.ba_inventory_items;
DELETE FROM public.ba_maintenance_tickets;
DELETE FROM public.ba_housekeeping_tasks;
DELETE FROM public.ba_reservations;
DELETE FROM public.ba_guests;
DELETE FROM public.ba_villa_owners;
DELETE FROM public.ba_villa_listings;
DELETE FROM public.ba_ops_staff;
DELETE FROM public.ba_vendors;


-- ─── 1. Villa Listings ──────────────────────────────────────────────────────
insert into public.ba_villa_listings
  (id, slug, name, location, address_area, bedrooms, bathrooms, max_guests,
   price_per_night, short_description, full_description,
   amenities, image_urls, house_rules, highlight_tags,
   status, rating, review_count, created_at)
values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'villa-tirta-canggu', 'Villa Tirta Canggu', 'Canggu', 'Berawa',
    4, 4, 8, 450.00,
    'A serene four-bedroom estate with rice field views and a generous private pool near Echo Beach.',
    'Villa Tirta Canggu blends quiet tropical living with quick access to Bali dining and surf culture. Guests enjoy open-plan living, landscaped gardens, a private pool, and a dedicated hospitality team that keeps every stay effortless.',
    array['Private Pool','Rice Field View','Daily Housekeeping','Fast Wi-Fi','Airport Transfer'],
    array[
      'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80'
    ],
    array['No parties without prior approval','No smoking indoors','Quiet hours after 10 PM'],
    array['Family Friendly','Rice Field Views','Managed Stay'],
    'available', 4.90, 24, '2026-01-12 09:00:00+00'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'villa-karang-seminyak', 'Villa Karang Seminyak', 'Seminyak', 'Petitenget',
    3, 3, 6, 380.00,
    'An elegant garden villa steps from Seminyak dining, beach clubs, and sunset walks.',
    'Villa Karang Seminyak is designed for guests who want privacy without losing easy access to the island''s most vibrant neighborhood. The villa pairs refined interiors, lush landscaping, and warm service for relaxed, stylish stays.',
    array['Private Pool','Breakfast Included','Honeymoon Setup','Housekeeping','Walkable Location'],
    array[
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80'
    ],
    array['Registered guests only','No loud music after 10 PM','Pets by request only'],
    array['Central Seminyak','Romantic Escape','Private Garden'],
    'available', 4.80, 41, '2026-01-09 09:00:00+00'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'villa-watu-uluwatu', 'Villa Watu Uluwatu', 'Uluwatu', 'Pecatu',
    5, 5, 10, 750.00,
    'A dramatic clifftop escape with ocean panoramas, sunset decks, and event-ready spaces.',
    'Villa Watu Uluwatu is built for memorable group stays. Floor-to-ceiling views, a large infinity pool, and generous indoor-outdoor entertaining spaces make it ideal for milestone trips, private retreats, and luxury family travel.',
    array['Private Pool','Ocean View','Private Chef','Sunset Deck','Driver on Request'],
    array[
      'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'
    ],
    array['Children must be supervised near cliff areas','Events require prior approval','No outside vendors without coordination'],
    array['Oceanfront','Group Stays','Sunset Views'],
    'available', 5.00, 18, '2026-01-07 09:00:00+00'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    'villa-hujan-ubud', 'Villa Hujan Ubud', 'Ubud', 'Sayan',
    4, 4, 8, 520.00,
    'A lush jungle hideaway with wellness spaces, river breezes, and a calm residential setting.',
    'Villa Hujan Ubud is curated for guests seeking a restorative Bali rhythm. Expect layered greenery, spa-style bathrooms, quiet corners for slow mornings, and service touches that support longer stays and wellness-oriented travel.',
    array['Private Pool','Jungle View','Yoga Deck','Daily Housekeeping','In-Villa Massage'],
    array[
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80'
    ],
    array['Respect quiet neighborhood surroundings','No drones without permission','Pool area may be slippery when wet'],
    array['Wellness Retreat','Jungle Escape','Quiet Luxury'],
    'available', 4.90, 29, '2026-01-05 09:00:00+00'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    'villa-laut-sanur', 'Villa Laut Sanur', 'Sanur', 'Mertasari',
    3, 3, 6, 340.00,
    'A breezy coastal stay near calm beaches, cafés, and family-friendly activities.',
    'Villa Laut Sanur offers an easy, comfortable base for families and longer leisure stays. Thoughtful layouts, flexible service support, and a neighborhood close to beach walks make it a dependable choice for relaxed Bali travel.',
    array['Private Pool','Near Beach','Family Setup','Fast Wi-Fi','Bike Rental'],
    array[
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80'
    ],
    array['No smoking inside bedrooms','Please rinse sand before entering pool','Check-in after 3 PM'],
    array['Family Stay','Beach Access','Long Stay Ready'],
    'available', 4.70, 15, '2026-01-03 09:00:00+00'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000006',
    'villa-mentari-nusa-dua', 'Villa Mentari Nusa Dua', 'Nusa Dua', 'Sawangan',
    5, 5, 10, 680.00,
    'A polished resort-style residence with expansive entertaining areas and attentive service.',
    'Villa Mentari Nusa Dua is tailored for guests who want a resort-level environment in a private villa setting. Spacious suites, strong operational standards, and event-friendly communal areas make it a standout for premium stays.',
    array['Private Pool','Butler Service','Home Cinema','Private Chef','Security'],
    array[
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'
    ],
    array['Security deposit may apply for events','Outside catering by approval only','Pool gates must remain closed when children are present'],
    array['Premium Service','Event Ready','Resort Feel'],
    'available', 4.95, 12, '2026-01-01 09:00:00+00'
  )
on conflict (id) do nothing;

-- ─── 2. Villa Owners ────────────────────────────────────────────────────────
insert into public.ba_villa_owners
  (id, name, email, whatsapp, nationality, status, created_at)
values
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'James Hartley', 'james.hartley@example.com', '+61 491 570 156',
    'Australian', 'active', '2024-12-15 10:00:00+00'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Sofia Andersson', 'sofia.andersson@example.com', '+46 8 123 4567',
    'Swedish', 'active', '2024-12-15 10:00:00+00'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    'BALIORA Owner', 'owner@example.com', '+62 812 9999 1111',
    'Indonesian', 'active', '2026-01-01 00:00:00+00'
  )
on conflict (id) do nothing;

-- ─── 3. Guests ──────────────────────────────────────────────────────────────
insert into public.ba_guests
  (id, name, email, whatsapp, nationality, notes,
   total_bookings, total_spent, status, created_at)
values
  (
    'cccccccc-0000-0000-0000-000000000001',
    'Liam Vance', 'liam.vance@example.com', '+628123456789',
    'Australian', 'Prefers quiet rooms, gluten-free diet.',
    1, 3150, 'active', '2026-06-15 12:00:00+00'
  ),
  (
    'cccccccc-0000-0000-0000-000000000002',
    'Sophia Loren', 'sophia.l@example.com', '+61491570156',
    'Italian', 'Requested baby cot in past bookings.',
    1, 1520, 'active', '2026-06-20 08:30:00+00'
  ),
  (
    'cccccccc-0000-0000-0000-000000000003',
    'David Beck', 'david@example.com', '+447911123456',
    'British', 'Loyal guest, travels with family.',
    3, 6750, 'active', '2026-05-01 14:22:00+00'
  )
on conflict (id) do nothing;

-- ─── 4. Reservations ────────────────────────────────────────────────────────
insert into public.ba_reservations
  (id, villa_id, villa_name, guest_name, email, whatsapp,
   check_in, check_out, guests, total_price,
   status, payment_status, notes, created_at)
values
  (
    'dddddddd-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    'Liam Vance', 'liam.vance@example.com', '+628123456789',
    '2026-07-10', '2026-07-17', 4, 3150,
    'confirmed', 'paid',
    'Honeymoon setup requested. Gluten-free breakfast choices.',
    '2026-06-15 12:00:00+00'
  ),
  (
    'dddddddd-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000002', 'Villa Karang Seminyak',
    'Sophia Loren', 'sophia.l@example.com', '+61491570156',
    '2026-08-01', '2026-08-05', 2, 1520,
    'confirmed', 'partially_paid',
    'Needs airport pick-up.',
    '2026-06-20 08:30:00+00'
  ),
  (
    'dddddddd-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    'David Beck', 'david@example.com', '+447911123456',
    '2026-06-10', '2026-06-15', 6, 2250,
    'checked_out', 'paid',
    'Very satisfied.',
    '2026-05-01 14:22:00+00'
  )
on conflict (id) do nothing;

-- ─── 5. Housekeeping Tasks ──────────────────────────────────────────────────
insert into public.ba_housekeeping_tasks
  (id, villa_id, villa_name, room_number, task_type,
   assigned_to, scheduled_date, status, remarks, created_at)
values
  (
    'eeeeeeee-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    'All Rooms', 'Deep Clean', 'Wayan',
    '2026-07-10', 'pending',
    'Prepare for guest Liam Vance check-in.',
    '2026-06-25 08:00:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000002', 'Villa Karang Seminyak',
    'Master Bedroom', 'Standard Clean', 'Kadek',
    '2026-06-26', 'cleaning',
    'Regular daily cleaning.',
    '2026-06-26 07:00:00+00'
  )
on conflict (id) do nothing;

-- ─── 6. Maintenance Tickets ─────────────────────────────────────────────────
insert into public.ba_maintenance_tickets
  (id, villa_id, villa_name, title, description,
   priority, status, assigned_to, estimated_cost, reported_by, created_at)
values
  (
    'ffffffff-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    'AC Leaking in Bedroom 2',
    'Water is dripping from the indoor AC unit onto the floor.',
    'high', 'pending', 'Made (Technician)', 75.00, 'Staff',
    '2026-06-25 10:00:00+00'
  ),
  (
    'ffffffff-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000002', 'Villa Karang Seminyak',
    'Pool Light Bulbs Replaced',
    'Two LED underwater lights are out.',
    'medium', 'in_progress', 'Gede (Technician)', 120.00, 'Guest Sophia Loren',
    '2026-06-26 09:15:00+00'
  )
on conflict (id) do nothing;

-- ─── 7. Ops Staff ───────────────────────────────────────────────────────────
insert into public.ba_ops_staff
  (id, name, role, contact_number, shift, assigned_villas, status, created_at)
values
  (
    '11111111-0000-0000-0000-000000000001',
    'Wayan Sudiarta', 'Housekeeper', '+6281234567890',
    'Morning', 'Villa Tirta Canggu', 'active', '2026-01-10 08:00:00+00'
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    'Kadek Wardana', 'Housekeeper', '+6287654321098',
    'Afternoon', 'Villa Karang Seminyak', 'active', '2026-02-15 09:00:00+00'
  ),
  (
    '11111111-0000-0000-0000-000000000003',
    'Made Artawan', 'Technician', '+6282227888025',
    'Morning', 'All Villas', 'active', '2026-03-01 08:30:00+00'
  )
on conflict (id) do nothing;

-- ─── 8. Vendors ─────────────────────────────────────────────────────────────
insert into public.ba_vendors
  (id, company_name, service_type, contact_person, phone, email, rating, status, created_at)
values
  (
    '22222222-0000-0000-0000-000000000001',
    'Bali Cool AC Services', 'AC Maintenance', 'Ketut',
    '+628111222333', 'ac.cool@bali.com', 5, 'active', '2026-01-05 10:00:00+00'
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    'Dewata Pool & Spa Care', 'Pool Maintenance', 'Gede',
    '+628555666777', 'dewata.pool@bali.com', 4, 'active', '2026-01-08 11:00:00+00'
  )
on conflict (id) do nothing;

-- ─── 9. Inventory Items ─────────────────────────────────────────────────────
insert into public.ba_inventory_items
  (id, item_name, villa_id, villa_name, category,
   stock_level, minimum_required, last_restocked, created_at)
values
  (
    '33333333-0000-0000-0000-000000000001',
    'Bath Towels',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    'Linens', 24, 30, '2026-06-01', '2026-05-01 08:00:00+00'
  ),
  (
    '33333333-0000-0000-0000-000000000002',
    'Luxury Shampoo (500ml)',
    'aaaaaaaa-0000-0000-0000-000000000002', 'Villa Karang Seminyak',
    'Toiletries', 15, 10, '2026-06-20', '2026-05-01 08:00:00+00'
  ),
  (
    '33333333-0000-0000-0000-000000000003',
    'Bed Sheets (King)',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    'Linens', 8, 16, '2026-05-15', '2026-05-01 08:00:00+00'
  )
on conflict (id) do nothing;

-- ─── 10. Villa Pricing Rules ────────────────────────────────────────────────
insert into public.ba_villa_pricing_rules
  (id, villa_id, villa_name, rule_name, start_date, end_date, rate_type, value, created_at)
values
  (
    '44444444-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    'Peak Season Summer 2026',
    '2026-07-01', '2026-08-31', 'multiplier', 1.25, '2026-06-01 00:00:00+00'
  ),
  (
    '44444444-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000002', 'Villa Karang Seminyak',
    'Christmas & New Year Special',
    '2026-12-20', '2027-01-05', 'fixed', 450.00, '2026-06-01 00:00:00+00'
  )
on conflict (id) do nothing;

-- ─── 11. Owner Contracts ────────────────────────────────────────────────────
insert into public.ba_owner_contracts
  (id, owner_id, owner_name, villa_id, villa_name,
   contract_type, start_date, end_date,
   revenue_share_percent, management_fee_type,
   status, signed_date, notes, document_url, created_at)
values
  (
    '55555555-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001', 'James Hartley',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    'Full Management', '2025-01-01', '2026-12-31',
    80.00, 'percentage', 'active', '2024-12-15',
    'Owner based in Australia. Prefers quarterly reports.', '',
    '2024-12-15 10:00:00+00'
  ),
  (
    '55555555-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000002', 'Sofia Andersson',
    'aaaaaaaa-0000-0000-0000-000000000002', 'Villa Karang Seminyak',
    'Rental Only', '2025-03-01', '2027-02-28',
    75.00, 'percentage', 'active', '2025-02-10',
    'Bi-annual payment schedule preferred.', '',
    '2025-02-10 09:00:00+00'
  ),
  (
    '55555555-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000003', 'BALIORA Owner',
    'aaaaaaaa-0000-0000-0000-000000000003', 'Villa Watu Uluwatu',
    'Full Management', '2024-06-01', '2025-05-31',
    82.00, 'percentage', 'expired', '2024-05-20',
    'Contract renewal pending negotiation.', '',
    '2024-05-20 11:00:00+00'
  )
on conflict (id) do nothing;

-- ─── 12. Owner Revenue Entries ──────────────────────────────────────────────
insert into public.ba_owner_revenue_entries
  (id, owner_id, owner_name, villa_id, villa_name,
   period_month, gross_revenue, management_fee, net_payout,
   occupancy_rate, nights_booked, payment_status, payment_date, created_at)
values
  (
    '66666666-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001', 'James Hartley',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    '2026-04', 4200, 840, 3360, 72, 22, 'paid', '2026-05-05',
    '2026-05-01 00:00:00+00'
  ),
  (
    '66666666-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000001', 'James Hartley',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    '2026-05', 5600, 1120, 4480, 90, 28, 'paid', '2026-06-05',
    '2026-06-01 00:00:00+00'
  ),
  (
    '66666666-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000001', 'James Hartley',
    'aaaaaaaa-0000-0000-0000-000000000001', 'Villa Tirta Canggu',
    '2026-06', 3150, 630, 2520, 48, 15, 'pending', null,
    '2026-07-01 00:00:00+00'
  ),
  (
    '66666666-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000002', 'Sofia Andersson',
    'aaaaaaaa-0000-0000-0000-000000000002', 'Villa Karang Seminyak',
    '2026-05', 7600, 1900, 5700, 95, 29, 'paid', '2026-06-07',
    '2026-06-01 00:00:00+00'
  ),
  (
    '66666666-0000-0000-0000-000000000005',
    'bbbbbbbb-0000-0000-0000-000000000002', 'Sofia Andersson',
    'aaaaaaaa-0000-0000-0000-000000000002', 'Villa Karang Seminyak',
    '2026-06', 1520, 380, 1140, 25, 8, 'pending', null,
    '2026-07-01 00:00:00+00'
  )
on conflict (id) do nothing;
