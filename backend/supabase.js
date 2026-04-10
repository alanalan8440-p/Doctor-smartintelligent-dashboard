import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // OR SUPABASE_ANON_KEY depending on usage

export const supabase = createClient(supabaseUrl, supabaseKey);
