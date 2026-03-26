"use client"

import {
  CONTOUR_COLOR_SCALES,
  ContourChart,
} from "@/registry/simplifying-ai/ui/charts"

// Generate sample data with interesting contours
const generateContourData = (): number[][] => {
  const size = 20
  const data: number[][] = []

  for (let j = 0; j < size; j++) {
    const row: number[] = []
    for (let i = 0; i < size; i++) {
      const x = (i / (size - 1)) * 4 - 2
      const y = (j / (size - 1)) * 4 - 2
      // Sinusoidal wave pattern
      const z = Math.sin(x) * Math.cos(y) * 5 + Math.sin(x * y) * 2
      row.push(z)
    }
    data.push(row)
  }
  return data
}

const data = generateContourData()

export default function ContourChartLinesDemo() {
  return (
    <div className="w-full max-w-3xl">
      <ContourChart
        data={data}
        xAxisLabel="X"
        yAxisLabel="Y"
        levels={15}
        colorScale={CONTOUR_COLOR_SCALES.viridis}
        showFill={false}
        showLines={true}
        lineWidth={1.5}
        showMarkers={false}
        showGrid={true}
      />
    </div>
  )
}
