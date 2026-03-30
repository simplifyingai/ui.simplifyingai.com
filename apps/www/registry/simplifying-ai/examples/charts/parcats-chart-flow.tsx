"use client"

import { ParcatsChart } from "@/registry/simplifying-ai/ui/charts/statistical/parcats-chart"

const userJourneyData = [
  {
    id: "1",
    categories: { Source: "Google", Landing: "Home", Action: "Purchase" },
  },
  {
    id: "2",
    categories: { Source: "Social", Landing: "Product", Action: "Purchase" },
  },
  {
    id: "3",
    categories: { Source: "Google", Landing: "Product", Action: "Browse" },
  },
  {
    id: "4",
    categories: { Source: "Direct", Landing: "Home", Action: "Browse" },
  },
  {
    id: "5",
    categories: { Source: "Social", Landing: "Blog", Action: "Subscribe" },
  },
  {
    id: "6",
    categories: { Source: "Google", Landing: "Home", Action: "Purchase" },
  },
  {
    id: "7",
    categories: { Source: "Email", Landing: "Product", Action: "Purchase" },
  },
  {
    id: "8",
    categories: { Source: "Direct", Landing: "Product", Action: "Purchase" },
  },
  {
    id: "9",
    categories: { Source: "Social", Landing: "Home", Action: "Browse" },
  },
  {
    id: "10",
    categories: { Source: "Google", Landing: "Blog", Action: "Subscribe" },
  },
  {
    id: "11",
    categories: { Source: "Email", Landing: "Home", Action: "Browse" },
  },
  {
    id: "12",
    categories: { Source: "Direct", Landing: "Blog", Action: "Subscribe" },
  },
]

const dimensions = ["Source", "Landing", "Action"]

export default function ParcatsChartFlow() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <ParcatsChart
        data={userJourneyData}
        dimensions={dimensions}
        bundleColors
        showCounts
        colorScheme={["#059669", "#0891b2", "#7c3aed", "#dc2626"]}
      />
    </div>
  )
}
