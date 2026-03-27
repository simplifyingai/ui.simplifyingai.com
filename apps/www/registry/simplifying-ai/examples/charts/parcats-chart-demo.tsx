"use client"

import { ParcatsChart } from "@/registry/simplifying-ai/ui/charts/statistical/parcats-chart"

const surveyData = [
  { id: "1", categories: { Gender: "Male", Age: "18-24", Device: "Mobile" } },
  { id: "2", categories: { Gender: "Female", Age: "25-34", Device: "Desktop" } },
  { id: "3", categories: { Gender: "Male", Age: "25-34", Device: "Mobile" } },
  { id: "4", categories: { Gender: "Female", Age: "18-24", Device: "Tablet" } },
  { id: "5", categories: { Gender: "Male", Age: "35-44", Device: "Desktop" } },
  { id: "6", categories: { Gender: "Female", Age: "35-44", Device: "Mobile" } },
  { id: "7", categories: { Gender: "Male", Age: "18-24", Device: "Desktop" } },
  { id: "8", categories: { Gender: "Female", Age: "25-34", Device: "Mobile" } },
  { id: "9", categories: { Gender: "Male", Age: "25-34", Device: "Tablet" } },
  { id: "10", categories: { Gender: "Female", Age: "45+", Device: "Desktop" } },
  { id: "11", categories: { Gender: "Male", Age: "45+", Device: "Mobile" } },
  { id: "12", categories: { Gender: "Female", Age: "18-24", Device: "Mobile" } },
]

const dimensions = ["Gender", "Age", "Device"]

export default function ParcatsChartDemo() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <ParcatsChart
        data={surveyData}
        dimensions={dimensions}
        bundleColors
        showCounts
      />
    </div>
  )
}
