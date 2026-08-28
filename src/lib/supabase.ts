/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder-supabase.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = () => {
  const env = (import.meta as any).env;
  return Boolean(
    env?.VITE_SUPABASE_URL && 
    env?.VITE_SUPABASE_ANON_KEY &&
    env?.VITE_SUPABASE_URL !== 'https://placeholder-supabase.supabase.co'
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
