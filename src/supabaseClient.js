import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hlfzsrfquuokqiadmklq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZnpzcmZxdXVva3FpYWRta2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MDY1NDIsImV4cCI6MjEwODQ4MjU0Mn0.YDda4S1K7dSR3UZ307RU4s5qdDsEqptkFkS5DydPlWk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);