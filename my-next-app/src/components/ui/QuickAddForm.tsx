"use client"

import { useState } from "react"

interface Props {
  placeholder: string
  onAdd: (name: string) => Promise<void>
  isPending: boolean
  disabled?: boolean
  onCancel: () => void
}

export function QuickAddForm({ placeholder, onAdd, isPending, disabled, onCancel }: Props) {
  const [name, setName] = useState("")

  const handleSubmit = async () => {
    if (!name.trim() || isPending) return
    await onAdd(name.trim())
    setName("")
  }

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        placeholder={placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={disabled}
        autoFocus
        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <button
        onClick={handleSubmit}
        disabled={!name.trim() || isPending || disabled}
        className="bg-indigo-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
      >
        追加
      </button>
      <button
        onClick={onCancel}
        className="text-slate-400 px-2 py-2 text-sm hover:text-slate-600 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
