import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwpfshxgufjkuysukaju.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cGZzaHhndWZqa3V5c3VrYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzkxNzAsImV4cCI6MjA4ODcxNTE3MH0.x9fsiWNSqNIaWQrWKVCInX7AWcv9kfcVFvxrR72mWgQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
