-- Seed Data for Paititi del Mar

-- Insert venue
INSERT INTO venues (id, name, timezone, theme_json) VALUES (
  1,
  'Paititi del Mar',
  'America/Mexico_City',
  '{
    "primaryColor": "#0369a1",
    "secondaryColor": "#c9b88a",
    "accentColor": "#ea580c",
    "fontDisplay": "Playfair Display",
    "fontBody": "Inter"
  }'::jsonb
);

-- Insert opening hours (Lunes a Domingo, 13:00 a 23:00)
INSERT INTO opening_hours (venue_id, day_of_week, open_time, close_time, is_closed) VALUES
  (1, 0, '13:00', '23:00', false), -- Domingo
  (1, 1, '13:00', '23:00', false), -- Lunes
  (1, 2, '13:00', '23:00', false), -- Martes
  (1, 3, '13:00', '23:00', false), -- Miércoles
  (1, 4, '13:00', '23:00', false), -- Jueves
  (1, 5, '13:00', '23:00', false), -- Viernes
  (1, 6, '13:00', '23:00', false); -- Sábado

-- Insert settings
INSERT INTO settings (venue_id, slot_minutes, default_reservation_duration_minutes, max_party_size, min_notice_minutes, max_days_ahead) VALUES
  (1, 30, 90, 10, 120, 30);

-- Insert tables (12 mesas con diferentes capacidades)
INSERT INTO tables (venue_id, label, capacity, active, x, y, w, h, shape) VALUES
  (1, 'Mesa 1', 2, true, 50, 50, 80, 80, 'square'),
  (1, 'Mesa 2', 2, true, 150, 50, 80, 80, 'square'),
  (1, 'Mesa 3', 4, true, 250, 50, 100, 80, 'rectangle'),
  (1, 'Mesa 4', 4, true, 370, 50, 100, 80, 'rectangle'),
  (1, 'Mesa 5', 4, true, 50, 150, 100, 80, 'rectangle'),
  (1, 'Mesa 6', 4, true, 170, 150, 100, 80, 'rectangle'),
  (1, 'Mesa 7', 6, true, 290, 150, 120, 100, 'rectangle'),
  (1, 'Mesa 8', 6, true, 50, 270, 120, 100, 'rectangle'),
  (1, 'Mesa 9', 6, true, 190, 270, 120, 100, 'rectangle'),
  (1, 'Mesa 10', 8, true, 330, 270, 140, 100, 'rectangle'),
  (1, 'Mesa 11', 8, true, 50, 390, 140, 100, 'rectangle'),
  (1, 'Mesa 12', 10, true, 210, 390, 160, 120, 'rectangle');

-- Note: Admin user must be created manually in Supabase Auth Dashboard
-- After creating the user, add their profile:
-- INSERT INTO staff_profiles (user_id, venue_id, role) VALUES ('USER_UUID_HERE', 1, 'owner');
