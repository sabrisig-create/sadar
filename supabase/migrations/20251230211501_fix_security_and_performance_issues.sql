/*
  # Security and Performance Improvements

  1. Indexes
    - Add index on `system_prompts.created_by` for foreign key performance
    - Add index on `whitelist.created_by` for foreign key performance

  2. RLS Policy Optimization
    - Update all RLS policies on `reflections` table to use `(select auth.uid())`
      instead of `auth.uid()` for better query performance at scale
    - This prevents re-evaluation of auth functions for each row

  3. Policies Updated
    - `Users can view own reflections` - SELECT policy
    - `Users can insert own reflections` - INSERT policy  
    - `Users can update own reflections` - UPDATE policy
    - `Users can delete own reflections` - DELETE policy
*/

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_system_prompts_created_by ON system_prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_whitelist_created_by ON whitelist(created_by);

-- Drop existing policies on reflections
DROP POLICY IF EXISTS "Users can view own reflections" ON reflections;
DROP POLICY IF EXISTS "Users can insert own reflections" ON reflections;
DROP POLICY IF EXISTS "Users can update own reflections" ON reflections;
DROP POLICY IF EXISTS "Users can delete own reflections" ON reflections;

-- Recreate policies with optimized auth.uid() calls using subquery pattern
CREATE POLICY "Users can view own reflections"
  ON reflections
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own reflections"
  ON reflections
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.uid()) = user_id) AND (de_id_confirmed = true));

CREATE POLICY "Users can update own reflections"
  ON reflections
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reflections"
  ON reflections
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);
