import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gzwvdepfhnoyntovrgnq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_6LyqEcSRRorgqm70_8KfcQ_QY-ZOEr8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
