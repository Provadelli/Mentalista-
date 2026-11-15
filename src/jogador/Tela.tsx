export default function Tela({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <main
      className={`fundo-couro flex min-h-dvh flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] ${className}`}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">{children}</div>
    </main>
  )
}
