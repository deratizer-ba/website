import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderTree, Layers, FileText, BookOpen, ReceiptText } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [categories, subcategories, contentBlocks, blogPosts, priceListItems] =
    await Promise.all([
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("subcategories").select("id", { count: "exact", head: true }),
      supabase.from("content_blocks").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("price_list_items").select("id", { count: "exact", head: true }),
    ])

  const stats = [
    {
      label: "Kategórie",
      count: categories.count ?? 0,
      icon: FolderTree,
    },
    {
      label: "Podkategórie",
      count: subcategories.count ?? 0,
      icon: Layers,
    },
    {
      label: "Obsahové bloky",
      count: contentBlocks.count ?? 0,
      icon: FileText,
    },
    {
      label: "Články",
      count: blogPosts.count ?? 0,
      icon: BookOpen,
    },
    {
      label: "Riadky cenníka",
      count: priceListItems.count ?? 0,
      icon: ReceiptText,
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Prehľad</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
