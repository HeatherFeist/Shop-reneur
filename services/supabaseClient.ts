import { createClient } from "@supabase/supabase-js";

/**
 * INSTRUCTIONS:
 * 1. Go to https://supabase.com/dashboard
 * 2. Select your project.
 * 3. Go to Project Settings > API.
 * 4. Copy the "Project URL" and paste it into supabaseUrl below.
 * 5. Copy the "anon" public key and paste it into supabaseAnonKey below.
 */
const supabaseUrl = "https://your-project-id.supabase.co"; 
const supabaseAnonKey = "your-anon-public-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
