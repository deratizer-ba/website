import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ReusableSectionEditor } from "@/components/admin/content-structure/reusable-section-editor"
import { Button } from "@/components/ui/button"

type Props = {
  params: Promise<{ sectionId: string }>
}

export default async function AdminReusableSectionDetailPage({ params }: Props) {
  const { sectionId } = await params
  const supabase = await createClient()
  const { data: section } = await supabase
    .from("reusable_sections")
    .select("*")
    .eq("id", sectionId)
    .maybeSingle()

  if (!section) notFound()

  return (
    <div className="space-y-4">
      <Link href="/admin/content/globalne-bloky">
        <Button variant="ghost" size="sm" className="-ml-2">
          Späť na globálne bloky
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{section.name}</h1>
        {section.description ? (
          <p className="text-muted-foreground mt-1">{section.description}</p>
        ) : null}
      </div>
      <ReusableSectionEditor sectionId={sectionId} />
    </div>
  )
}
