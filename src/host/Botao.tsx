export default function BotaoAvancar({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      autoFocus
      className="min-h-12 rounded-sm bg-couro px-8 py-3 font-titulo text-xl text-papel shadow-lg transition hover:bg-couro-claro focus-visible:outline-4 focus-visible:outline-ouro"
    >
      {children}
    </button>
  )
}
