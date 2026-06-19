import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lifefiwfpfdwcejduzjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZmVmaXdmcGZkd2NlamR1empuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NTQwMjQsImV4cCI6MjA5NzQzMDAyNH0.FyhFXSwVfZpjE71r0lTZ3A0NxV4CxmKBo6JwvWlhwec';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
