"use client"

import { DensityChart } from "@/registry/simplifying-ai/ui/charts/scientific/density-chart"

// Generate clustered 2D data
function generateClusteredData(): { x: number; y: number }[] {
  const data: { x: number; y: number }[] = []

  // Cluster 1 - bottom left
  for (let i = 0; i < 40; i++) {
    data.push({
      x: 20 + Math.random() * 25 + (Math.random() - 0.5) * 10,
      y: 25 + Math.random() * 20 + (Math.random() - 0.5) * 10,
    })
  }

  // Cluster 2 - top right
  for (let i = 0; i < 35; i++) {
    data.push({
      x: 60 + Math.random() * 25 + (Math.random() - 0.5) * 10,
      y: 55 + Math.random() * 25 + (Math.random() - 0.5) * 10,
    })
  }

  // Cluster 3 - middle
  for (let i = 0; i < 25; i++) {
    data.push({
      x: 45 + Math.random() * 15 + (Math.random() - 0.5) * 8,
      y: 40 + Math.random() * 15 + (Math.random() - 0.5) * 8,
    })
  }

  return data
}

const clusterData = generateClusteredData()

export default function DensityChartDemo() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <DensityChart
        data={clusterData}
        showPoints
        showContours
        bandwidth={18}
        thresholds={8}
        xAxisLabel="X Value"
        yAxisLabel="Y Value"
      />
    </div>
  )
}
