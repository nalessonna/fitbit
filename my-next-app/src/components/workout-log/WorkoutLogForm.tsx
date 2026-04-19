"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBodyParts, useCreateBodyPart } from "@/lib/hooks/useBodyParts"
import { useExercises, useCreateExercise } from "@/lib/hooks/useExercises"
import { useWorkoutLog, useSaveWorkoutLog, useDeleteWorkoutLog } from "@/lib/hooks/useWorkoutLog"
import { QuickAddForm } from "@/components/ui/QuickAddForm"
import type { WorkoutSet } from "@/lib/types"

interface Props {
  accountId:          string
  date:               string
  isSelf:             boolean
  initialExerciseId?: number
  initialBodyPartId?: number
}

export function WorkoutLogForm({ accountId, date, isSelf, initialExerciseId, initialBodyPartId }: Props) {
  const router = useRouter()

  const [selectedBodyPartId, setSelectedBodyPartId] = useState<number | null>(initialBodyPartId ?? null)
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(initialExerciseId ?? null)
  const [sets, setSets] = useState<WorkoutSet[]>([{ set_number: 1, weight: 0, reps: 0 }])
  const [addingBodyPart, setAddingBodyPart] = useState(false)
  const [addingExercise, setAddingExercise] = useState(false)

  const { data: bodyParts = [] } = useBodyParts(accountId)
  const { data: exercises = [] } = useExercises(accountId, selectedBodyPartId)
  const { data: log }            = useWorkoutLog(accountId, date, selectedExerciseId)

  const saveLog        = useSaveWorkoutLog()
  const deleteLog      = useDeleteWorkoutLog()
  const createBodyPart = useCreateBodyPart(accountId)
  const createExercise = useCreateExercise(accountId)

  useEffect(() => {
    if (log?.sets && log.sets.length > 0) setSets(log.sets)
    else setSets([{ set_number: 1, weight: 0, reps: 0 }])
  }, [log])

  const addSet = () =>
    setSets((prev) => [...prev, { set_number: prev.length + 1, weight: 0, reps: 0 }])

  const removeSet = (index: number) =>
    setSets((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, set_number: i + 1 }))
    )

  const updateSet = (index: number, field: "weight" | "reps", value: number) =>
    setSets((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))

  const handleSave = async () => {
    if (!selectedExerciseId) return
    await saveLog.mutateAsync({ date, exerciseId: selectedExerciseId, sets })
    router.back()
  }

  const handleDelete = async () => {
    if (!selectedExerciseId) return
    await deleteLog.mutateAsync({ date, exerciseId: selectedExerciseId })
    router.back()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{date}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{isSelf ? "自分のログ" : "フレンドのログ（閲覧のみ）"}</p>
      </div>

      {/* 部位・種目選択 */}
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <select
            className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={selectedBodyPartId ?? ""}
            onChange={(e) => {
              setSelectedBodyPartId(e.target.value ? Number(e.target.value) : null)
              setSelectedExerciseId(null)
              setAddingExercise(false)
            }}
          >
            <option value="">部位を選択</option>
            {bodyParts.map((bp) => (
              <option key={bp.id} value={bp.id}>{bp.name}</option>
            ))}
          </select>
          {isSelf && !addingBodyPart && (
            <button
              onClick={() => { setAddingBodyPart(true); setAddingExercise(false) }}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors whitespace-nowrap"
            >
              ＋部位を追加
            </button>
          )}
        </div>

        {isSelf && addingBodyPart && (
          <QuickAddForm
            placeholder="新しい部位名"
            onAdd={async (name) => {
              const newBp = await createBodyPart.mutateAsync(name)
              setSelectedBodyPartId(newBp.id)
              setSelectedExerciseId(null)
              setAddingBodyPart(false)
            }}
            isPending={createBodyPart.isPending}
            onCancel={() => setAddingBodyPart(false)}
          />
        )}

        <div className="flex gap-2 items-center">
          <select
            className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
            value={selectedExerciseId ?? ""}
            onChange={(e) => setSelectedExerciseId(e.target.value ? Number(e.target.value) : null)}
            disabled={!selectedBodyPartId}
          >
            <option value="">種目を選択</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
          {isSelf && selectedBodyPartId && !addingExercise && (
            <button
              onClick={() => { setAddingExercise(true); setAddingBodyPart(false) }}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors whitespace-nowrap"
            >
              ＋種目を追加
            </button>
          )}
        </div>

        {isSelf && addingExercise && selectedBodyPartId && (
          <QuickAddForm
            placeholder="新しい種目名"
            onAdd={async (name) => {
              const newEx = await createExercise.mutateAsync({ bodyPartId: selectedBodyPartId, name })
              setSelectedExerciseId(newEx.id)
              setAddingExercise(false)
            }}
            isPending={createExercise.isPending}
            onCancel={() => setAddingExercise(false)}
          />
        )}
      </div>

      {/* セット入力 */}
      {selectedExerciseId && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 text-xs text-slate-400 px-1 font-medium">
            <span>セット</span><span>重量 (kg)</span><span>回数</span><span />
          </div>

          {sets.map((set, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 items-center">
              <span className="text-sm text-center font-medium text-slate-500">{set.set_number}</span>
              <input
                type="number"
                value={set.weight || ""}
                onChange={(e) => updateSet(i, "weight", Number(e.target.value))}
                disabled={!isSelf}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-50 disabled:text-slate-400"
                min={0}
                step={0.5}
              />
              <input
                type="number"
                value={set.reps || ""}
                onChange={(e) => updateSet(i, "reps", Number(e.target.value))}
                disabled={!isSelf}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-50 disabled:text-slate-400"
                min={0}
              />
              {isSelf && (
                <button
                  onClick={() => removeSet(i)}
                  className="text-slate-300 hover:text-red-400 text-lg leading-none transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {isSelf && (
            <button
              onClick={addSet}
              className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
            >
              + セットを追加
            </button>
          )}
        </div>
      )}

      {/* アクションボタン */}
      {isSelf && selectedExerciseId && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saveLog.isPending}
            className="flex-1 bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {saveLog.isPending ? "保存中..." : "保存"}
          </button>
          {log?.sets && log.sets.length > 0 && (
            <button
              onClick={handleDelete}
              disabled={deleteLog.isPending}
              className="px-4 text-red-400 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
            >
              削除
            </button>
          )}
        </div>
      )}
    </div>
  )
}
