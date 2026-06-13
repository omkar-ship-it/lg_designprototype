import { Sidebar } from '@/components/vendor/sidebar'

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden vendor-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
