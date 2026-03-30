"use client"

import { ParcatsChart } from "@/registry/simplifying-ai/ui/charts/statistical/parcats-chart"

// Traffic flow data with values (proportional ribbon widths)
const trafficData = [
  {
    id: "1",
    categories: { Source: "Direct", Device: "Desktop", Action: "Purchase" },
    value: 1200,
  },
  {
    id: "2",
    categories: { Source: "Direct", Device: "Mobile", Action: "Browse" },
    value: 800,
  },
  {
    id: "3",
    categories: { Source: "Search", Device: "Desktop", Action: "Purchase" },
    value: 950,
  },
  {
    id: "4",
    categories: { Source: "Search", Device: "Mobile", Action: "Browse" },
    value: 600,
  },
  {
    id: "5",
    categories: { Source: "Social", Device: "Mobile", Action: "Browse" },
    value: 450,
  },
  {
    id: "6",
    categories: { Source: "Social", Device: "Desktop", Action: "Purchase" },
    value: 300,
  },
  {
    id: "7",
    categories: { Source: "Email", Device: "Desktop", Action: "Purchase" },
    value: 550,
  },
  {
    id: "8",
    categories: { Source: "Email", Device: "Mobile", Action: "Browse" },
    value: 200,
  },
]

const dimensions = ["Source", "Device", "Action"]

export default function ParcatsChartRibbon() {
  return (
    <ParcatsChart
      data={trafficData}
      dimensions={dimensions}
      variant="ribbon"
      showCounts
      colorByCategory
    />
  )
}
