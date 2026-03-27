"use client"

import { HeatmapChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample hourly activity data for each day of the week
function generateRadialData() {
  const data: { day: number; hour: number; value: number }[] = []
  const days = [0, 1, 2, 3, 4, 5, 6] // Sunday to Saturday
  const hours = Array.from({ length: 24 }, (_, i) => i) // 0-23

  // Create a deterministic seed
  const seed = (day: number, hour: number) => {
    const hash = (day * 24 + hour) * 2654435761
    return (hash >>> 0) / 4294967296
  }

  days.forEach((day) => {
    hours.forEach((hour) => {
      const random = seed(day, hour)

      // Create realistic patterns:
      // - More activity during work hours (9-17) on weekdays
      // - Less activity on weekends
      // - Very low activity at night (0-6)
      const isWeekend = day === 0 || day === 6
      const isWorkHour = hour >= 9 && hour <= 17
      const isNight = hour >= 0 && hour <= 6
      const isEvening = hour >= 18 && hour <= 22

      let baseActivity = 0.3

      if (isNight) {
        baseActivity = 0.05
      } else if (isWorkHour && !isWeekend) {
        baseActivity = 0.7
      } else if (isEvening) {
        baseActivity = 0.5
      } else if (isWeekend) {
        baseActivity = 0.4
      }

      const value = Math.floor(random * baseActivity * 100)

      if (value > 5) {
        data.push({
          day,
          hour,
          value,
        })
      }
    })
  })

  return data
}

const radialData = generateRadialData()

export default function HeatmapChartRadialDemo() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <HeatmapChart
        data={radialData}
        variant="radial"
        colorTheme="heat"
        width={500}
        height={500}
        cellGap={1}
        legend={{
          show: true,
          lessLabel: "Low",
          moreLabel: "High",
        }}
      />
    </div>
  )
}
