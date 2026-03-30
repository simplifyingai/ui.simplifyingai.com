"use client"

import { SplomChart } from "@/registry/simplifying-ai/ui/charts/statistical/splom-chart"

// Performance metrics across different systems
const performanceData = [
  { id: "System A", values: { cpu: 45, memory: 62, io: 38, network: 55 } },
  { id: "System B", values: { cpu: 72, memory: 48, io: 65, network: 42 } },
  { id: "System C", values: { cpu: 58, memory: 75, io: 52, network: 68 } },
  { id: "System D", values: { cpu: 35, memory: 40, io: 28, network: 35 } },
  { id: "System E", values: { cpu: 88, memory: 82, io: 78, network: 85 } },
  { id: "System F", values: { cpu: 65, memory: 58, io: 60, network: 62 } },
]

const dimensions = ["cpu", "memory", "io", "network"]

export default function SplomChartUpper() {
  return (
    <SplomChart
      data={performanceData}
      dimensions={dimensions}
      variant="upper"
      showLabels
      showHistograms
      color="#10b981"
    />
  )
}
