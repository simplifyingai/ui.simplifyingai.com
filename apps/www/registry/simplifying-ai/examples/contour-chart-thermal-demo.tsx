"use client"

import {
  CONTOUR_COLOR_SCALES,
  ContourChart,
} from "@/registry/simplifying-ai/ui/charts"

// Generate thermal/heat distribution data
const generateThermalData = (): number[][] => {
  const size = 18
  const data: number[][] = []

  for (let j = 0; j < size; j++) {
    const row: number[] = []
    for (let i = 0; i < size; i++) {
      const x = i / (size - 1)
      const y = j / (size - 1)

      // Heat source in center
      const centerHeat =
        100 * Math.exp(-((x - 0.5) ** 2 + (y - 0.5) ** 2) / 0.08)

      // Secondary heat source
      const secondaryHeat =
        60 * Math.exp(-((x - 0.2) ** 2 + (y - 0.7) ** 2) / 0.05)

      // Cooling effect at edges
      const edgeCooling = 20 * (1 - Math.min(x, 1 - x, y, 1 - y) * 5)

      row.push(centerHeat + secondaryHeat - edgeCooling + 20)
    }
    data.push(row)
  }
  return data
}

const data = generateThermalData()

export default function ContourChartThermalDemo() {
  return (
    <div className="w-full max-w-3xl">
      <ContourChart
        data={data}
        xAxisLabel="X Position"
        yAxisLabel="Y Position"
        levels={10}
        colorScale={CONTOUR_COLOR_SCALES.thermal}
        showMarkers={false}
        showGrid={false}
        lineWidth={0.3}
        lineColor="rgba(255,255,255,0.4)"
      />
    </div>
  )
}
