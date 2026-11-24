-- Demo wedding for local/preview testing. Mirrors src/lib/data/seed.ts.
-- The family edits all of this from the dashboard once it exists (Phase 3).

insert into weddings (id, groom_name, bride_name, title, main_date, main_date_bs, hashtag, rsvp_deadline, invite_message)
values ('00000000-0000-4000-8000-000000000001', 'Nirajan', 'Deepa', 'Nirajan & Deepa', '2027-02-28', 'Fagun 16, 2083',
        '#NirajanWedsDeepa', '2027-02-20',
        'Namaste 🙏 With joy, our family invites you to Nirajan & Deepa''s wedding. Your personal invitation: {link}');

insert into events (id, wedding_id, kind, name, subtitle, event_date, date_bs, starts_at, venue_name, venue_city, address, dress_code, dress_colors, image_path, sort_order, is_published) values
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'tilak_matkor', 'Tilak & Matkor', 'तिलक आ मटकोर', '2027-02-26', 'Fagun 14', '15:00', 'Groom''s home', 'Biratnagar', 'Biratnagar, Morang', 'Mithila red & yellow', '{#C62828,#F2B61F}', '/images/tilak-matkor.jpg', 1, true),
('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'haldi', 'Haldi', 'हल्दी', '2027-02-27', 'Fagun 15', '11:00', 'Both homes', 'Biratnagar & Gaighat', null, 'Marigold yellow', '{#F2B61F,#FFFFFF}', '/images/haldi.jpg', 2, true),
('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'mehendi', 'Mehendi', 'मेहेन्दी', '2027-02-27', 'Fagun 15', '15:00', 'Bride''s home', 'Gaighat', 'Gaighat, Udayapur', 'Leaf green', '{#2E7D32,#F3D99B}', '/images/mehendi.jpg', 3, true),
('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000001', 'baraat', 'Baraat / Janti', 'बरियात', '2027-02-28', 'Fagun 16', '07:00', 'Departs groom''s home', 'Biratnagar → Gaighat', 'Biratnagar, Morang', 'Festive', '{#8E1B1B,#C9A24A}', '/images/baraat.jpg', 4, true),
('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000001', 'bibah', 'Bibah', 'बिहे', '2027-02-28', 'Fagun 16', '11:00', '[Venue]', 'Gaighat', 'Gaighat, Udayapur', 'Red & gold', '{#8E1B1B,#C9A24A}', '/images/bibah.jpg', 5, true),
('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000001', 'reception', 'Reception', 'भोज', '2027-03-01', 'Fagun 17', '18:00', '[Venue]', 'Biratnagar', 'Biratnagar, Morang', 'Festive', '{#1F4E3D,#3A0A0C}', '/images/reception.jpg', 6, true);

insert into households (id, wedding_id, display_name, side, group_tag, max_guests, slug) values
('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', 'Dr. R.K. Sharma & Family', 'bride', 'Relatives', 4, 'sharma-parivar-9k4m2x'),
('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', 'Jha Family (Darbhanga)', 'groom', 'Close family', 6, 'jha-family-p7q2wd'),
('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000001', 'Office – Tech Team', 'common', 'Office', 8, 'office-tech-team-c3n8vr');

insert into invitations (household_id, event_id)
select h, e from (values
  ('00000000-0000-4000-8000-000000000201'::uuid, '00000000-0000-4000-8000-000000000102'::uuid),
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000103'),
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000105'),
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000106'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000104'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000105'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000106'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000106')
) as t(h, e);
