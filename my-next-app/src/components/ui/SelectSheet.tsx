"use client"

import { useState } from "react"

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value:      string
  onChange:   (value: string) => void
  options:    SelectOption[]
  className?: string
}

export function SelectSheet({ value, onChange, options, className = "" }: Props) {
  const [open, setOpen] = useState(false)

  const selected = options.find((o) => o.value === value)
  const label    = selected?.label ?? options[0]?.label ?? ""

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
  }

  return (
    <>
      {/* モバイル: カスタムボタン（lg以上では非表示） */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "lg:hidden flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 transition-colors",
          className,
        ].join(" ")}
      >
        <span>{label}</span>
        <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* デスクトップ: ネイティブ select（lg未満では非表示） */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "hidden lg:block text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300",
          className,
        ].join(" ")}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* ボトムシート（モバイルのみ、open=trueのとき表示） */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          onClick={() => setOpen(false)}
        >
          {/* 背景オーバーレイ */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* シート本体 */}
          <div
            className="relative bg-white rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ハンドル */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            <ul className="overflow-y-auto max-h-72 py-2">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <span className={[
                      "text-base",
                      opt.value === value ? "font-semibold text-indigo-600" : "text-slate-700",
                    ].join(" ")}>
                      {opt.label}
                    </span>
                    {opt.value === value && (
                      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div className="px-4 pb-6 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl bg-slate-100 text-sm font-medium text-slate-600 active:bg-slate-200 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
