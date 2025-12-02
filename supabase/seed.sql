-- Seed data for Fromentine Restaurant

-- Insert 3 locations
INSERT INTO locations (id, name, lat, lng, address, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Downtown Location', 40.7128, -74.0060, '123 Main Street, Downtown, NY 10001', '(555) 123-4567'),
  ('22222222-2222-2222-2222-222222222222', 'North Location', 40.7589, -73.9851, '456 North Avenue, Midtown, NY 10018', '(555) 234-5678'),
  ('33333333-3333-3333-3333-333333333333', 'South Location', 40.6892, -74.0445, '789 South Boulevard, Financial District, NY 10004', '(555) 345-6789')
ON CONFLICT (id) DO NOTHING;

-- Insert 8 products (mix of food, groceries, drinks)
INSERT INTO products (id, name, description, price_cents, category, image_url, inventory_count) VALUES
  -- Food items
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classic Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 1299, 'food', NULL, 50),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Margherita Pizza', 'Fresh mozzarella, tomato sauce, and basil', 1899, 'food', NULL, 30),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Caesar Salad', 'Crisp romaine lettuce with Caesar dressing and croutons', 999, 'food', NULL, 40),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Grilled Chicken', 'Tender grilled chicken breast with seasonal vegetables', 1699, 'food', NULL, 25),
  
  -- Grocery items
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Fresh Bread Loaf', 'Artisan bread baked daily', 599, 'groceries', NULL, 100),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Organic Eggs (12pk)', 'Farm-fresh organic eggs', 699, 'groceries', NULL, 80),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Fresh Vegetables Bundle', 'Seasonal fresh vegetables', 899, 'groceries', NULL, 60),
  
  -- Drink item
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'House Wine Bottle', 'Premium house wine selection', 2499, 'drinks', NULL, 35)
ON CONFLICT (id) DO NOTHING;

-- Insert sample promotions
INSERT INTO promotions (id, title, description, starts_at, ends_at, image_url) VALUES
  ('pppppppp-pppp-pppp-pppp-pppppppppppp', 'Weekend Special', '20% off all pizzas this weekend!', NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', NULL),
  ('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'Happy Hour', 'Buy one burger, get one free (4pm-6pm daily)', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour', NULL)
ON CONFLICT (id) DO NOTHING;

-- Note: Admin users are created via Supabase Auth dashboard
-- Instructions:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Enter email and password
-- 4. Optionally, add user metadata or use Supabase Admin API to set custom claims/roles


