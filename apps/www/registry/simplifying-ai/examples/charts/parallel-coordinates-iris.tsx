"use client"

import { ParallelCoordinates } from "@/registry/simplifying-ai/ui/charts/statistical/parallel-coordinates"

// Sample iris-like data
const irisData = [
  { id: "Setosa 1", values: { sepalLength: 5.1, sepalWidth: 3.5, petalLength: 1.4, petalWidth: 0.2 }, group: "Setosa" },
  { id: "Setosa 2", values: { sepalLength: 4.9, sepalWidth: 3.0, petalLength: 1.4, petalWidth: 0.2 }, group: "Setosa" },
  { id: "Setosa 3", values: { sepalLength: 5.0, sepalWidth: 3.4, petalLength: 1.5, petalWidth: 0.2 }, group: "Setosa" },
  { id: "Versicolor 1", values: { sepalLength: 6.3, sepalWidth: 2.5, petalLength: 4.9, petalWidth: 1.5 }, group: "Versicolor" },
  { id: "Versicolor 2", values: { sepalLength: 6.1, sepalWidth: 2.8, petalLength: 4.0, petalWidth: 1.3 }, group: "Versicolor" },
  { id: "Versicolor 3", values: { sepalLength: 5.7, sepalWidth: 2.8, petalLength: 4.5, petalWidth: 1.3 }, group: "Versicolor" },
  { id: "Virginica 1", values: { sepalLength: 7.2, sepalWidth: 3.6, petalLength: 6.1, petalWidth: 2.5 }, group: "Virginica" },
  { id: "Virginica 2", values: { sepalLength: 6.8, sepalWidth: 3.0, petalLength: 5.5, petalWidth: 2.1 }, group: "Virginica" },
  { id: "Virginica 3", values: { sepalLength: 7.7, sepalWidth: 2.8, petalLength: 6.7, petalWidth: 2.0 }, group: "Virginica" },
]

const dimensions = ["sepalLength", "sepalWidth", "petalLength", "petalWidth"]

export default function ParallelCoordinatesIris() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <ParallelCoordinates
        data={irisData}
        dimensions={dimensions}
        showLabels
        showValues
        lineOpacity={0.7}
        colorScheme={["#ef4444", "#22c55e", "#3b82f6"]}
      />
    </div>
  )
}
