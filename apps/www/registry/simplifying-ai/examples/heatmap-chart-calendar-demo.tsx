"use client"

import { HeatmapChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample contribution data for the past year
function generateContributionData() {
  const data = []
  const now = new Date()
  const oneYearAgo = new Date(now)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // Use a deterministic seed based on date for consistent results
  const seed = (dateStr: string) => {
    let hash = 0
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  const current = new Date(oneYearAgo)
  while (current <= now) {
    const dateStr = current.toISOString().split("T")[0]
    const seededRandom = seed(dateStr) / 2147483647

    // Create a pattern: more activity on weekdays, less on weekends
    const dayOfWeek = current.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseActivity = isWeekend ? 0.3 : 0.7

    // Random contribution count
    const activityLevel = seededRandom * baseActivity
    if (activityLevel > 0.2) {
      const value = Math.floor(activityLevel * 15) + 1
      data.push({
        date: new Date(current),
        value,
      })
    }

    current.setDate(current.getDate() + 1)
  }

  return data
}

const contributionData = generateContributionData()

export default function HeatmapChartCalendarDemo() {
  return (
    <div className="w-full">
      <HeatmapChart
        data={contributionData}
        variant="calendar"
        colorTheme="green"
        cellSize={11}
        cellGap={3}
        cellRadius={2}
        legend={{
          show: true,
          lessLabel: "Less",
          moreLabel: "More",
        }}
      />
    </div>
  )
}
