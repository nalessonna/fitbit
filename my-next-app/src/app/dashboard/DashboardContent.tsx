"use client"

import { useState } from "react"
import { useProfile } from "@/lib/hooks/useProfile"
import { WorkoutCalendar }       from "@/components/calendar/WorkoutCalendar"
import { VolumeChart }           from "@/components/charts/VolumeChart"
import { OneRmChart }            from "@/components/charts/OneRmChart"
import { MobileBottomNav }       from "@/components/MobileBottomNav"
import { MobileSettingsContent } from "@/components/MobileSettingsContent"

type MobileTab = "calendar" | "charts" | "settings"

interface Props {
  viewAccountId?: string
}

export function DashboardContent({ viewAccountId }: Props) {
  const { data: profile } = useProfile()

  const accountId = viewAccountId ?? profile?.account_id ?? ""
  const isSelf    = !viewAccountId || viewAccountId === profile?.account_id

  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [mobileTab, setMobileTab]       = useState<MobileTab>("calendar")

  if (!accountId) return null

  const calendarSection = (
    <WorkoutCalendar
      accountId={accountId}
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      isSelf={isSelf}
      viewAccountId={viewAccountId}
    />
  )

  const chartsSection = (
    <div className="space-y-8">
      <VolumeChart accountId={accountId} />
      <OneRmChart  accountId={accountId} />
    </div>
  )

  return (
    <>
      {/* ── デスクトップ: 2カラム ── */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <div>{calendarSection}</div>
        <div>{chartsSection}</div>
      </div>

      {/* ── モバイル: タブ切り替え ── */}
      <div className="lg:hidden pb-20">
        {mobileTab === "calendar" && calendarSection}
        {mobileTab === "charts"   && chartsSection}
        {mobileTab === "settings" && <MobileSettingsContent />}
      </div>

      {/* ── モバイル: 下部タブバー ── */}
      <MobileBottomNav activeTab={mobileTab} onChange={setMobileTab} />
    </>
  )
}
