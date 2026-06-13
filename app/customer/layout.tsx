export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen customer-bg flex items-start justify-center">
      {/* Phone frame on large screens, full width on mobile */}
      <div className="w-full max-w-sm min-h-screen relative">
        {children}
      </div>
    </div>
  )
}
