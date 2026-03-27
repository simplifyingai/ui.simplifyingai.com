"use client"

import * as React from "react"

import { HeatmapChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample contribution data
function generateContributionData() {
  const data = []
  const now = new Date()
  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const seed = (dateStr: string) => {
    let hash = 0
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  const current = new Date(sixMonthsAgo)
  while (current <= now) {
    const dateStr = current.toISOString().split("T")[0]
    const seededRandom = seed(dateStr) / 2147483647

    if (seededRandom > 0.3) {
      const value = Math.floor(seededRandom * 12) + 1
      data.push({
        date: new Date(current),
        value,
      })
    }

    current.setDate(current.getDate() + 1)
  }

  return data
}

const themes = [
  "green",
  "blue",
  "purple",
  "orange",
  "red",
  "gray",
  "pink",
] as const

export default function HeatmapChartThemesDemo() {
  const [activeTheme, setActiveTheme] =
    React.useState<(typeof themes)[number]>("green")
  const contributionData = React.useMemo(() => generateContributionData(), [])

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => setActiveTheme(theme)}
            className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
              activeTheme === theme
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {theme}
          </button>
        ))}
      </div>
      <HeatmapChart
        data={contributionData}
        variant="calendar"
        colorTheme={activeTheme}
        cellSize={10}
        cellGap={3}
        cellRadius={2}
        height={140}
        legend={{
          show: true,
          lessLabel: "Less",
          moreLabel: "More",
        }}
      />
    </div>
  )
}
