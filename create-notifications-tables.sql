-- Create notifications and recent activities tables for admin dashboard
-- Run this SQL in your Supabase dashboard to enable product notifications

-- Create notifications table for admin dashboard
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'dismissed', 'completed')),
    action_taken VARCHAR(100),
    completed_by VARCHAR(255),
    completed_at TIMESTAMP WITH TIME ZONE,
    related_table VARCHAR(100),
    related_id INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recent activities table for admin dashboard
CREATE TABLE IF NOT EXISTS recent_activities (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
    icon VARCHAR(100),
    related_table VARCHAR(100),
    related_id INTEGER,
    created_by VARCHAR(255) DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_type ON recent_activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON recent_activities(created_at);

-- Create update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for notifications updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for notifications and activities
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Allow read access for everyone" ON notifications;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON recent_activities;
DROP POLICY IF EXISTS "Allow read access for everyone" ON recent_activities;

-- Create policies for notifications
CREATE POLICY "Allow read access for everyone" ON notifications 
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for everyone" ON notifications 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for everyone" ON notifications 
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for everyone" ON notifications 
    FOR DELETE USING (true);

-- Create policies for recent_activities
CREATE POLICY "Allow read access for everyone" ON recent_activities 
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for everyone" ON recent_activities 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for everyone" ON recent_activities 
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for everyone" ON recent_activities 
    FOR DELETE USING (true);

-- Insert sample notification to test
INSERT INTO notifications (type, title, description, priority, status, related_table, metadata) VALUES
('product_added', 'Sample Product Added', 'This is a test notification for product management', 'medium', 'pending', 'products', '{"test": true}')
ON CONFLICT DO NOTHING;

-- Insert sample recent activity to test
INSERT INTO recent_activities (type, title, description, priority, icon, related_table, created_by) VALUES
('product_added', 'Sample Product Added', 'This is a test recent activity for product management', 'medium', 'fas fa-plus-circle', 'products', 'Admin')
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 
    'Notifications and Activities tables created successfully!' as status,
    (SELECT COUNT(*) FROM notifications) as total_notifications,
    (SELECT COUNT(*) FROM recent_activities) as total_activities;

-- Show table structures
SELECT 'NOTIFICATIONS TABLE STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

SELECT 'RECENT_ACTIVITIES TABLE STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'recent_activities' 
ORDER BY ordinal_position;
