import Image from "next/image"
import { cn } from "@/lib/utils"

type Props = {
  src: string
  width: number
  /** Len šírka; výška podľa pôvodného pomeru strán obrázka. */
  naturalHeight?: boolean
  wrapperClassName?: string
}

export function BlockMedia({
  src,
  width,
  naturalHeight = false,
  wrapperClassName,
}: Props) {
  if (naturalHeight) {
    return (
      <div className={wrapperClassName} style={{ width }}>
        <Image
          src={src}
          alt=""
          width={0}
          height={0}
          className="h-auto w-full object-contain"
          style={{ width: "100%", height: "auto" }}
          sizes={`${width}px`}
        />
      </div>
    )
  }

  return (
    <div
      className={cn("relative aspect-square", wrapperClassName)}
      style={{ width }}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-contain"
        sizes={`${width}px`}
      />
    </div>
  )
}
