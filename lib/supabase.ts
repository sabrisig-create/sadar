import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uhvxvdrqehemahzegvyy.supabase.co';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodnh2ZHJxZWhlbWFoemVndnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMDk2NjAsImV4cCI6MjA4MTg4NTY2MH0.tlX5dXYOT0p-Q3ts_USQkuuybcS6HCDOVkqGlbo_dss';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export type Reflection = {
  id: string;
  user_id: string;
  scene: string;
  therapist_affect: string;
  initial_hypothesis: string;
  ai_response: string | null;
  de_id_confirmed: boolean;
  created_at: string;
  updated_at: string;
};

export type SystemPrompt = {
  id: string;
  name: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
