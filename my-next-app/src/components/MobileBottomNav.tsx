"use client"

type Tab = "calendar" | "charts" | "settings"

interface Props {
  activeTab: Tab
  onChange:  (tab: Tab) => void
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-indigo-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path strokeLinecap="round" d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  )
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-indigo-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18M7 20V12M12 20V8M17 20V4" />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-indigo-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

const TABS: { id: Tab; label: string }[] = [
  { id: "calendar", label: "カレンダー" },
  { id: "charts",   label: "グラフ"     },
  { id: "settings", label: "設定"       },
]

export function MobileBottomNav({ activeTab, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-100 z-30 lg:hidden">
      <div className="grid grid-cols-3">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center justify-center py-2.5 gap-1 transition-colors"
            >
              {tab.id === "calendar" && <CalendarIcon active={active} />}
              {tab.id === "charts"   && <ChartIcon active={active} />}
              {tab.id === "settings" && <SettingsIcon active={active} />}
              <span className={`text-xs font-medium ${active ? "text-indigo-500" : "text-slate-400"}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
