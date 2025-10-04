-- First, set all dish category references to NULL
UPDATE dishes SET category_id = NULL WHERE category_id IS NOT NULL;

-- Clear existing categories
DELETE FROM categories;

-- Insert new meal-time categories
INSERT INTO categories (name, icon) VALUES
  ('Morning', '🌅'),
  ('Afternoon', '☀️'),
  ('Night', '🌙');