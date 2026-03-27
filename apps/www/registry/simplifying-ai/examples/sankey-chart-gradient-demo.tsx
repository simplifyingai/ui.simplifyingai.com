"use client"

import { SankeyChart } from "@/registry/simplifying-ai/ui/charts"

// Budget allocation with gradient links
const nodes = [
  { id: "revenue", name: "Total Revenue", color: "#1e40af" },
  { id: "opex", name: "Operating Expenses", color: "#2563eb" },
  { id: "capex", name: "Capital Expenses", color: "#3b82f6" },
  { id: "profit", name: "Net Profit", color: "#60a5fa" },
  { id: "salaries", name: "Salaries", color: "#93c5fd" },
  { id: "marketing", name: "Marketing", color: "#bfdbfe" },
  { id: "rd", name: "R&D", color: "#1e40af" },
  { id: "equipment", name: "Equipment", color: "#2563eb" },
  { id: "facilities", name: "Facilities", color: "#3b82f6" },
  { id: "dividends", name: "Dividends", color: "#60a5fa" },
  { id: "reinvest", name: "Reinvestment", color: "#93c5fd" },
]

const links = [
  { source: "revenue", target: "opex", value: 450, color: "#3b82f6" },
  { source: "revenue", target: "capex", value: 200, color: "#60a5fa" },
  { source: "revenue", target: "profit", value: 350, color: "#93c5fd" },
  { source: "opex", target: "salaries", value: 250, color: "#2563eb" },
  { source: "opex", target: "marketing", value: 120, color: "#3b82f6" },
  { source: "opex", target: "rd", value: 80, color: "#60a5fa" },
  { source: "capex", target: "equipment", value: 120, color: "#3b82f6" },
  { source: "capex", target: "facilities", value: 80, color: "#60a5fa" },
  { source: "profit", target: "dividends", value: 150, color: "#93c5fd" },
  { source: "profit", target: "reinvest", value: 200, color: "#bfdbfe" },
]

export default function SankeyChartGradientDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SankeyChart
        nodes={nodes}
        links={links}
        nodeWidth={14}
        nodePadding={14}
        width={600}
        height={360}
        linkOpacity={0.6}
        margin={{ top: 20, right: 90, bottom: 20, left: 100 }}
      />
    </div>
  )
}
