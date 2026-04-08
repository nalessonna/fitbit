"use client"

import { useProfile } from "@/lib/hooks/useProfile"
import { WorkoutLogForm } from "@/components/workout-log/WorkoutLogForm"

interface Props {
  date:               string
  viewAccountId?:     string
  initialExerciseId?: number
  initialBodyPartId?: number
}

export function WorkoutLogFormWrapper({ date, viewAccountId, initialExerciseId, initialBodyPartId }: Props) {
  const { data: profile } = useProfile()

  if (!profile) return null

  const accountId = viewAccountId ?? profile.account_id
  const isSelf    = !viewAccountId || viewAccountId === profile.account_id

  return <WorkoutLogForm accountId={accountId} date={date} isSelf={isSelf} initialExerciseId={initialExerciseId} initialBodyPartId={initialBodyPartId} />
}
