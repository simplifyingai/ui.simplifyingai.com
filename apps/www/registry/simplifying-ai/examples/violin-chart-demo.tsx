"use client"

import { ViolinChart } from "@/registry/simplifying-ai/ui/charts"

// Generate sample data with normal-ish distribution
const generateData = (mean: number, std: number, n: number) =>
  Array.from({ length: n }, () => {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + std * z
  })

const data = [
  { name: "Treatment A", values: generateData(50, 10, 50) },
  { name: "Treatment B", values: generateData(65, 15, 50) },
  { name: "Control", values: generateData(45, 12, 50) },
]

const config = {
  "Treatment A": { label: "Treatment A", color: "var(--chart-1)" },
  "Treatment B": { label: "Treatment B", color: "var(--chart-2)" },
  Control: { label: "Control", color: "var(--chart-3)" },
}

export default function ViolinChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <ViolinChart
        data={data}
        config={config}
        showBoxPlot
        xAxisLabel="Group"
        yAxisLabel="Measurement"
      />
    </div>
  )
}
