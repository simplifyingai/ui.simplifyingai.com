"use client"

import * as React from "react"

import { PieChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { label: "January", value: 186, color: "#2563eb" },
  { label: "February", value: 305, color: "#3b82f6" },
  { label: "March", value: 237, color: "#60a5fa" },
  { label: "April", value: 173, color: "#93c5fd" },
  { label: "May", value: 209, color: "#bfdbfe" },
]

const selectionOptions = [
  { key: "january", label: "January" },
  { key: "february", label: "February" },
  { key: "march", label: "March" },
  { key: "april", label: "April" },
  { key: "may", label: "May" },
]

export default function PieChartInteractiveDemo() {
  const [selectedKey, setSelectedKey] = React.useState("january")

  return (
    <div className="w-full max-w-md">
      <PieChart
        data={data}
        variant="interactive"
        selectionOptions={selectionOptions}
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}
        centerLabel="Visitors"
      />
    </div>
  )
}
