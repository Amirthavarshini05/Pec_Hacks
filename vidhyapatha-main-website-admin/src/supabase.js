import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vyhnpfccrwnokmakayfn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5aG5wZmNjcndub2ttYWtheWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTkyOTUsImV4cCI6MjA4MTAzNTI5NX0.sivgHUJ1w4bU0dk6DprNVw-Pp9ewtjqz5xrG_oWT2mw";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
