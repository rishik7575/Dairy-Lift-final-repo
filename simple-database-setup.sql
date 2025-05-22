-- Simple Database Setup for Dairy-Lift Farm Visit System
-- Run these SQL commands in your Supabase SQL Editor
-- URL: https://avaakcvenjjydbxopwti.supabase.co

-- Drop existing tables to start fresh
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

-- 2. Create notifications table (NO foreign key constraints)
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

-- 3. Create products table
CREATE TABLE products (
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

-- 4. Create recent_activities table
CREATE TABLE recent_activities (
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
CREATE INDEX idx_farm_visit_requests_status ON farm_visit_requests(status);
CREATE INDEX idx_farm_visit_requests_visit_date ON farm_visit_requests(visit_date);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- 6. Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for automatic timestamp updates
CREATE TRIGGER update_farm_visit_requests_updated_at
    BEFORE UPDATE ON farm_visit_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE farm_visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for public access
-- Farm visit requests policies
CREATE POLICY "Allow public to insert farm visit requests" ON farm_visit_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read farm visit requests" ON farm_visit_requests
    FOR SELECT USING (true);

CREATE POLICY "Allow public to update farm visit requests" ON farm_visit_requests
    FOR UPDATE USING (true);

-- Notifications policies
CREATE POLICY "Allow public to insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read notifications" ON notifications
    FOR SELECT USING (true);

CREATE POLICY "Allow public to update notifications" ON notifications
    FOR UPDATE USING (true);

-- Products policies
CREATE POLICY "Allow public to read products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public to insert products" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to update products" ON products
    FOR UPDATE USING (true);

-- Recent activities policies
CREATE POLICY "Allow public to read recent activities" ON recent_activities
    FOR SELECT USING (true);

CREATE POLICY "Allow public to insert recent activities" ON recent_activities
    FOR INSERT WITH CHECK (true);

-- 10. Grant necessary permissions
GRANT ALL ON farm_visit_requests TO anon, authenticated;
GRANT ALL ON notifications TO anon, authenticated;
GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON recent_activities TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Simple database setup completed successfully! Tables created without sample data.' as status;
