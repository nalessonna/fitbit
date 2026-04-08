"use client"

import { useState, useRef, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { api } from "@/lib/api"
import { FriendsModal } from "./FriendsModal"
import { ProfileModal } from "./ProfileModal"
import { BodyPartsModal } from "./BodyPartsModal"

export function SettingsMenu() {
  const profile = useAppStore((s) => s.profile)
  const [open, setOpen]                   = useState(false)
  const [showFriends, setShowFriends]     = useState(false)
  const [showProfile, setShowProfile]     = useState(false)
  const [showBodyParts, setShowBodyParts] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = async () => {
    await api.delete("/sessions")
    window.location.href = "/"
  }

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span className="text-sm font-medium text-slate-700">設定</span>
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-40">
            <button
              onClick={() => { setShowProfile(true); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              プロフィール
            </button>
            <button
              onClick={() => { setShowBodyParts(true); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              部位・種目管理
            </button>
            <button
              onClick={() => { setShowFriends(true); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              フレンド管理
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-slate-50 transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>

      {showFriends    && <FriendsModal   onClose={() => setShowFriends(false)} />}
      {showProfile    && <ProfileModal   onClose={() => setShowProfile(false)} />}
      {showBodyParts  && <BodyPartsModal onClose={() => setShowBodyParts(false)} />}
    </>
  )
}
