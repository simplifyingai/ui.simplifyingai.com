"use client"

import { MultiAreaChart } from "@/registry/simplifying-ai/ui/charts"

// Organic stock-like data with natural fluctuations for multiple series
const data = Array.from({ length: 30 }, (_, i) => {
  const desktopBase = [
    180, 175, 170, 185, 210, 245, 290, 340, 375, 380, 360, 320, 280, 250, 225,
    235, 220, 230, 240, 228, 218, 225, 235, 240, 232, 225, 220, 228, 225, 230,
  ]
  const mobileBase = [
    95, 88, 85, 100, 125, 155, 190, 225, 242, 245, 230, 200, 172, 150, 135, 145,
    132, 140, 148, 138, 130, 138, 145, 150, 142, 138, 132, 140, 138, 142,
  ]
  const tabletBase = [
    52, 48, 45, 55, 70, 92, 115, 138, 148, 150, 140, 120, 100, 85, 75, 82, 75,
    80, 88, 80, 75, 80, 85, 88, 82, 78, 75, 80, 78, 82,
  ]
  return {
    label: `${i + 1}`,
    desktop: desktopBase[i],
    mobile: mobileBase[i],
    tablet: tabletBase[i],
  }
})

const series = [
  {
    name: "Desktop",
    dataKey: "desktop",
    color: "#2563eb",
    gradientFrom: "#2563eb",
    gradientTo: "#93c5fd",
  },
  {
    name: "Mobile",
    dataKey: "mobile",
    color: "#8b5cf6",
    gradientFrom: "#8b5cf6",
    gradientTo: "#c4b5fd",
  },
  {
    name: "Tablet",
    dataKey: "tablet",
    color: "#10b981",
    gradientFrom: "#10b981",
    gradientTo: "#6ee7b7",
  },
]

export default function AreaChartMultiDemo() {
  return (
    <MultiAreaChart
      data={data}
      series={series}
      showGrid
      showTooltip
      showCursor
      showLegend
      curveType="linear"
      gradientOpacity={[0.5, 0.05]}
    />
  )
}
