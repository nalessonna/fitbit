"use client"

import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { useVolume } from "@/lib/hooks/useVolume"
import { useBodyParts } from "@/lib/hooks/useBodyParts"
import { useExercises } from "@/lib/hooks/useExercises"
import { SelectSheet } from "@/components/ui/SelectSheet"
import type { VolumeEntry } from "@/lib/types"

const PERIODS = [
  { label: "1ヶ月", value: "month",   days: 30  },
  { label: "3ヶ月", value: "3months", days: 90  },
  { label: "1年",   value: "year",    days: 365 },
  { label: "全期間", value: "",        days: null },
]

function fillDates(data: VolumeEntry[], period: string): { date: string; volume: number }[] {
  const today   = new Date()
  const volumeMap = Object.fromEntries(data.map((d) => [d.date, Math.round(d.volume)]))

  const periodDef = PERIODS.find((p) => p.value === period)
  const days      = periodDef?.days ?? null

  let start: Date
  if (days) {
    start = new Date(today)
    start.setDate(today.getDate() - days + 1)
  } else if (data.length > 0) {
    start = new Date(data[0].date)
  } else {
    return []
  }

  const result: { date: string; volume: number }[] = []
  const cursor = new Date(start)
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10)
    result.push({ date: key.slice(5), volume: volumeMap[key] ?? 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

interface Props {
  accountId: string
}

export function VolumeChart({ accountId }: Props) {
  const [period, setPeriod]         = useState("month")
  const [bodyPartId, setBodyPartId] = useState<number | null>(null)
  const [exerciseId, setExerciseId] = useState<number | null>(null)

  const { data: bodyParts = [] } = useBodyParts(accountId)
  const { data: exercises = [] } = useExercises(accountId, bodyPartId)
  const { data = [], isLoading } = useVolume({ accountId, period, bodyPartId, exerciseId })

  const filled = fillDates(data, period)

  const tickInterval = filled.length > 180 ? 29 : filled.length > 60 ? 13 : 6

  const label = exerciseId
    ? exercises.find((e) => e.id === exerciseId)?.name ?? "種目"
    : bodyPartId
    ? bodyParts.find((b) => b.id === bodyPartId)?.name ?? "部位"
    : "全体"

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">総ボリューム</h3>
          <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        </div>

        {/* フィルター */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={[
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                  period === p.value
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {p.label}
              </button>
            ))}
          </div>
          <SelectSheet
            value={String(bodyPartId ?? "")}
            onChange={(val) => {
              setBodyPartId(val ? Number(val) : null)
              setExerciseId(null)
            }}
            options={[
              { value: "", label: "全体" },
              ...bodyParts.map((bp) => ({ value: String(bp.id), label: bp.name })),
            ]}
          />
          {bodyPartId && (
            <SelectSheet
              value={String(exerciseId ?? "")}
              onChange={(val) => setExerciseId(val ? Number(val) : null)}
              options={[
                { value: "", label: "部位全体" },
                ...exercises.map((ex) => ({ value: String(ex.id), label: ex.name })),
              ]}
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">読み込み中...</div>
      ) : filled.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">データなし</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={filled} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={tickInterval} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`${v} kg`, "総ボリューム"]}
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
            />
            <Bar dataKey="volume" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
