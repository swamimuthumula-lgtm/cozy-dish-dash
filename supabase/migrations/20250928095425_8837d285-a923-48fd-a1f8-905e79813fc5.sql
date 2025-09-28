-- Create enum for dish types
CREATE TYPE public.dish_type AS ENUM ('veg', 'non_veg');

-- Create enum for transaction types  
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT, -- emoji or icon name
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dishes table
CREATE TABLE public.dishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  type dish_type NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  description TEXT,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  dish_id UUID REFERENCES public.dishes(id), -- for sales transactions
  quantity INTEGER DEFAULT 1,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for now, allow all operations - can be restricted later)
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on dishes" ON public.dishes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON public.dishes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, icon) VALUES 
('Appetizers', '🥗'),
('Main Course', '🍽️'),
('Desserts', '🍰'),
('Beverages', '🥤'),
('Snacks', '🍿');

-- Insert sample dishes
INSERT INTO public.dishes (name, price, type, category_id, description) VALUES 
('Paneer Butter Masala', 280.00, 'veg', (SELECT id FROM public.categories WHERE name = 'Main Course'), 'Creamy tomato curry with cottage cheese'),
('Chicken Biryani', 350.00, 'non_veg', (SELECT id FROM public.categories WHERE name = 'Main Course'), 'Aromatic basmati rice with tender chicken'),
('Veg Spring Rolls', 120.00, 'veg', (SELECT id FROM public.categories WHERE name = 'Appetizers'), 'Crispy rolls filled with fresh vegetables'),
('Butter Chicken', 320.00, 'non_veg', (SELECT id FROM public.categories WHERE name = 'Main Course'), 'Rich and creamy tomato-based chicken curry'),
('Gulab Jamun', 80.00, 'veg', (SELECT id FROM public.categories WHERE name = 'Desserts'), 'Sweet milk dumplings in sugar syrup'),
('Fresh Lime Soda', 60.00, 'veg', (SELECT id FROM public.categories WHERE name = 'Beverages'), 'Refreshing lime drink with soda');

-- Insert sample transactions (some sales and some expenses)
INSERT INTO public.transactions (type, amount, description, dish_id, quantity) VALUES 
('income', 280.00, 'Paneer Butter Masala sale', (SELECT id FROM public.dishes WHERE name = 'Paneer Butter Masala'), 1),
('income', 700.00, 'Chicken Biryani sale', (SELECT id FROM public.dishes WHERE name = 'Chicken Biryani'), 2),
('income', 240.00, 'Veg Spring Rolls sale', (SELECT id FROM public.dishes WHERE name = 'Veg Spring Rolls'), 2),
('expense', 5000.00, 'Monthly rent', NULL, NULL),
('expense', 1200.00, 'Grocery supplies', NULL, NULL),
('expense', 800.00, 'Electricity bill', NULL, NULL),
('income', 320.00, 'Butter Chicken sale', (SELECT id FROM public.dishes WHERE name = 'Butter Chicken'), 1),
('income', 140.00, 'Dessert combo sale', (SELECT id FROM public.dishes WHERE name = 'Gulab Jamun'), 1);