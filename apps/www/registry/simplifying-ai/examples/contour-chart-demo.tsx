"use client"

import { ContourChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample 2D terrain-like data with multiple peaks
const generateContourData = (): number[][] => {
  const size = 15
  const data: number[][] = []

  for (let j = 0; j < size; j++) {
    const row: number[] = []
    for (let i = 0; i < size; i++) {
      const x = i / (size - 1)
      const y = j / (size - 1)

      // Create multiple peaks and valleys
      let z = 0

      // Main peak (top right area)
      z += 8 * Math.exp(-((x - 0.7) ** 2 + (y - 0.7) ** 2) / 0.05)

      // Secondary peak (center-left)
      z += 4 * Math.exp(-((x - 0.3) ** 2 + (y - 0.5) ** 2) / 0.08)

      // Valley (bottom area)
      z -= 3 * Math.exp(-((x - 0.5) ** 2 + (y - 0.2) ** 2) / 0.1)

      // Small bump (top left)
      z += 2 * Math.exp(-((x - 0.2) ** 2 + (y - 0.8) ** 2) / 0.04)

      // Base noise
      z += Math.sin(x * 10) * Math.cos(y * 8) * 0.5

      row.push(z)
    }
    data.push(row)
  }
  return data
}

const data = generateContourData()

export default function ContourChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <ContourChart
        data={data}
        xAxisLabel="X"
        yAxisLabel="Y"
        levels={12}
        colorScale={[
          "#1e40af",
          "#2563eb",
          "#3b82f6",
          "#60a5fa",
          "#93c5fd",
          "#bfdbfe",
        ]}
        showMarkers={true}
        markerSymbol="x"
        markerSize={6}
        markerColor="#1e40af"
        showGrid={true}
        lineWidth={0.5}
      />
    </div>
  )
}
