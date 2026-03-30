"use client"

import { interpolateViridis } from "d3-scale-chromatic"

import { DensityChart } from "@/registry/simplifying-ai/ui/charts/scientific/density-chart"

// Generate normally distributed 2D data
function generateNormalData(): { x: number; y: number }[] {
  const data: { x: number; y: number }[] = []

  // Box-Muller transform for normal distribution
  const normalRandom = (mean: number, std: number) => {
    const u = 1 - Math.random()
    const v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return z * std + mean
  }

  for (let i = 0; i < 200; i++) {
    data.push({
      x: normalRandom(50, 15),
      y: normalRandom(50, 15),
    })
  }

  return data
}

const normalData = generateNormalData()

export default function DensityChartContoursOnly() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <DensityChart
        data={normalData}
        showPoints={false}
        showContours
        bandwidth={25}
        thresholds={12}
        colorScale={interpolateViridis}
        xAxisLabel="Feature X"
        yAxisLabel="Feature Y"
      />
    </div>
  )
}
