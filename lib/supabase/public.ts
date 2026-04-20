import { createClient } from "@supabase/supabase-js"

/** Verejný klient (anon kľúč) — bez `cookies()` / `next/headers`. */
export function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      "Chýba NEXT_PUBLIC_SUPABASE_URL alebo NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
  }
  return createClient(url, key)
}
