"use client"

import { BarChart } from "@/registry/simplifying-ai/ui/charts"

// 48 days is more categories than a phone has pixels — compressing them
// would leave bars thinner than the gaps between them.
const chartData = Array.from({ length: 48 }, (_, i) => ({
  label: `D${i + 1}`,
  value: 220 + Math.round(90 * Math.sin(i / 2.3) + 60 * Math.cos(i / 5)),
}))

export default function BarChartScrollDemo() {
  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">Scroll</span> — each bar
          keeps a floor width and the plot overflows sideways.
        </p>
        <BarChart
          data={chartData}
          overflow="scroll"
          minCategorySize={34}
          aspectRatio={{ base: 1.3, md: 2.6 }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">Zoom</span> — drag to
          select, pinch or ⌘-scroll to scale, double-click to reset.
        </p>
        <BarChart
          data={chartData}
          aspectRatio={{ base: 1.3, md: 2.6 }}
          wheelZoom
        />
      </div>
    </div>
  )
}
