/*
  # Add Admin Roles System

  1. New Tables
    - `admin_users` - Stores admin user IDs with role information
      - `user_id` (uuid, primary key) - references auth.users
      - `created_at` (timestamptz) - when admin status was granted
      - `created_by` (uuid) - which admin granted this status
      - `is_active` (boolean) - whether admin status is active

  2. Security
    - Enable RLS on admin_users table
    - Only admins can view admin_users table
    - Create helper function to check if user is admin

  3. Notes
    - Admins have access to all data across the system
    - First admin must be manually inserted via SQL
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE user_id = auth.uid()
    AND is_active = true
  );
$$;

-- Policy: Only admins can view admin_users
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Only admins can insert new admins
CREATE POLICY "Admins can create admin users"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy: Only admins can update admin users
CREATE POLICY "Admins can update admin users"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add admin policies for reflections (view all)
CREATE POLICY "Admins can view all reflections"
  ON reflections
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add admin policies for whitelist (full access)
CREATE POLICY "Admins can insert whitelist entries"
  ON whitelist
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update whitelist entries"
  ON whitelist
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete whitelist entries"
  ON whitelist
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add admin policies for system_prompts (full access)
CREATE POLICY "Admins can view all prompts"
  ON system_prompts
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert prompts"
  ON system_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update prompts"
  ON system_prompts
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete prompts"
  ON system_prompts
  FOR DELETE
  TO authenticated
  USING (is_admin());
