/*
  # SADAR Database Schema

  1. New Tables
    - `whitelist`
      - `id` (uuid, primary key)
      - `email` (text, unique) - allowed email addresses
      - `created_at` (timestamptz)
      - `created_by` (uuid) - admin who added the email
      - `is_active` (boolean) - whether the whitelist entry is active
    
    - `reflections`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references auth.users
      - `raw_observation` (text) - free text observation
      - `observations` (text[]) - 3 facts/sensory details
      - `hypotheses` (text[]) - 2 alternative readings
      - `opaque_point` (text) - mandatory blind spot field
      - `ai_response` (text) - the reflection report from AI
      - `de_id_confirmed` (boolean) - user confirmed no PII
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `system_prompts`
      - `id` (uuid, primary key)
      - `name` (text) - identifier for the prompt
      - `prompt_text` (text) - the actual system prompt
      - `is_active` (boolean) - only one should be active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid) - admin who created it

  2. Security
    - Enable RLS on all tables
    - Users can only access their own reflections
    - Whitelist is read-only for authenticated users (to check access)
    - System prompts readable by authenticated users (for AI calls)
    
  3. Important Notes
    - NO patient name/ID columns exist (GDPR compliance)
    - Reflections are strictly tied to authenticated users
    - De-ID confirmation is required before saving
*/

-- Create whitelist table for invite-only access
CREATE TABLE IF NOT EXISTS whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true
);

ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can check whitelist"
  ON whitelist
  FOR SELECT
  TO authenticated
  USING (true);

-- Create reflections table for storing user entries
CREATE TABLE IF NOT EXISTS reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_observation text NOT NULL,
  observations text[] NOT NULL DEFAULT '{}',
  hypotheses text[] NOT NULL DEFAULT '{}',
  opaque_point text NOT NULL,
  ai_response text,
  de_id_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
  ON reflections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON reflections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND de_id_confirmed = true);

CREATE POLICY "Users can update own reflections"
  ON reflections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
  ON reflections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create system_prompts table for AI prompt management
CREATE TABLE IF NOT EXISTS system_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prompt_text text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active prompts"
  ON system_prompts
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON reflections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whitelist_email ON whitelist(email);
CREATE INDEX IF NOT EXISTS idx_system_prompts_active ON system_prompts(is_active) WHERE is_active = true;

-- Insert default system prompt for the Reflexive Third
INSERT INTO system_prompts (name, prompt_text, is_active) VALUES (
  'reflexive_third_v1',
  'You are a Reflexive Third - a neutral cognitive mirror for psychotherapists engaged in post-session reflection. Your role is strictly defined:

WHAT YOU DO:
- Offer counter-hypotheses and alternative angles the therapist may not have considered
- Highlight potential blind spots based on what was NOT mentioned
- Ask clarifying questions that promote deeper self-reflection
- Identify patterns or contradictions in the observations provided

WHAT YOU MUST NEVER DO:
- Act as a therapist or provide therapy
- Offer reassurance, validation, or emotional support
- Diagnose or interpret patient behavior
- Make definitive statements about what happened in the session
- Engage in continuous dialogue (this is a one-shot reflection)

FORMAT YOUR RESPONSE AS:
1. **Counter-Angle**: An alternative reading of the situation the therapist may not have considered
2. **Unspoken Element**: What might be absent or avoided in the reflection
3. **Tension Point**: A potential contradiction or complexity worth examining
4. **Reflexive Question**: One question for the therapist to sit with (not to answer now)

Keep your response focused, clinical, and under 300 words. You are a mirror, not a guide.',
  true
);
