/** O sorriso pintado em vermelho. Só aparece na acusação e no veredito. */
export default function Smiley({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`text-redjohn ${className}`} aria-hidden>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5">
        <path d="M50 6 C 20 6, 6 26, 7 50 C 8 76, 26 94, 52 93 C 78 92, 94 74, 93 48 C 92 24, 74 8, 46 8" />
        <path d="M25 58 C 33 76, 66 78, 76 57" strokeWidth="6" />
      </g>
      <g fill="currentColor">
        <path d="M34 30 c 4 -1, 6 9, 2 12 c -5 2, -6 -11, -2 -12z" />
        <path d="M64 29 c 4 -1, 6 10, 2 13 c -5 2, -6 -12, -2 -13z" />
      </g>
      <path d="M78 66 l 1 14 M30 72 l -1 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
