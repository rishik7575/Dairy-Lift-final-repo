-- Supabase Database Setup for Dairy-Lift Farm Visit System
-- Run these SQL commands in your Supabase SQL Editor
-- URL: https://avaakcvenjjydbxopwti.supabase.co

-- First, let's drop existing tables if they have conflicting constraints
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS farm_visit_requests CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS recent_activities CASCADE;

-- 1. Create farm_visit_requests table
CREATE TABLE farm_visit_requests (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create notifications table (without foreign key constraints for flexibility)
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
    related_id BIGINT,
    related_table VARCHAR(50),
    metadata JSONB,
    action_taken VARCHAR(50),
    completed_by VARCHAR(255),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create products table (for store functionality)
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create recent_activities table (for admin dashboard)
CREATE TABLE IF NOT EXISTS recent_activities (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    completed_by VARCHAR(255),
    action_taken VARCHAR(50),
    related_id BIGINT,
    related_table VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farm_visit_requests_status ON farm_visit_requests(status);
CREATE INDEX IF NOT EXISTS idx_farm_visit_requests_visit_date ON farm_visit_requests(visit_date);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- 6. Create a function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_farm_visit_requests_updated_at ON farm_visit_requests;
CREATE TRIGGER update_farm_visit_requests_updated_at
    BEFORE UPDATE ON farm_visit_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE farm_visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for public access (adjust as needed for your security requirements)
-- Allow public to insert farm visit requests
CREATE POLICY "Allow public to insert farm visit requests" ON farm_visit_requests
    FOR INSERT WITH CHECK (true);

-- Allow public to read their own farm visit requests
CREATE POLICY "Allow public to read farm visit requests" ON farm_visit_requests
    FOR SELECT USING (true);

-- Allow public to insert notifications
CREATE POLICY "Allow public to insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Allow public to read notifications
CREATE POLICY "Allow public to read notifications" ON notifications
    FOR SELECT USING (true);

-- Allow public to update notifications (for admin actions)
CREATE POLICY "Allow public to update notifications" ON notifications
    FOR UPDATE USING (true);

-- Allow public to update farm visit requests (for admin actions)
CREATE POLICY "Allow public to update farm visit requests" ON farm_visit_requests
    FOR UPDATE USING (true);

-- Allow public to read products
CREATE POLICY "Allow public to read products" ON products
    FOR SELECT USING (true);

-- Allow public to insert products
CREATE POLICY "Allow public to insert products" ON products
    FOR INSERT WITH CHECK (true);

-- Allow public to update products
CREATE POLICY "Allow public to update products" ON products
    FOR UPDATE USING (true);

-- Allow public to read recent activities
CREATE POLICY "Allow public to read recent activities" ON recent_activities
    FOR SELECT USING (true);

-- Allow public to insert recent activities
CREATE POLICY "Allow public to insert recent activities" ON recent_activities
    FOR INSERT WITH CHECK (true);

-- 10. Insert some sample data for testing (optional)
INSERT INTO farm_visit_requests (name, email, phone, visit_date, message, status) VALUES
('John Smith', 'john.smith@example.com', '+1-555-0123', '2024-02-15 10:00:00+00', 'Interested in learning about sustainable farming practices', 'pending'),
('Sarah Johnson', 'sarah.j@example.com', '+1-555-0456', '2024-02-20 14:00:00+00', 'Would like to see the milking process and cattle care', 'pending'),
('Mike Wilson', 'mike.wilson@example.com', NULL, '2024-02-18 09:00:00+00', 'Potential investor looking to understand operations', 'accepted')
ON CONFLICT DO NOTHING;

-- Insert corresponding notifications
INSERT INTO notifications (type, title, description, priority, status, related_id) VALUES
('farm_visit_request', 'New Farm Visit Request', 'John Smith has requested a farm visit on February 15, 2024', 'high', 'pending', 1),
('farm_visit_request', 'New Farm Visit Request', 'Sarah Johnson has requested a farm visit on February 20, 2024', 'high', 'pending', 2),
('farm_visit_request', 'Farm Visit Request Accepted', 'Mike Wilson farm visit request has been accepted', 'medium', 'completed', 3)
ON CONFLICT DO NOTHING;

-- Insert some sample products
INSERT INTO products (name, description, price, category, stock_quantity) VALUES
('Fresh Milk (1L)', 'Premium quality fresh milk from grass-fed cows', 3.50, 'Dairy', 100),
('Organic Cheese (500g)', 'Artisanal organic cheese made from our farm milk', 12.99, 'Dairy', 50),
('Farm Butter (250g)', 'Creamy butter churned from fresh cream', 8.75, 'Dairy', 75),
('Yogurt (500ml)', 'Probiotic-rich yogurt made from organic milk', 5.25, 'Dairy', 80)
ON CONFLICT DO NOTHING;

-- 11. Grant necessary permissions
GRANT ALL ON farm_visit_requests TO anon, authenticated;
GRANT ALL ON notifications TO anon, authenticated;
GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON recent_activities TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 12. Create a view for easier querying (optional)
CREATE OR REPLACE VIEW farm_visit_dashboard AS
SELECT
    n.id as notification_id,
    n.type,
    n.title,
    n.description,
    n.priority,
    n.status as notification_status,
    n.action_taken,
    n.completed_by,
    n.completed_at,
    n.created_at as notification_created_at,
    fvr.id as request_id,
    fvr.name,
    fvr.email,
    fvr.phone,
    fvr.visit_date,
    fvr.message,
    fvr.status as request_status,
    fvr.created_at as request_created_at,
    fvr.updated_at as request_updated_at
FROM notifications n
LEFT JOIN farm_visit_requests fvr ON n.related_id = fvr.id
WHERE n.type = 'farm_visit_request'
ORDER BY n.created_at DESC;

-- Grant access to the view
GRANT SELECT ON farm_visit_dashboard TO anon, authenticated;

-- Success message
SELECT 'Database setup completed successfully! You can now use the farm visit system.' as status;
