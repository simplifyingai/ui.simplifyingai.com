"use client"

import { ParallelCoordinates } from "@/registry/simplifying-ai/ui/charts/statistical/parallel-coordinates"

const carData = [
  { id: "Model A", values: { mpg: 32, cylinders: 4, horsepower: 110, weight: 2500, acceleration: 17 }, group: "Economy" },
  { id: "Model B", values: { mpg: 28, cylinders: 6, horsepower: 150, weight: 3200, acceleration: 14 }, group: "Midsize" },
  { id: "Model C", values: { mpg: 18, cylinders: 8, horsepower: 280, weight: 4000, acceleration: 11 }, group: "Performance" },
  { id: "Model D", values: { mpg: 35, cylinders: 4, horsepower: 95, weight: 2300, acceleration: 18 }, group: "Economy" },
  { id: "Model E", values: { mpg: 25, cylinders: 6, horsepower: 175, weight: 3400, acceleration: 13 }, group: "Midsize" },
  { id: "Model F", values: { mpg: 15, cylinders: 8, horsepower: 320, weight: 4200, acceleration: 10 }, group: "Performance" },
  { id: "Model G", values: { mpg: 30, cylinders: 4, horsepower: 125, weight: 2700, acceleration: 16 }, group: "Economy" },
  { id: "Model H", values: { mpg: 22, cylinders: 6, horsepower: 200, weight: 3600, acceleration: 12 }, group: "Midsize" },
]

const dimensions = ["mpg", "cylinders", "horsepower", "weight", "acceleration"]

export default function ParallelCoordinatesDemo() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <ParallelCoordinates
        data={carData}
        dimensions={dimensions}
        showLabels
        showValues
        lineOpacity={0.6}
      />
    </div>
  )
}
