import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** Ak je logo súčasťou odkazu s textom, nechaj true (skryté pred čítačkami). */
  decorative?: boolean
}

/**
 * Značkové logo (limetka / emblem) — SVG z dizajnu.
 */
export function SiteEmblem({ className, decorative = true }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={cn("shrink-0", className)}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
    >
      {!decorative ? <title>Deratizéri</title> : null}
      <style type="text/css">{`
        .site-emblem-st0 {
          fill: var(--brand);
          stroke: var(--brand);
          stroke-width: 20;
          stroke-miterlimit: 10;
        }
        .site-emblem-st1 {
          fill: var(--brand);
        }
      `}</style>
      <circle className="site-emblem-st0" cx="257.14" cy="317.14" r="182.86" />
      <ellipse cx="267.41" cy="397.48" rx="60.14" ry="51.46" />
      <circle cx="282.97" cy="275.7" r="69.16" />
      <path d="M274.28,108.13c29.03,39.7,20.38,95.42-19.32,124.45s-130.34,40.04-159.37,0.34s14.54-115.08,54.24-144.12 S245.25,68.43,274.28,108.13z" />
      <path
        className="site-emblem-st1"
        d="M238.14,117.65l-8.31,46.31c-0.38-0.07,0,0,0,0c-91.43,21.37-111.62,7.12-134.18-3.56l-1.48-13.13l-2.09-29.62 l0,0C134.83,140.21,210.83,137.84,238.14,117.65"
      />
      <path d="M166.18,90.05l-5.97,1.88l-21.4-67.81c-0.57-1.82,1.43-1.25-0.41-0.29L104.82,45.2c-1.34,0.79-2.86,1.21-4.42,1.21h0 c-1.39,0-2.64-0.82-3.22-2.08c-1.55-3.39-3.88-7.52-0.9-9.03l36.8-18.62c4.47-2.26,9.84-0.32,11.21,4.05L166.18,90.05z" />
      <path d="M206.51,83.5l-6.22-0.7l7.96-70.65c0.21-1.9,1.82-0.56-0.26-0.43l-39.35,5.89c-1.54,0.18-3.11-0.06-4.53-0.69v0 c-1.27-0.56-2.08-1.82-2.09-3.21c-0.04-3.73-0.49-8.45,2.84-8.61l41.19-2.08c5-0.25,9.12,3.7,8.61,8.25L206.51,83.5z" />
      <path d="M257.33,298.33l-44.55,6.99c-17.2,2.7-30.9,12.97-38.32,28.72l-19.22,40.8l0,0l5.85-51.53 c2.85-25.14,19.24-42.51,42.6-45.16l35.5-4.03L257.33,298.33z" />
      <path d="M299.66,277.42l48.39,10.27c18.68,3.96,33.82,15.69,42.32,32.78l22.04,44.28l0,0l-7.91-54.74 c-3.86-26.7-22.11-46.09-47.45-50.41l-38.51-6.56L299.66,277.42z" />
    </svg>
  )
}
