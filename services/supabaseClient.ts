
import { createClient } from "@supabase/supabase-js";

/**
 * 💡 HELP FOR MOM:
 * 1. Go to your Supabase Dashboard.
 * 2. Click the 'Settings' gear icon (bottom left).
 * 3. Click 'API'.
 * 4. Copy 'Project URL' and paste it below.
 * 5. Copy 'anon' (public) key and paste it below.
 */

// Replace these two lines with your actual keys from Supabase:
// Exported to allow App.tsx to check configuration status safely
export const supabaseUrl = "
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gjbrjysuqdvvqlxklvos.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)"; 
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqYnJqeXN1cWR2dnFseGtsdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2OTQ3MTAsImV4cCI6MjA3NzI3MDcxMH0.YN3BuI6f39P4Vl3yF6nFlMYnbBEu47dpTwmyjDsMfKg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
