/*
  # Remove Whitelist Functionality

  This migration removes the whitelist system to allow all users to access the application.

  1. Changes
    - Drop the whitelist table
    - Drop any functions or triggers related to whitelist enforcement
    - Allow all authenticated users to access the system
  
  2. Security
    - RLS policies on other tables remain unchanged
    - Users still need to authenticate via Supabase Auth
    - Only authenticated users can access their own reflections
*/

-- Drop any triggers that might reference the whitelist
DROP TRIGGER IF EXISTS check_whitelist_on_signup ON auth.users;

-- Drop any functions related to whitelist checking
DROP FUNCTION IF EXISTS check_user_whitelist() CASCADE;
DROP FUNCTION IF EXISTS is_whitelisted(text) CASCADE;

-- Drop the whitelist table
DROP TABLE IF EXISTS whitelist CASCADE;
