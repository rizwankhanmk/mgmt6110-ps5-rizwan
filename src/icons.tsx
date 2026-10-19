// Small inline icons drawn in the style of SF Symbols: round caps, 1.8px strokes at 24px,
// coloured with currentColor so they take the colour of the text around them.

type IconProps = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false,
} as const

/** checkmark.circle.fill */
export function CheckCircle({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M7.5 12.3l3 3 6-6.3"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** arrow.left.arrow.right */
export function Swap({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M4 8.5h15M15.5 5l3.5 3.5-3.5 3.5M20 15.5H5M8.5 12L5 15.5 8.5 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** person.fill — the pink quadrants, where a person leads */
export function Person({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="7.5" r="4" fill="currentColor" />
      <path d="M4 20.5c0-4.2 3.6-7 8-7s8 2.8 8 7c0 .3-.2.5-.5.5h-15a.5.5 0 0 1-.5-.5z" fill="currentColor" />
    </svg>
  )
}

/** sparkles — the blue quadrants, where AI does the work */
export function Sparkles({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10 2.5l1.9 5.6 5.6 1.9-5.6 1.9L10 17.5l-1.9-5.6L2.5 10l5.6-1.9z" fill="currentColor" />
      <path d="M18.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" fill="currentColor" />
    </svg>
  )
}

export const TONE_ICON = { pink: Person, blue: Sparkles } as const
