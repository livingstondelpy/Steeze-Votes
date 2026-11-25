/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env;
const supabaseUrl = env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () =>
  Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    /^https:\/\/[^/]+\.supabase\.co$/.test(supabaseUrl) &&
    !supabaseAnonKey.toLowerCase().includes('placeholder')
  );

// Keep app rendering possible when configuration is missing, but never pretend
// the placeholder client is a valid connection. All database actions must check
// isSupabaseConfigured() before using the client.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'missing-public-key'
);
