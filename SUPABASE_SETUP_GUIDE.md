# Supabase Setup Guide for Dairy-Lift Farm Visit System

This guide will help you set up Supabase database integration for the farm visit functionality.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Basic understanding of SQL and database concepts

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com and sign in to your account
2. Click "New Project"
3. Choose your organization
4. Fill in the project details:
   - **Name**: `dairy-lift-farm-visits` (or any name you prefer)
   - **Database Password**: Create a strong password and save it securely
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Set Up the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor** tab
2. Copy the entire content from `supabase-setup.sql` file
3. Paste it into the SQL Editor
4. Click "Run" to execute the SQL commands
5. Verify that the tables were created by going to the **Table Editor** tab

You should see two new tables:
- `farm_visit_requests`
- `notifications`

## Step 3: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## Step 4: Configure Your Application

### For the React Form (Farm Visit Scheduler)

1. Open `FOR-INVESTORS/farm-vista-scheduler-flow/src/lib/supabase.ts`
2. Replace the placeholder values:
   ```typescript
   const supabaseUrl = 'https://your-project-id.supabase.co'  // Your Project URL
   const supabaseAnonKey = 'your-anon-key'  // Your anon public key
   ```

### For the Admin Dashboard

1. Open `js/supabase-admin.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';  // Your Project URL
   const SUPABASE_ANON_KEY = 'your-anon-key';  // Your anon public key
   ```

## Step 5: Install Dependencies

Navigate to the farm visit scheduler directory and install the Supabase dependency:

```bash
cd FOR-INVESTORS/farm-vista-scheduler-flow
npm install @supabase/supabase-js
```

## Step 6: Build and Test

1. Build the React application:
   ```bash
   cd FOR-INVESTORS/farm-vista-scheduler-flow
   npm run build
   ```

2. Test the farm visit form:
   - Open `FOR-INVESTORS/visit-farm.html` in your browser
   - Fill out and submit the form
   - Check your Supabase dashboard to see if the data was inserted

3. Test the admin dashboard:
   - Open `admin-dashboard.html` in your browser
   - Check if pending requests appear in the "Pending Actions" section
   - Try accepting or rejecting a request
   - Verify that it moves to "Recent Activities"

## Step 7: Security Considerations (Important!)

The current setup allows public access for demonstration purposes. For production use:

1. **Enable Authentication**: Set up Supabase Auth to require login
2. **Update RLS Policies**: Restrict database access to authenticated admin users
3. **Environment Variables**: Store API keys in environment variables, not in code
4. **HTTPS**: Ensure your application is served over HTTPS

### Example Production RLS Policies

Replace the public policies with these more secure ones:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert on farm_visit_requests" ON farm_visit_requests;
DROP POLICY IF EXISTS "Allow public insert on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow read access to farm_visit_requests" ON farm_visit_requests;
DROP POLICY IF EXISTS "Allow read access to notifications" ON notifications;
DROP POLICY IF EXISTS "Allow update access to farm_visit_requests" ON farm_visit_requests;
DROP POLICY IF EXISTS "Allow update access to notifications" ON notifications;

-- Create secure policies
CREATE POLICY "Allow public insert on farm_visit_requests" ON farm_visit_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read access" ON farm_visit_requests
    FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin read access" ON notifications
    FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin update access" ON farm_visit_requests
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin update access" ON notifications
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your domain is added to the allowed origins in Supabase settings
2. **RLS Errors**: Check that Row Level Security policies are correctly configured
3. **Connection Errors**: Verify that your Project URL and API key are correct
4. **Build Errors**: Ensure all dependencies are installed with `npm install`

### Checking Data

You can verify that data is being stored correctly by:
1. Going to Supabase Dashboard > Table Editor
2. Viewing the `farm_visit_requests` and `notifications` tables
3. Checking that new records appear when forms are submitted

### Logs and Debugging

- Check browser console for JavaScript errors
- Use Supabase Dashboard > Logs to see database queries
- Enable debug mode in your application for more detailed logging

## Features Included

✅ **Farm Visit Request Form**: Customers can submit visit requests
✅ **Admin Dashboard Integration**: Requests appear in "Pending Actions"
✅ **Accept/Reject Functionality**: Admin can approve or deny requests
✅ **Recent Activities**: Completed actions show in "Recent Activities"
✅ **Real-time Updates**: Dashboard refreshes every 30 seconds
✅ **Data Persistence**: All data is stored in Supabase and persists across page refreshes
✅ **Error Handling**: Graceful fallback to sample data if database is unavailable

## Next Steps

1. Set up email notifications for customers when requests are accepted/rejected
2. Add more detailed farm visit scheduling (time slots, capacity limits)
3. Implement user authentication for the admin dashboard
4. Add reporting and analytics features
5. Set up automated backups for your Supabase database

## Support

If you encounter any issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the browser console for error messages
3. Verify your database schema matches the provided SQL script
4. Ensure your API credentials are correctly configured
