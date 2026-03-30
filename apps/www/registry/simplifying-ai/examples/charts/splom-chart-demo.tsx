"use client"

import { SplomChart } from "@/registry/simplifying-ai/ui/charts/statistical/splom-chart"

const irisData = [
  {
    id: "Setosa 1",
    values: { sepalL: 5.1, sepalW: 3.5, petalL: 1.4, petalW: 0.2 },
    group: "Setosa",
  },
  {
    id: "Setosa 2",
    values: { sepalL: 4.9, sepalW: 3.0, petalL: 1.4, petalW: 0.2 },
    group: "Setosa",
  },
  {
    id: "Setosa 3",
    values: { sepalL: 4.7, sepalW: 3.2, petalL: 1.3, petalW: 0.2 },
    group: "Setosa",
  },
  {
    id: "Setosa 4",
    values: { sepalL: 5.0, sepalW: 3.6, petalL: 1.4, petalW: 0.2 },
    group: "Setosa",
  },
  {
    id: "Setosa 5",
    values: { sepalL: 5.4, sepalW: 3.9, petalL: 1.7, petalW: 0.4 },
    group: "Setosa",
  },
  {
    id: "Versicolor 1",
    values: { sepalL: 7.0, sepalW: 3.2, petalL: 4.7, petalW: 1.4 },
    group: "Versicolor",
  },
  {
    id: "Versicolor 2",
    values: { sepalL: 6.4, sepalW: 3.2, petalL: 4.5, petalW: 1.5 },
    group: "Versicolor",
  },
  {
    id: "Versicolor 3",
    values: { sepalL: 6.9, sepalW: 3.1, petalL: 4.9, petalW: 1.5 },
    group: "Versicolor",
  },
  {
    id: "Versicolor 4",
    values: { sepalL: 5.5, sepalW: 2.3, petalL: 4.0, petalW: 1.3 },
    group: "Versicolor",
  },
  {
    id: "Versicolor 5",
    values: { sepalL: 6.5, sepalW: 2.8, petalL: 4.6, petalW: 1.5 },
    group: "Versicolor",
  },
  {
    id: "Virginica 1",
    values: { sepalL: 6.3, sepalW: 3.3, petalL: 6.0, petalW: 2.5 },
    group: "Virginica",
  },
  {
    id: "Virginica 2",
    values: { sepalL: 5.8, sepalW: 2.7, petalL: 5.1, petalW: 1.9 },
    group: "Virginica",
  },
  {
    id: "Virginica 3",
    values: { sepalL: 7.1, sepalW: 3.0, petalL: 5.9, petalW: 2.1 },
    group: "Virginica",
  },
  {
    id: "Virginica 4",
    values: { sepalL: 6.3, sepalW: 2.9, petalL: 5.6, petalW: 1.8 },
    group: "Virginica",
  },
  {
    id: "Virginica 5",
    values: { sepalL: 6.5, sepalW: 3.0, petalL: 5.8, petalW: 2.2 },
    group: "Virginica",
  },
]

const dimensions = ["sepalL", "sepalW", "petalL", "petalW"]

export default function SplomChartDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SplomChart
        data={irisData}
        dimensions={dimensions}
        cellSize={100}
        showLabels
        showHistograms
        colorScheme={["#2563eb", "#dc2626", "#059669"]}
      />
    </div>
  )
}
