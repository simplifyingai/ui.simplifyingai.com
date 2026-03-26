"use client"

import { ChoroplethChart } from "@/registry/simplifying-ai/ui/charts"

// US States population data (in millions)
const populationData = [
  { id: "California", value: 39.5 },
  { id: "Texas", value: 29.1 },
  { id: "Florida", value: 21.5 },
  { id: "New York", value: 20.2 },
  { id: "Pennsylvania", value: 13.0 },
  { id: "Illinois", value: 12.8 },
  { id: "Ohio", value: 11.8 },
  { id: "Georgia", value: 10.7 },
  { id: "North Carolina", value: 10.4 },
  { id: "Michigan", value: 10.0 },
  { id: "New Jersey", value: 9.3 },
  { id: "Virginia", value: 8.6 },
  { id: "Washington", value: 7.6 },
  { id: "Arizona", value: 7.3 },
  { id: "Massachusetts", value: 7.0 },
  { id: "Tennessee", value: 6.9 },
  { id: "Indiana", value: 6.8 },
  { id: "Maryland", value: 6.2 },
  { id: "Missouri", value: 6.2 },
  { id: "Wisconsin", value: 5.9 },
  { id: "Colorado", value: 5.8 },
  { id: "Minnesota", value: 5.7 },
  { id: "South Carolina", value: 5.1 },
  { id: "Alabama", value: 5.0 },
  { id: "Louisiana", value: 4.7 },
  { id: "Kentucky", value: 4.5 },
  { id: "Oregon", value: 4.2 },
  { id: "Oklahoma", value: 4.0 },
  { id: "Connecticut", value: 3.6 },
  { id: "Utah", value: 3.3 },
  { id: "Iowa", value: 3.2 },
  { id: "Nevada", value: 3.1 },
  { id: "Arkansas", value: 3.0 },
  { id: "Mississippi", value: 3.0 },
  { id: "Kansas", value: 2.9 },
  { id: "New Mexico", value: 2.1 },
  { id: "Nebraska", value: 2.0 },
  { id: "Idaho", value: 1.9 },
  { id: "West Virginia", value: 1.8 },
  { id: "Hawaii", value: 1.5 },
  { id: "New Hampshire", value: 1.4 },
  { id: "Maine", value: 1.4 },
  { id: "Rhode Island", value: 1.1 },
  { id: "Montana", value: 1.1 },
  { id: "Delaware", value: 1.0 },
  { id: "South Dakota", value: 0.9 },
  { id: "North Dakota", value: 0.8 },
  { id: "Alaska", value: 0.7 },
  { id: "Vermont", value: 0.6 },
  { id: "Wyoming", value: 0.6 },
]

export default function ChoroplethChartUSADemo() {
  return (
    <ChoroplethChart
      data={populationData}
      geoUrl="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"
      topojsonObject="states"
      legendTitle="Population (M)"
      colorScale={["#dbeafe", "#3b82f6", "#1e3a8a"]}
      valueFormatter={(v) => `${v.toFixed(1)}M`}
      aspectRatio={1.6}
      projection="albersUsa"
    />
  )
}
