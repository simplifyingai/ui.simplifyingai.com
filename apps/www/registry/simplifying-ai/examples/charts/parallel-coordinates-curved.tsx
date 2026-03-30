"use client"

import { ParallelCoordinates } from "@/registry/simplifying-ai/ui/charts/statistical/parallel-coordinates"

// Iris dataset style - measurements of flowers
const flowerData = [
  {
    id: "Sample 1",
    values: {
      sepalLength: 5.1,
      sepalWidth: 3.5,
      petalLength: 1.4,
      petalWidth: 0.2,
    },
  },
  {
    id: "Sample 2",
    values: {
      sepalLength: 4.9,
      sepalWidth: 3.0,
      petalLength: 1.4,
      petalWidth: 0.2,
    },
  },
  {
    id: "Sample 3",
    values: {
      sepalLength: 7.0,
      sepalWidth: 3.2,
      petalLength: 4.7,
      petalWidth: 1.4,
    },
  },
  {
    id: "Sample 4",
    values: {
      sepalLength: 6.4,
      sepalWidth: 3.2,
      petalLength: 4.5,
      petalWidth: 1.5,
    },
  },
  {
    id: "Sample 5",
    values: {
      sepalLength: 6.3,
      sepalWidth: 3.3,
      petalLength: 6.0,
      petalWidth: 2.5,
    },
  },
  {
    id: "Sample 6",
    values: {
      sepalLength: 5.8,
      sepalWidth: 2.7,
      petalLength: 5.1,
      petalWidth: 1.9,
    },
  },
  {
    id: "Sample 7",
    values: {
      sepalLength: 5.0,
      sepalWidth: 3.4,
      petalLength: 1.5,
      petalWidth: 0.2,
    },
  },
  {
    id: "Sample 8",
    values: {
      sepalLength: 6.9,
      sepalWidth: 3.1,
      petalLength: 4.9,
      petalWidth: 1.5,
    },
  },
]

const dimensions = ["sepalLength", "sepalWidth", "petalLength", "petalWidth"]

export default function ParallelCoordinatesCurved() {
  return (
    <ParallelCoordinates
      data={flowerData}
      dimensions={dimensions}
      variant="curved"
      showLabels
      showValues
      color="#8b5cf6"
      lineOpacity={0.5}
      valueFormatter={(v) => v.toFixed(1)}
    />
  )
}
