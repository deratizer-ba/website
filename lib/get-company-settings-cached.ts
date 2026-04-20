import { unstable_cache } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import {
  COMPANY_SITE_SETTING_KEYS,
  mapRowsToCompanyInfo,
  type CompanyPublicInfo,
} from "@/lib/company-site-settings"

export const getCompanyPublicInfoCached = unstable_cache(
  async (): Promise<CompanyPublicInfo> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [...COMPANY_SITE_SETTING_KEYS])

    return mapRowsToCompanyInfo(data ?? [])
  },
  ["company-public-info"],
  { tags: ["site-settings"] }
)
