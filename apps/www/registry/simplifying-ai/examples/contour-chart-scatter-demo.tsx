"use client"

import {
  CONTOUR_COLOR_SCALES,
  ContourChart,
} from "@/registry/simplifying-ai/ui/charts"

// Generate data representing elevation/topography
const generateTopographyData = (): number[][] => {
  const size = 12
  const data: number[][] = []

  for (let j = 0; j < size; j++) {
    const row: number[] = []
    for (let i = 0; i < size; i++) {
      const x = i / (size - 1)
      const y = j / (size - 1)

      // Mountain ridge
      const ridge =
        1500 * Math.exp(-((y - 0.6) ** 2) / 0.1) * (1 + Math.sin(x * 8) * 0.3)

      // Valley
      const valley = -500 * Math.exp(-((x - 0.3) ** 2 + (y - 0.3) ** 2) / 0.05)

      // Rolling hills
      const hills = 300 * Math.sin(x * 6) * Math.cos(y * 4)

      // Base elevation
      const base = 500

      row.push(base + ridge + valley + hills)
    }
    data.push(row)
  }
  return data
}

const data = generateTopographyData()

export default function ContourChartScatterDemo() {
  return (
    <div className="w-full max-w-3xl">
      <ContourChart
        data={data}
        xAxisLabel="Longitude"
        yAxisLabel="Latitude"
        levels={8}
        colorScale={CONTOUR_COLOR_SCALES.ocean}
        showMarkers={true}
        markerSymbol="circle"
        markerSize={5}
        markerColor="#1e3a5f"
        showGrid={true}
        lineWidth={1}
        lineColor="#1e3a5f"
      />
    </div>
  )
}
