"use client"

import { useState } from "react"
import {
  useFriends,
  useFriendRequests,
  useSentFriendRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeleteFriendship,
} from "@/lib/hooks/useFriends"

interface Props {
  onClose: () => void
}

export function FriendsModal({ onClose }: Props) {
  const [tab, setTab]           = useState<"friends" | "requests" | "add">("friends")
  const [accountIdInput, setAccountIdInput] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const { data: friends       = [] } = useFriends()
  const { data: requests      = [] } = useFriendRequests()
  const { data: sentRequests  = [] } = useSentFriendRequests()

  const sendRequest      = useSendFriendRequest()
  const acceptRequest    = useAcceptFriendRequest()
  const deleteFriendship = useDeleteFriendship()

  const handleSend = async () => {
    setErrorMsg("")
    try {
      await sendRequest.mutateAsync(accountIdInput.trim())
      setAccountIdInput("")
      setTab("requests")
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "エラーが発生しました")
    }
  }

  const TABS = [
    { id: "friends"  as const, label: `フレンド (${friends.length})` },
    { id: "requests" as const, label: `申請 (${requests.length})` },
    { id: "add"      as const, label: "追加" },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold text-slate-900">フレンド管理</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* タブ */}
        <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                "flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors",
                tab === t.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* フレンド一覧 */}
        {tab === "friends" && (
          <ul className="space-y-1 max-h-72 overflow-y-auto">
            {friends.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">フレンドがいません</p>
            )}
            {friends.map((f) => (
              <li key={f.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="text-sm font-medium text-slate-700">{f.name}</span>
                <button
                  onClick={() => deleteFriendship.mutate(f.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* 申請一覧 */}
        {tab === "requests" && (
          <div className="space-y-4 max-h-72 overflow-y-auto">
            {requests.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2 px-1">受け取った申請</p>
                <ul className="space-y-1">
                  {requests.map((r) => (
                    <li key={r.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="text-sm text-slate-700">{r.name}</span>
                      <button
                        onClick={() => acceptRequest.mutate(r.id)}
                        className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition-colors font-medium"
                      >
                        承認
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sentRequests.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2 px-1">送った申請</p>
                <ul className="space-y-1">
                  {sentRequests.map((r) => (
                    <li key={r.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="text-sm text-slate-700">{r.name}</span>
                      <button
                        onClick={() => deleteFriendship.mutate(r.id)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
                      >
                        キャンセル
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {requests.length === 0 && sentRequests.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">申請はありません</p>
            )}
          </div>
        )}

        {/* フレンド追加 */}
        {tab === "add" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">account_id を入力して申請を送ります</p>
            <input
              type="text"
              placeholder="account_id"
              value={accountIdInput}
              onChange={(e) => setAccountIdInput(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
            <button
              onClick={handleSend}
              disabled={!accountIdInput.trim() || sendRequest.isPending}
              className="w-full bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {sendRequest.isPending ? "送信中..." : "申請を送る"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
