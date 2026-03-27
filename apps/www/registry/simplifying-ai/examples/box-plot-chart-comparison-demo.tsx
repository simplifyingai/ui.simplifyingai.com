"use client"

import * as React from "react"

import { BoxPlotChart } from "@/registry/simplifying-ai/ui/charts"

const controlData = [
  {
    label: "Week 1",
    values: [42, 45, 48, 52, 55, 58, 60, 62, 65, 68],
    color: "#2563eb",
  },
  {
    label: "Week 2",
    values: [44, 48, 52, 55, 58, 62, 65, 68, 70, 72],
    color: "#2563eb",
  },
  {
    label: "Week 3",
    values: [46, 50, 54, 58, 62, 65, 68, 70, 72, 75],
    color: "#2563eb",
  },
  {
    label: "Week 4",
    values: [48, 52, 56, 60, 64, 68, 70, 72, 75, 78],
    color: "#2563eb",
  },
]

const experimentData = [
  {
    label: "Week 1",
    values: [52, 58, 62, 68, 72, 75, 78, 82, 85, 88],
    color: "#60a5fa",
  },
  {
    label: "Week 2",
    values: [58, 65, 70, 75, 80, 85, 88, 92, 95, 98],
    color: "#60a5fa",
  },
  {
    label: "Week 3",
    values: [65, 72, 78, 82, 88, 92, 95, 100, 105, 108],
    color: "#60a5fa",
  },
  {
    label: "Week 4",
    values: [72, 80, 85, 90, 95, 100, 105, 110, 115, 120],
    color: "#60a5fa",
  },
]

export default function BoxPlotChartComparisonDemo() {
  const [activeGroup, setActiveGroup] = React.useState<
    "control" | "experiment"
  >("control")

  const data = activeGroup === "control" ? controlData : experimentData

  return (
    <div className="w-full">
      {/* Toggle buttons */}
      <div className="mb-4 flex gap-2">
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeGroup === "control"
              ? "bg-[#2563eb] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          onClick={() => setActiveGroup("control")}
        >
          Control Group
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeGroup === "experiment"
              ? "bg-[#60a5fa] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          onClick={() => setActiveGroup("experiment")}
        >
          Experiment Group
        </button>
      </div>

      <BoxPlotChart
        data={data}
        showGrid
        showTooltip
        showOutliers
        aspectRatio={2}
      />

      {/* Summary */}
      <div className="mt-4 flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-sm bg-[#2563eb]" />
          <span className="text-muted-foreground">Control: Baseline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-sm bg-[#60a5fa]" />
          <span className="text-muted-foreground">Experiment: +40% avg</span>
        </div>
      </div>
    </div>
  )
}
