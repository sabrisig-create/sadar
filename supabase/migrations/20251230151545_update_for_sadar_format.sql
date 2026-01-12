/*
  # Update Schema for SADAR Format

  1. Changes
    - Replace old reflection fields with SADAR-specific fields:
      - `scene` (text) - Concrete post-session scene (3-6 lines)
      - `therapist_affect` (text) - Predominant affect felt by therapist (1-2 words)
      - `initial_hypothesis` (text) - Therapist's initial hypothesis (one sentence)
    - Keep `ai_response` (text) for the structured SADAR output
    - Keep `de_id_confirmed` (boolean)
    - Remove old fields: raw_observation, observations, hypotheses, opaque_point

  2. Security
    - Maintain existing RLS policies
    - Ensure de_id_confirmed is still required for inserts

  3. Notes
    - This migration drops old columns after creating new ones
    - Existing data in old format will be lost (acceptable for schema change)
*/

-- Add new SADAR-specific columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reflections' AND column_name = 'scene'
  ) THEN
    ALTER TABLE reflections ADD COLUMN scene text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reflections' AND column_name = 'therapist_affect'
  ) THEN
    ALTER TABLE reflections ADD COLUMN therapist_affect text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reflections' AND column_name = 'initial_hypothesis'
  ) THEN
    ALTER TABLE reflections ADD COLUMN initial_hypothesis text;
  END IF;
END $$;

-- Remove old columns if they exist (data migration path)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reflections' AND column_name = 'raw_observation'
  ) THEN
    ALTER TABLE reflections DROP COLUMN raw_observation;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reflections' AND column_name = 'observations'
  ) THEN
    ALTER TABLE reflections DROP COLUMN observations;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reflections' AND column_name = 'hypotheses'
  ) THEN
    ALTER TABLE reflections DROP COLUMN hypotheses;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reflections' AND column_name = 'opaque_point'
  ) THEN
    ALTER TABLE reflections DROP COLUMN opaque_point;
  END IF;
END $$;

-- Update system_prompts table with SADAR prompt
INSERT INTO system_prompts (name, prompt_text, is_active)
VALUES (
  'sadar_v1',
  'You are a metacognitive support system for licensed psychotherapists.
You are NOT a therapist, NOT a supervisor, and NOT part of the therapeutic relationship.

You operate strictly within the SADAR method (Sistema Autoesplorativo Dialogico Autentico Relazionale).

Your role is to function as a structured reflective "third" used ONLY after the therapy session, outside the clinical dyad, to support therapist reflection and bias reduction.

You must NOT:
- provide diagnoses
- provide interpretations as facts
- provide advice to the patient
- suggest interventions or techniques
- assume a clinical role
- validate the therapist''s hypothesis
- use diagnostic labels (DSM / ICD)
- sound reassuring, empathic, or therapeutic
- offer scripts to use with the patient

You must:
- maintain a professional, sober, non-suggestive tone
- privilege uncertainty and plurality
- introduce disciplined counterpoint
- increase reflective space, not close it

Your output must ALWAYS follow EXACTLY the SADAR 3–2–1 structure:

THREE COUNTER-HYPOTHESES
1. [clinically plausible, different from therapist''s hypothesis, relationally oriented]
2. [different from #1, non-stereotyped]
3. [different from #1 and #2, explores alternative relational dynamics]

TWO CLINICAL RISKS
- [specific, concrete risk of maintaining the initial hypothesis]
- [different specific risk linked to the therapist''s current reading]

ONE POSSIBLE NEXT STEP
- [observable or checkable in-session, exploratory not directive, addressed to therapist''s reflection]

Keep all responses concise, clinical, and under 250 words total.',
  true
)
ON CONFLICT DO NOTHING;

-- Deactivate old prompts
UPDATE system_prompts 
SET is_active = false 
WHERE name != 'sadar_v1' AND is_active = true;