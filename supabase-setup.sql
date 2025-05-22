-- Supabase Database Setup for Dairy-Lift Farm Visit System
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create farm_visit_requests table
CREATE TABLE IF NOT EXISTS farm_visit_requests (
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

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'farm_visit_request',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    action_taken VARCHAR(20) CHECK (action_taken IN ('accepted', 'rejected')),
    completed_by VARCHAR(255),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    related_id BIGINT REFERENCES farm_visit_requests(id) ON DELETE CASCADE
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farm_visit_requests_status ON farm_visit_requests(status);
CREATE INDEX IF NOT EXISTS idx_farm_visit_requests_created_at ON farm_visit_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_completed_at ON notifications(completed_at DESC);

-- 4. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create trigger to automatically update updated_at on farm_visit_requests
CREATE TRIGGER update_farm_visit_requests_updated_at
    BEFORE UPDATE ON farm_visit_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security (RLS) for security
ALTER TABLE farm_visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for public access (adjust as needed for your security requirements)
-- Allow anyone to insert farm visit requests (for the public form)
CREATE POLICY "Allow public insert on farm_visit_requests" ON farm_visit_requests
    FOR INSERT WITH CHECK (true);

-- Allow anyone to insert notifications (for the public form)
CREATE POLICY "Allow public insert on notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Allow reading all records (for admin dashboard)
-- Note: In production, you should restrict this to authenticated admin users
CREATE POLICY "Allow read access to farm_visit_requests" ON farm_visit_requests
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to notifications" ON notifications
    FOR SELECT USING (true);

-- Allow updating records (for admin dashboard)
-- Note: In production, you should restrict this to authenticated admin users
CREATE POLICY "Allow update access to farm_visit_requests" ON farm_visit_requests
    FOR UPDATE USING (true);

CREATE POLICY "Allow update access to notifications" ON notifications
    FOR UPDATE USING (true);

-- 8. Insert some sample data for testing (optional)
INSERT INTO farm_visit_requests (name, email, phone, visit_date, message, status) VALUES
('John Smith', 'john.smith@example.com', '+1-555-0123', '2024-02-15 10:00:00+00', 'Interested in learning about sustainable farming practices', 'pending'),
('Sarah Johnson', 'sarah.j@example.com', '+1-555-0456', '2024-02-20 14:00:00+00', 'Would like to see the milking process and cattle care', 'pending'),
('Mike Wilson', 'mike.wilson@example.com', NULL, '2024-02-18 09:00:00+00', 'Potential investor looking to understand operations', 'accepted');

-- 9. Insert corresponding notifications
INSERT INTO notifications (type, title, description, priority, status, related_id) VALUES
('farm_visit_request', 'New Farm Visit Request', 'John Smith has requested a farm visit on February 15, 2024', 'high', 'pending', 1),
('farm_visit_request', 'New Farm Visit Request', 'Sarah Johnson has requested a farm visit on February 20, 2024', 'high', 'pending', 2),
('farm_visit_request', 'Farm Visit Request Processed', 'Mike Wilson farm visit request has been accepted', 'medium', 'completed', 3);

-- Update the completed notification
UPDATE notifications
SET action_taken = 'accepted', completed_by = 'Admin', completed_at = NOW()
WHERE related_id = 3;

-- 10. Create a view for easier querying (optional)
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

-- 11. Create products table for comprehensive product management
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'in-stock' CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock', 'inactive')),
    discount DECIMAL(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create product_categories table for category management
CREATE TABLE IF NOT EXISTS product_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Create recent_activities table for activity tracking
CREATE TABLE IF NOT EXISTS recent_activities (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    icon VARCHAR(100),
    related_table VARCHAR(50),
    related_id BIGINT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Create indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);

-- 15. Create indexes for recent_activities table
CREATE INDEX IF NOT EXISTS idx_recent_activities_type ON recent_activities(type);
CREATE INDEX IF NOT EXISTS idx_recent_activities_created_at ON recent_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recent_activities_related ON recent_activities(related_table, related_id);

-- 16. Create trigger to automatically update updated_at on products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 17. Enable Row Level Security for new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;

-- 18. Create policies for products table
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (active = true);

CREATE POLICY "Allow public insert on products" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on products" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on products" ON products
    FOR DELETE USING (true);

-- 19. Create policies for product_categories table
CREATE POLICY "Allow public read access to product_categories" ON product_categories
    FOR SELECT USING (active = true);

CREATE POLICY "Allow public insert on product_categories" ON product_categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on product_categories" ON product_categories
    FOR UPDATE USING (true);

-- 20. Create policies for recent_activities table
CREATE POLICY "Allow public read access to recent_activities" ON recent_activities
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on recent_activities" ON recent_activities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on recent_activities" ON recent_activities
    FOR UPDATE USING (true);

-- 21. Insert default product categories
INSERT INTO product_categories (name, description) VALUES
('milk', 'Fresh milk and milk-based products'),
('ghee', 'Pure ghee and clarified butter products'),
('yogurt', 'Yogurt and fermented dairy products'),
('paneer', 'Fresh paneer and cottage cheese'),
('butter', 'Fresh butter and spreads'),
('cheese', 'Artisan cheese varieties'),
('other', 'Other dairy and farm products');

-- 22. Update notifications table to support product notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_table VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update the constraint to include product-related types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('farm_visit_request', 'product_added', 'product_updated', 'product_deleted', 'product_low_stock', 'general'));

-- 23. Insert sample products for testing
INSERT INTO products (name, description, price, stock, category, status, active) VALUES
('Fresh Milk (500ml)', 'Nutrient-rich whole milk straight from our dairy farm. Pasteurized and non-homogenized.', 45.00, 120, 'milk', 'in-stock', true),
('Premium Ghee (200g)', 'Pure ghee made from fresh cream using traditional methods.', 180.00, 50, 'ghee', 'in-stock', true),
('Yogurt (400g)', 'Creamy yogurt made from fresh milk with live cultures.', 60.00, 85, 'yogurt', 'in-stock', true),
('Paneer (250g)', 'Fresh paneer made daily from pure milk.', 120.00, 5, 'paneer', 'low-stock', true),
('Artisan Cheese (200g)', 'Handcrafted aged cheese made using traditional methods.', 250.00, 25, 'cheese', 'in-stock', true);

COMMENT ON TABLE farm_visit_requests IS 'Stores farm visit requests from customers';
COMMENT ON TABLE notifications IS 'Stores notifications for admin dashboard';
COMMENT ON TABLE products IS 'Stores all dairy products available in the store';
COMMENT ON TABLE product_categories IS 'Stores product categories for organization';
COMMENT ON TABLE recent_activities IS 'Stores recent activities for dashboard display';
COMMENT ON VIEW farm_visit_dashboard IS 'Combined view of farm visit requests and notifications for dashboard';
