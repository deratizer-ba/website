import Image from "next/image"

type Props = {
  title: string
  description?: string | null
  imageUrl?: string | null
}

/**
 * Hero pre stránky kategórie a podkategórie — vlastný layout (nie split ako úvodka).
 * Pozadie = rovnaký obrázok ako v náhľade, rozmazaný + polopriehľadná brand farba.
 */
export function ContentHero({ title, description, imageUrl }: Props) {
  const customSrc = imageUrl?.trim()
  const src = (customSrc || "/roach.png").trim()
  const resolvedAlt = customSrc ? "" : "Ilustrácia deratizácie"

  return (
    <section className="relative overflow-hidden border-b border-white/15">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={src}
          alt=""
          fill
          className="scale-[1.2] object-cover blur-[20px]"
          sizes="100vw"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-brand/82"
        aria-hidden
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-28 pb-10">
        <div className="relative mb-8 aspect-[2/1] w-full overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20 lg:hidden">
          <Image
            src={src}
            alt={resolvedAlt}
            fill
            className="object-contain object-center"
            priority
            sizes="(max-width: 1024px) 100vw, 640px"
          />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
          <div className="min-w-0 flex-1 border-l-4 border-white pl-5 md:pl-6">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl lg:leading-tight">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                {description}
              </p>
            ) : null}
          </div>

          <div className="relative mx-auto hidden aspect-square w-48 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-white/20 lg:mx-0 lg:block lg:w-52">
            <Image
              src={src}
              alt={resolvedAlt}
              fill
              className="object-contain object-center"
              priority
              sizes="208px"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
