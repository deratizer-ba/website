import { unstable_cache } from "next/cache"
import { createClient } from "@supabase/supabase-js"

const HOMEPAGE_SETTING_KEYS = [
  "homepage_h1",
  "homepage_description",
  "homepage_cover_image",
] as const

export type HomepageSettings = {
  h1: string
  description: string
  coverImage: string
}

export const DEFAULT_HOMEPAGE_H1 =
  "Profesionálne DDD služby pre váš domov aj firmu"

export const DEFAULT_HOMEPAGE_DESCRIPTION =
  "Spoľahlivé služby deratizácie, dezinfekcie a dezinsekcie pre váš domov aj firmu."

export const getHomepageSettingsCached = unstable_cache(
  async (): Promise<HomepageSettings> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [...HOMEPAGE_SETTING_KEYS])

    const getValue = (key: (typeof HOMEPAGE_SETTING_KEYS)[number]) =>
      data?.find((row) => row.key === key)?.value?.trim() ?? ""

    return {
      h1: getValue("homepage_h1"),
      description: getValue("homepage_description"),
      coverImage: getValue("homepage_cover_image"),
    }
  },
  ["homepage-settings"],
  { tags: ["site-settings"] }
)
