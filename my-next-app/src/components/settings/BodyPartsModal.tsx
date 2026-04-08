"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { useBodyParts, useCreateBodyPart, useUpdateBodyPart, useDeleteBodyPart } from "@/lib/hooks/useBodyParts"
import { useExercises, useCreateExercise, useUpdateExercise, useDeleteExercise } from "@/lib/hooks/useExercises"

interface Props {
  onClose: () => void
}

export function BodyPartsModal({ onClose }: Props) {
  const profile   = useAppStore((s) => s.profile)
  const accountId = profile?.account_id ?? ""
  const [tab, setTab] = useState<"bodyParts" | "exercises">("bodyParts")

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold text-slate-900">部位・種目管理</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* タブ */}
        <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1">
          {(["bodyParts", "exercises"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors",
                tab === t
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              {t === "bodyParts" ? "部位" : "種目"}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1">
          {tab === "bodyParts" ? (
            <BodyPartsList accountId={accountId} />
          ) : (
            <ExercisesList accountId={accountId} />
          )}
        </div>
      </div>
    </div>
  )
}

function BodyPartsList({ accountId }: { accountId: string }) {
  const { data: bodyParts = [] } = useBodyParts(accountId)
  const createBodyPart = useCreateBodyPart(accountId)
  const updateBodyPart = useUpdateBodyPart(accountId)
  const deleteBodyPart = useDeleteBodyPart(accountId)

  const [newName, setNewName]         = useState("")
  const [editingId, setEditingId]     = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createBodyPart.mutateAsync(newName.trim())
    setNewName("")
  }

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return
    await updateBodyPart.mutateAsync({ id, name: editingName.trim() })
    setEditingId(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="新しい部位名"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim() || createBodyPart.isPending}
          className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
        >
          追加
        </button>
      </div>

      {bodyParts.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-8">部位がありません</p>
      )}

      <div className="space-y-1">
        {bodyParts.map((bp) => (
          <div key={bp.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50">
            {editingId === bp.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate(bp.id)}
                  className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  autoFocus
                />
                <button onClick={() => handleUpdate(bp.id)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">保存</button>
                <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">キャンセル</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-slate-700 font-medium">{bp.name}</span>
                <button
                  onClick={() => { setEditingId(bp.id); setEditingName(bp.name) }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={() => deleteBodyPart.mutate(bp.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  削除
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ExercisesList({ accountId }: { accountId: string }) {
  const { data: bodyParts = [] } = useBodyParts(accountId)
  const [selectedBodyPartId, setSelectedBodyPartId] = useState<number | null>(null)

  const { data: exercises = [] } = useExercises(accountId, selectedBodyPartId)
  const createExercise = useCreateExercise(accountId)
  const updateExercise = useUpdateExercise(accountId)
  const deleteExercise = useDeleteExercise(accountId)

  const [newName, setNewName]         = useState("")
  const [editingId, setEditingId]     = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")

  const handleCreate = async () => {
    if (!newName.trim() || !selectedBodyPartId) return
    await createExercise.mutateAsync({ bodyPartId: selectedBodyPartId, name: newName.trim() })
    setNewName("")
  }

  const handleUpdate = async (id: number) => {
    if (!editingName.trim() || !selectedBodyPartId) return
    await updateExercise.mutateAsync({ id, bodyPartId: selectedBodyPartId, name: editingName.trim() })
    setEditingId(null)
  }

  if (bodyParts.length === 0) {
    return (
      <p className="text-slate-400 text-sm text-center py-8">
        先に「部位」タブで部位を追加してください
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <select
        value={selectedBodyPartId ?? ""}
        onChange={(e) => {
          setSelectedBodyPartId(e.target.value ? Number(e.target.value) : null)
          setEditingId(null)
        }}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <option value="">部位を選択</option>
        {bodyParts.map((bp) => (
          <option key={bp.id} value={bp.id}>{bp.name}</option>
        ))}
      </select>

      {selectedBodyPartId && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="新しい種目名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || createExercise.isPending}
            className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            追加
          </button>
        </div>
      )}

      {selectedBodyPartId && exercises.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-6">種目がありません</p>
      )}

      <div className="space-y-1">
        {exercises.map((ex) => (
          <div key={ex.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50">
            {editingId === ex.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate(ex.id)}
                  className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  autoFocus
                />
                <button onClick={() => handleUpdate(ex.id)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">保存</button>
                <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">キャンセル</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-slate-700 font-medium">{ex.name}</span>
                <button
                  onClick={() => { setEditingId(ex.id); setEditingName(ex.name) }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={() => deleteExercise.mutate({ id: ex.id, bodyPartId: ex.body_part_id })}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  削除
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
