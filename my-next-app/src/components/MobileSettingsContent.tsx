"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { api } from "@/lib/api"
import { FriendsModal }   from "./settings/FriendsModal"
import { ProfileModal }   from "./settings/ProfileModal"
import { BodyPartsModal } from "./settings/BodyPartsModal"

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function MobileSettingsContent() {
  const profile = useAppStore((s) => s.profile)
  const [showProfile,   setShowProfile]   = useState(false)
  const [showBodyParts, setShowBodyParts] = useState(false)
  const [showFriends,   setShowFriends]   = useState(false)

  const handleLogout = async () => {
    await api.delete("/sessions")
    window.location.href = "/"
  }

  const items = [
    { label: "プロフィール",   sub: profile?.name,   onClick: () => setShowProfile(true) },
    { label: "部位・種目管理", sub: "種目の追加・編集", onClick: () => setShowBodyParts(true) },
    { label: "フレンド管理",   sub: "申請・承認・削除", onClick: () => setShowFriends(true) },
  ]

  return (
    <>
      <div className="space-y-3 pt-2">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {items.map((item, idx) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={[
                "w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors",
                idx > 0 ? "border-t border-slate-50" : "",
              ].join(" ")}
            >
              <div className="text-left">
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                {item.sub && <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>}
              </div>
              <ChevronRight />
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <p className="text-sm font-medium text-red-500">ログアウト</p>
          </button>
        </div>
      </div>

      {showProfile   && <ProfileModal   onClose={() => setShowProfile(false)} />}
      {showBodyParts && <BodyPartsModal onClose={() => setShowBodyParts(false)} />}
      {showFriends   && <FriendsModal   onClose={() => setShowFriends(false)} />}
    </>
  )
}
