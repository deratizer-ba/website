import { ContactForm } from "@/components/public/contact-form"
import type { Category, Subcategory } from "@/lib/types"

type Props = {
  categories: (Category & { subcategories: Subcategory[] })[]
}

export function ContactPageForm({ categories }: Props) {
  return (
    <ContactForm
      categories={categories}
      source="contact_page"
      cardClassName="py-36"
    />
  )
}
