-- Dairy-Lift Products Database Setup
-- Complete SQL script for Supabase database initialization

-- Drop existing table if it exists (use with caution)
-- DROP TABLE IF EXISTS products CASCADE;

-- Create the products table with all required columns
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'in-stock' CHECK (status IN ('in-stock', 'out-of-stock', 'discontinued')),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    discount DECIMAL(5, 2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at when a row is modified
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access for everyone" ON products;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON products;

-- Create policies for security
CREATE POLICY "Allow read access for everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample products with all required columns
INSERT INTO products (name, description, price, category, image_url, status, stock, active) VALUES
('Whole Milk', 'Fresh whole milk from grass-fed cows, rich in nutrients and perfect for daily consumption.', 4.99, 'milk', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', 'in-stock', 50, true),
('Organic Butter', 'Creamy organic butter made from the finest cream, perfect for cooking and baking.', 6.99, 'butter', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80', 'in-stock', 30, true),
('Aged Cheddar', 'Sharp aged cheddar cheese with rich flavor, aged for 12 months.', 8.99, 'cheese', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80', 'in-stock', 25, true),
('Heavy Cream', 'Rich heavy cream perfect for whipping, cooking, and coffee.', 3.99, 'cream', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80', 'out-of-stock', 0, true),
('Chocolate Milk', 'Delicious chocolate milk made with real cocoa and our farm-fresh whole milk.', 4.50, 'milk', 'https://images.unsplash.com/photo-1481671703460-040cb8a2d909?auto=format&fit=crop&w=600&q=80', 'in-stock', 40, true),
('Greek Yogurt', 'Thick, strained Greek yogurt with high protein content and tangy flavor.', 4.99, 'yogurt', 'https://images.unsplash.com/photo-1571212515416-fca88c6c4b3c?auto=format&fit=crop&w=600&q=80', 'in-stock', 35, true),
('Cottage Cheese', 'Fresh cottage cheese with perfect texture, great for both sweet and savory dishes.', 3.99, 'cheese', 'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=600&q=80', 'in-stock', 20, true),
('Premium Ice Cream', 'Premium ice cream made with our rich cream and natural flavors. No additives.', 6.99, 'icecream', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80', 'in-stock', 15, true),
('Skim Milk', 'Fat-free milk that retains all the essential nutrients of whole milk.', 3.99, 'milk', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', 'in-stock', 45, true),
('Blue Cheese', 'Aged blue cheese with distinctive flavor and creamy texture.', 9.99, 'cheese', 'https://images.unsplash.com/photo-1452195100486-9d262538b5a9?auto=format&fit=crop&w=600&q=80', 'in-stock', 12, true);

-- Optional: Create notifications table for activity tracking
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'dismissed')),
    related_table VARCHAR(100),
    related_id INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create recent activities table
CREATE TABLE IF NOT EXISTS recent_activities (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
    icon VARCHAR(100),
    related_table VARCHAR(100),
    related_id INTEGER,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications and activities
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON recent_activities(created_at);

-- Enable RLS for notifications and activities
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications and activities
CREATE POLICY "Allow all operations for authenticated users" ON notifications
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON recent_activities
    FOR ALL USING (auth.role() = 'authenticated');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_products FROM products;
