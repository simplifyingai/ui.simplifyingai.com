"use client"

import { ChoroplethChart } from "@/registry/simplifying-ai/ui/charts"

// France Régions population data (in millions)
// Region names match the GeoJSON "nom" property
const populationData = [
  { id: "Île-de-France", value: 12.3 },
  { id: "Auvergne-Rhône-Alpes", value: 8.0 },
  { id: "Hauts-de-France", value: 6.0 },
  { id: "Nouvelle-Aquitaine", value: 6.0 },
  { id: "Occitanie", value: 5.9 },
  { id: "Grand Est", value: 5.6 },
  { id: "Provence-Alpes-Côte d'Azur", value: 5.1 },
  { id: "Pays de la Loire", value: 3.8 },
  { id: "Normandie", value: 3.3 },
  { id: "Bretagne", value: 3.3 },
  { id: "Bourgogne-Franche-Comté", value: 2.8 },
  { id: "Centre-Val de Loire", value: 2.6 },
  { id: "Corse", value: 0.3 },
]

export default function ChoroplethChartFranceDemo() {
  return (
    <ChoroplethChart
      data={populationData}
      geoUrl="https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions-version-simplifiee.geojson"
      idProperty="nom"
      legendTitle="Population (M)"
      colorScale={["#bfdbfe", "#60a5fa", "#1e40af"]}
      valueFormatter={(v) => `${v.toFixed(1)}M`}
      aspectRatio={1.2}
      projection="mercator"
    />
  )
}
