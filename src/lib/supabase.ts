
// @ts-ignore
const { createClient, SupabaseClient } = supabase;

const supabaseUrl = 'https://znukulorrqojsmqzkcou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWt1bG9ycnFvanNtcXprY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDg5MDcsImV4cCI6MjA3OTEyNDkwN30.yx5skuW9zka-ZYKLyYsEOZVVZ9VVEbE6ZUlssdwkI24';

export const supabaseClient: InstanceType<typeof SupabaseClient> = createClient(supabaseUrl, supabaseKey);
