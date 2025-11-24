import { Navbar } from '@/components/dashboard/navbar'
import { requireAuth } from '@/lib/auth/middleware'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="animate-fade-in">{children}</main>
    </div>
  )
}

