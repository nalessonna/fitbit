import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Header } from "@/components/Header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")

  if (!token) redirect("/")

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
