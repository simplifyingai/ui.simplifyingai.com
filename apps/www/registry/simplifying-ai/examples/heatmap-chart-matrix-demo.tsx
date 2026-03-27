"use client"

import { HeatmapChart } from "@/registry/simplifying-ai/ui/charts"

// Generate matrix data for hours vs days
const hours = ["00", "03", "06", "09", "12", "15", "18", "21"]
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const data = days.flatMap((day, dayIndex) =>
  hours.map((hour, hourIndex) => {
    // Create a pattern: more activity during work hours on weekdays
    const isWeekend = dayIndex >= 5
    const isWorkHour = hourIndex >= 2 && hourIndex <= 5
    const baseValue = isWeekend ? 20 : isWorkHour ? 80 : 30
    const variance = ((dayIndex * 7 + hourIndex) % 10) * 5

    return {
      x: hour,
      y: day,
      value: Math.max(0, baseValue + variance - 25),
    }
  })
)

export default function HeatmapChartMatrixDemo() {
  return (
    <div className="w-full max-w-3xl">
      <HeatmapChart
        data={data}
        variant="matrix"
        xAxisLabel="Hour"
        yAxisLabel="Day"
        colorTheme="blue"
        showValues
        cellRadius={4}
        height={300}
        valueFormat={(v) => v.toString()}
      />
    </div>
  )
}
