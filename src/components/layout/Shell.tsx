interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative bg-[var(--bg)]">
        {children}
      </div>
    </div>
  )
}
