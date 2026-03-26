"use client"

import { BoxPlotChart } from "@/registry/simplifying-ai/ui/charts"

// Data with intentional outliers
const data = [
  {
    label: "Dataset A",
    values: [
      5,
      10, // outliers below
      35,
      38,
      42,
      45,
      48,
      52,
      55,
      58,
      62,
      65,
      68,
      95,
      100, // outliers above
    ],
  },
  {
    label: "Dataset B",
    values: [40, 45, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82],
  },
  {
    label: "Dataset C",
    values: [
      15, // outlier below
      50,
      55,
      58,
      62,
      65,
      68,
      72,
      75,
      78,
      82,
      85,
      120,
      125, // outliers above
    ],
  },
]

export default function BoxPlotChartOutliersDemo() {
  return (
    <div className="w-full">
      <BoxPlotChart
        data={data}
        color="#2563eb"
        showGrid
        showTooltip
        showOutliers
        whiskerType="iqr"
        aspectRatio={2}
      />
      <p className="text-muted-foreground mt-3 text-center text-xs">
        Outliers are detected using IQR method (1.5 × IQR from quartiles)
      </p>
    </div>
  )
}
