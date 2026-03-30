"use client"

import { LollipopChart } from "@/registry/simplifying-ai/ui/charts"

const data = [
  { category: "TYC", value: 2.3, color: "#00BFC4", group: "4 cyl" },
  { category: "F28", value: 2.0, color: "#00BFC4", group: "4 cyl" },
  { category: "HCV", value: 1.7, color: "#00BFC4", group: "4 cyl" },
  { category: "LEU", value: 1.7, color: "#00BFC4", group: "4 cyl" },
  { category: "FX9", value: 1.2, color: "#00BFC4", group: "4 cyl" },
  { category: "P91", value: 1.0, color: "#00BFC4", group: "4 cyl" },
  { category: "M24", value: 0.7, color: "#00BFC4", group: "4 cyl" },
  { category: "MRX", value: 0.2, color: "#F8766D", group: "6 cyl" },
  { category: "H4D", value: 0.2, color: "#F8766D", group: "6 cyl" },
  { category: "FDN", value: 0.0, color: "#F8766D", group: "6 cyl" },
  { category: "M28", value: -0.1, color: "#F8766D", group: "6 cyl" },
  { category: "VAL", value: -0.2, color: "#F8766D", group: "6 cyl" },
  { category: "M2C", value: -0.4, color: "#F8766D", group: "6 cyl" },
  { category: "HSB", value: -0.2, color: "#7CAE00", group: "8 cyl" },
  { category: "M4S", value: -0.4, color: "#7CAE00", group: "8 cyl" },
  { category: "M4E", value: -0.6, color: "#7CAE00", group: "8 cyl" },
  { category: "DCH", value: -0.8, color: "#7CAE00", group: "8 cyl" },
  { category: "AMJ", value: -0.8, color: "#7CAE00", group: "8 cyl" },
  { category: "CZ8", value: -1.1, color: "#7CAE00", group: "8 cyl" },
  { category: "CFL", value: -1.6, color: "#7CAE00", group: "8 cyl" },
]

export default function LollipopChartDemo() {
  return <LollipopChart data={data} dotSize={10} yAxisLabel="mpg_z" />
}
