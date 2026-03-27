"use client"

import { ChoroplethChart } from "@/registry/simplifying-ai/ui/charts"

// Germany Bundesländer population data (in millions)
// State names match the GeoJSON "name" property (German names)
const populationData = [
  { id: "Nordrhein-Westfalen", value: 17.9 },
  { id: "Bayern", value: 13.1 },
  { id: "Baden-Württemberg", value: 11.1 },
  { id: "Niedersachsen", value: 8.0 },
  { id: "Hessen", value: 6.3 },
  { id: "Sachsen", value: 4.1 },
  { id: "Rheinland-Pfalz", value: 4.1 },
  { id: "Berlin", value: 3.6 },
  { id: "Schleswig-Holstein", value: 2.9 },
  { id: "Brandenburg", value: 2.5 },
  { id: "Sachsen-Anhalt", value: 2.2 },
  { id: "Thüringen", value: 2.1 },
  { id: "Hamburg", value: 1.9 },
  { id: "Mecklenburg-Vorpommern", value: 1.6 },
  { id: "Saarland", value: 1.0 },
  { id: "Bremen", value: 0.7 },
]

export default function ChoroplethChartGermanyDemo() {
  return (
    <ChoroplethChart
      data={populationData}
      geoUrl="https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/master/2_bundeslaender/4_niedrig.geo.json"
      idProperty="name"
      legendTitle="Population (M)"
      colorScale={["#bfdbfe", "#60a5fa", "#1e40af"]}
      valueFormatter={(v) => `${v.toFixed(1)}M`}
      aspectRatio={1.3}
      projection="mercator"
    />
  )
}
