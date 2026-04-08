"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCalendar } from "@/lib/hooks/useCalendar"
import type { CalendarExercise } from "@/lib/types"

interface Props {
  accountId:      string
  selectedDate?:  string
  onDateSelect:   (date: string) => void
  isSelf:         boolean
  viewAccountId?: string
}

export function WorkoutCalendar({ accountId, selectedDate, onDateSelect, isSelf, viewAccountId }: Props) {
  const router = useRouter()
  const today  = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const { data: entries = [] } = useCalendar(accountId, year, month)

  const workoutDates = new Set(entries.map((e) => e.date))
  const exerciseMap  = Object.fromEntries(entries.map((e) => [e.date, e.exercises ?? []]))

  const firstDay    = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selectedExercises: CalendarExercise[] = selectedDate ? (exerciseMap[selectedDate] ?? []) : []

  const handleLogNav = () => {
    if (!selectedDate) return
    router.push(`/dashboard/log/${selectedDate}${viewAccountId ? `?view=${viewAccountId}` : ""}`)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-slate-800 text-sm">{year}年{month}月</span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日 */}
      <div className="grid grid-cols-7">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d} className="text-center text-xs text-slate-400 py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const dateStr    = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const hasLog     = workoutDates.has(dateStr)
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={[
                "aspect-square rounded-xl text-sm flex items-center justify-center transition-colors font-medium",
                isSelected
                  ? "bg-indigo-500 text-white shadow-sm"
                  : hasLog
                  ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  : "hover:bg-slate-100 text-slate-700",
              ].join(" ")}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* 選択日サマリー */}
      {selectedDate && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">{selectedDate}</span>
            <button
              onClick={handleLogNav}
              className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition-colors font-medium"
            >
              {isSelf ? "記録する" : "詳細を見る"}
            </button>
          </div>

          {selectedExercises.length === 0 ? (
            <p className="text-xs text-slate-400">記録なし</p>
          ) : (
            <div className="space-y-2.5">
              {selectedExercises.map((ex) => (
                <div key={ex.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-slate-600">{ex.name}</p>
                    {isSelf && (
                      <button
                        onClick={() => router.push(`/dashboard/log/${selectedDate}?exercise=${ex.id}&bodyPart=${ex.body_part_id}${viewAccountId ? `&view=${viewAccountId}` : ""}`)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                      >
                        編集
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ex.sets.map((s) => (
                      <span
                        key={s.set_number}
                        className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                      >
                        {s.set_number}セット: {s.weight}kg × {s.reps}回
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
