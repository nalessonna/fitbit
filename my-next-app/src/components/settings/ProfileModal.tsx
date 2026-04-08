"use client"

import { useState } from "react"
import { useProfile, useUpdateProfile, useDeleteAccount } from "@/lib/hooks/useProfile"

interface Props {
  onClose: () => void
}

export function ProfileModal({ onClose }: Props) {
  const { data: profile } = useProfile()
  const [name, setName]   = useState(profile?.name ?? "")
  const updateProfile     = useUpdateProfile()
  const deleteAccount     = useDeleteAccount()
  const [confirm, setConfirm] = useState(false)

  const handleSave = async () => {
    await updateProfile.mutateAsync(name)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-semibold text-slate-900">プロフィール</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 mt-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">account_id</label>
            <p className="text-sm text-slate-600 mt-1.5 font-mono bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">{profile?.account_id}</p>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim() || updateProfile.isPending}
            className="w-full bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {updateProfile.isPending ? "保存中..." : "保存"}
          </button>

          <div className="border-t border-slate-100 pt-4">
            {!confirm ? (
              <button
                onClick={() => setConfirm(true)}
                className="w-full text-red-400 text-sm hover:text-red-600 transition-colors font-medium"
              >
                アカウントを削除
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-500 text-center">本当に削除しますか？この操作は取り消せません。</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirm(false)}
                    className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => deleteAccount.mutate()}
                    className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    削除する
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
