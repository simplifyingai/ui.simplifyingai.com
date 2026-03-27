"use client"

import { BulletChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  {
    label: "Revenue",
    value: 275,
    target: 250,
    ranges: [150, 225, 300] as [number, number, number],
  },
  {
    label: "Profit",
    value: 85,
    target: 100,
    ranges: [50, 75, 120] as [number, number, number],
  },
  {
    label: "Orders",
    value: 320,
    target: 300,
    ranges: [200, 275, 350] as [number, number, number],
  },
  {
    label: "Satisfaction",
    value: 4.5,
    target: 4.2,
    ranges: [3.0, 4.0, 5.0] as [number, number, number],
  },
]

export default function BulletChartDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <BulletChart data={data} />
    </div>
  )
}
