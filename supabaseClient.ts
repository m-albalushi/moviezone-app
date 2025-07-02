import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
const supabaseUrl = 'https://qyazzryjvnmxncurswmd.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YXp6cnlqdm5teG5jdXJzd21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTczNTIsImV4cCI6MjA2NTU5MzM1Mn0.T-nuFhSFzmg-Zd1WdWyZM6JZ7CwL9rPx9eGk7l4VZJk';
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);