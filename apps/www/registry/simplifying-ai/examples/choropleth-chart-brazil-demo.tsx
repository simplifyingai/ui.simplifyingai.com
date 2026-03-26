"use client"

import { ChoroplethChart } from "@/registry/simplifying-ai/ui/charts"

// Brazil Estados population data (in millions)
// State names match the GeoJSON "name" property
const populationData = [
  { id: "São Paulo", value: 46.6 },
  { id: "Minas Gerais", value: 21.4 },
  { id: "Rio de Janeiro", value: 17.5 },
  { id: "Bahia", value: 14.9 },
  { id: "Paraná", value: 11.6 },
  { id: "Rio Grande do Sul", value: 11.4 },
  { id: "Pernambuco", value: 9.6 },
  { id: "Ceará", value: 9.2 },
  { id: "Pará", value: 8.7 },
  { id: "Santa Catarina", value: 7.3 },
  { id: "Maranhão", value: 7.1 },
  { id: "Goiás", value: 7.1 },
  { id: "Amazonas", value: 4.2 },
  { id: "Paraíba", value: 4.1 },
  { id: "Espírito Santo", value: 4.1 },
  { id: "Rio Grande do Norte", value: 3.5 },
  { id: "Alagoas", value: 3.4 },
  { id: "Mato Grosso", value: 3.5 },
  { id: "Piauí", value: 3.3 },
  { id: "Distrito Federal", value: 3.1 },
  { id: "Mato Grosso do Sul", value: 2.8 },
  { id: "Sergipe", value: 2.3 },
  { id: "Rondônia", value: 1.8 },
  { id: "Tocantins", value: 1.6 },
  { id: "Acre", value: 0.9 },
  { id: "Amapá", value: 0.9 },
  { id: "Roraima", value: 0.6 },
]

export default function ChoroplethChartBrazilDemo() {
  return (
    <ChoroplethChart
      data={populationData}
      geoUrl="https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson"
      idProperty="name"
      legendTitle="Population (M)"
      colorScale={["#dcfce7", "#22c55e", "#166534"]}
      valueFormatter={(v) => `${v.toFixed(1)}M`}
      aspectRatio={1.1}
      projection="mercator"
    />
  )
}
