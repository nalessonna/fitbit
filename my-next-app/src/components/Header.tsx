"use client"

import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useFriends } from "@/lib/hooks/useFriends"
import { useProfile } from "@/lib/hooks/useProfile"
import { SettingsMenu } from "./settings/SettingsMenu"
import { SelectSheet } from "@/components/ui/SelectSheet"

export function Header() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const currentView  = searchParams.get("view") ?? ""

  const { data: profile }  = useProfile()
  const { data: friends = [] } = useFriends()

  const handleViewChange = (accountId: string) => {
    if (accountId) router.push(`/dashboard?view=${accountId}`)
    else router.push("/dashboard")
  }

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-4 sticky top-0 z-20">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="font-bold text-slate-900 text-base">FitLog</span>
      </Link>

      {/* フレンド切り替えセレクト */}
      <SelectSheet
        value={currentView}
        onChange={handleViewChange}
        options={[
          { value: "", label: profile?.name ?? "自分" },
          ...friends.map((f) => ({ value: f.account_id, label: f.name })),
        ]}
      />

      {/* デスクトップのみ設定メニューを表示 */}
      <div className="ml-auto hidden lg:block">
        <SettingsMenu />
      </div>
    </header>
  )
}
