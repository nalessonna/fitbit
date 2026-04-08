import { Suspense } from "react"
import { WorkoutLogForm } from "@/components/workout-log/WorkoutLogForm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface Props {
  params:      Promise<{ date: string }>
  searchParams: Promise<{ view?: string; exercise?: string; bodyPart?: string }>
}

export default async function WorkoutLogPage({ params, searchParams }: Props) {
  const cookieStore = await cookies()
  if (!cookieStore.get("auth_token")) redirect("/")

  const { date } = await params
  const { view, exercise, bodyPart } = await searchParams

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <Suspense>
        <WorkoutLogPageContent
          date={date}
          viewAccountId={view}
          initialExerciseId={exercise ? Number(exercise) : undefined}
          initialBodyPartId={bodyPart ? Number(bodyPart) : undefined}
        />
      </Suspense>
    </div>
  )
}

function WorkoutLogPageContent({
  date,
  viewAccountId,
  initialExerciseId,
  initialBodyPartId,
}: {
  date: string
  viewAccountId?: string
  initialExerciseId?: number
  initialBodyPartId?: number
}) {
  return (
    <WorkoutLogFormWrapper date={date} viewAccountId={viewAccountId} initialExerciseId={initialExerciseId} initialBodyPartId={initialBodyPartId} />
  )
}

// クライアントコンポーネントへのブリッジ
import { WorkoutLogFormWrapper } from "./WorkoutLogFormWrapper"
