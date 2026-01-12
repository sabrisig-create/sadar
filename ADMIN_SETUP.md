# Admin Dashboard Setup

Your admin dashboard has been created at `/admin`. To access it, you need to configure the service role key and grant admin privileges.

## Step 1: Configure Service Role Key

The admin dashboard requires the Supabase service role key to bypass RLS policies and access all data.

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** > **API**
4. Copy the **service_role** key (NOT the anon key - this is a different, more powerful key)
5. Add it to your `.env` file:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

6. Restart your development server

**Important:** The service_role key bypasses all RLS policies, so keep it secure and never expose it to the client.

## Step 2: Grant Admin Access

You need to insert your user ID into the `admin_users` table. Here's how:

### Step 1: Get Your User ID

First, sign in to your application, then run this query in your Supabase SQL Editor:

```sql
-- Find your user ID by email
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email address.

### Step 2: Grant Admin Privileges

Once you have your user ID, run this query to make yourself an admin:

```sql
-- Insert into admin_users table
INSERT INTO admin_users (user_id, is_active)
VALUES ('your-user-id-here', true);
```

Replace `your-user-id-here` with the actual UUID from Step 1.

### Alternative: Grant Admin to Current User (If Already Logged In)

If you're already logged in and want to make your current session user an admin, you can use:

```sql
-- Make currently authenticated user an admin
INSERT INTO admin_users (user_id, is_active)
VALUES (auth.uid(), true);
```

**Note:** You must run this query while authenticated as the user you want to make admin.

## Step 3: Accessing the Admin Dashboard

Once you have configured the service role key:

1. Navigate to `/admin/login` in your application
2. Enter the admin credentials (default password is in the admin login page)
3. You'll be redirected to the admin dashboard
4. If the service role key is not configured, you'll see an alert message

## Admin Dashboard Features

The admin dashboard provides:

### Reflections Tab
- View all user reflections across the system
- Search by email, scene content, or therapist affect
- Click any reflection to view full details including AI responses
- See user email, creation date, and all SADAR fields

### Whitelist Tab
- View all whitelisted email addresses
- See which emails are active/inactive
- View when each email was added

### System Prompts Tab
- View all AI system prompts
- See which prompt is currently active
- Review prompt content and creation dates

## Security Notes

- Admin access bypasses Row Level Security (RLS) for viewing data
- Admins can see ALL reflections from ALL users
- Only users in the `admin_users` table with `is_active = true` can access admin features
- Admin status is checked using the `is_admin()` database function
