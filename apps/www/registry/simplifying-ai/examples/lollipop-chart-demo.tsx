"use client"

import { LollipopChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "TYC", value: 2.3, group: "4 cyl" },
  { category: "F28", value: 2.0, group: "4 cyl" },
  { category: "HCV", value: 1.7, group: "4 cyl" },
  { category: "LEU", value: 1.7, group: "4 cyl" },
  { category: "FX9", value: 1.2, group: "4 cyl" },
  { category: "P91", value: 1.0, group: "4 cyl" },
  { category: "M24", value: 0.7, group: "4 cyl" },
  { category: "MRX", value: 0.2, group: "6 cyl" },
  { category: "H4D", value: 0.2, group: "6 cyl" },
  { category: "FDN", value: 0.0, group: "6 cyl" },
  { category: "M28", value: -0.1, group: "6 cyl" },
  { category: "VAL", value: -0.2, group: "6 cyl" },
  { category: "M2C", value: -0.4, group: "6 cyl" },
  { category: "HSB", value: -0.2, group: "8 cyl" },
  { category: "M4S", value: -0.4, group: "8 cyl" },
  { category: "M4E", value: -0.6, group: "8 cyl" },
  { category: "DCH", value: -0.8, group: "8 cyl" },
  { category: "AMJ", value: -0.8, group: "8 cyl" },
  { category: "CZ8", value: -1.1, group: "8 cyl" },
  { category: "CFL", value: -1.6, group: "8 cyl" },
]

export default function LollipopChartDemo() {
  return <LollipopChart data={data} dotSize={10} yAxisLabel="mpg_z" />
}
