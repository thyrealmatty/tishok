import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// null means Supabase is not configured, so the app runs in labelled prototype mode.
export const supabase = url && key ? createClient(url, key) : null;
