import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://hlfzsrfquuokqiadmklq.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZnpzcmZxdXVva3FpYWRta2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MDY1NDIsImV4cCI6MjEwODQ4MjU0Mn0.YDda4S1K7dSR3UZ307RU4s5qdDsEqptkFkS5DydPlWk';

function resolveValidSupabaseUrl(rawInput) {
  if (typeof rawInput === 'string' && rawInput.trim().length > 0) {
    let cleaned = rawInput.trim().replace(/^['"]+|['"]+$/g, '');

    // Si se copió accidentalmente en formato Markdown [https://...](https://...)
    const markdownMatch = cleaned.match(/\((https?:\/\/[^)]+)\)/i) || cleaned.match(/(https?:\/\/[^\s[\]()]+)/i);
    if (markdownMatch?.[1]) {
      cleaned = markdownMatch[1].trim();
    }

    try {
      const parsed = new URL(cleaned);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // Continúa al log de diagnóstico y fallback seguro
    }
  }

  console.warn(
    '[Vizo Supabase] VITE_SUPABASE_URL inválida o ausente. Valor recibido:',
    JSON.stringify(rawInput),
    '-> Usando URL de respaldo segura:',
    FALLBACK_SUPABASE_URL
  );
  return FALLBACK_SUPABASE_URL;
}

function resolveValidSupabaseKey(rawInput) {
  if (typeof rawInput === 'string') {
    const cleaned = rawInput.trim().replace(/^['"]+|['"]+$/g, '');
    if (cleaned.length > 30 && cleaned !== 'undefined' && cleaned !== 'null') {
      return cleaned;
    }
  }
  return FALLBACK_SUPABASE_ANON_KEY;
}

const rawEnvUrl =
  typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
const rawEnvKey =
  typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined;

export const supabaseUrl = resolveValidSupabaseUrl(rawEnvUrl);
export const supabaseAnonKey = resolveValidSupabaseKey(rawEnvKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
