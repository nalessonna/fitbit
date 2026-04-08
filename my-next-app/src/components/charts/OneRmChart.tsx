"use client"

import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { useOneRm } from "@/lib/hooks/useOneRm"
import { useBodyParts } from "@/lib/hooks/useBodyParts"
import { useExercises } from "@/lib/hooks/useExercises"
import { SelectSheet } from "@/components/ui/SelectSheet"

const PERIODS = [
  { label: "1ヶ月", value: "month"   },
  { label: "3ヶ月", value: "3months" },
  { label: "1年",   value: "year"    },
  { label: "全期間", value: ""        },
]

interface Props {
  accountId: string
}

export function OneRmChart({ accountId }: Props) {
  const [period, setPeriod]         = useState("3months")
  const [bodyPartId, setBodyPartId] = useState<number | null>(null)
  const [exerciseId, setExerciseId] = useState<number | null>(null)

  const { data: bodyParts = [] } = useBodyParts(accountId)
  const { data: exercises = [] } = useExercises(accountId, bodyPartId)
  const { data = [], isLoading } = useOneRm(accountId, exerciseId, period)

  const formatted = data.map((d) => ({
    date:  d.date.slice(5),
    oneRm: Math.round(d.one_rm * 10) / 10,
  }))

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">推定1RM</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {exerciseId ? exercises.find((e) => e.id === exerciseId)?.name ?? "種目" : "種目を選択"}
          </p>
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
                    ? "bg-violet-500 text-white"
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
              { value: "", label: "部位を選択" },
              ...bodyParts.map((bp) => ({ value: String(bp.id), label: bp.name })),
            ]}
          />
          {bodyPartId && (
            <SelectSheet
              value={String(exerciseId ?? "")}
              onChange={(val) => setExerciseId(val ? Number(val) : null)}
              options={[
                { value: "", label: "種目を選択" },
                ...exercises.map((ex) => ({ value: String(ex.id), label: ex.name })),
              ]}
            />
          )}
        </div>
      </div>

      {!exerciseId ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">種目を選択してください</div>
      ) : isLoading ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">読み込み中...</div>
      ) : data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">データなし</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`${v} kg`, "推定1RM"]}
              contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
            />
            <Line type="monotone" dataKey="oneRm" stroke="#8b5cf6" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
