"use client"

import { ChoroplethChart } from "@/registry/simplifying-ai/ui/charts"

// UK Local Authorities population data (in millions)
// Names match the datamaps TopoJSON "name" property
const populationData = [
  { id: "Birmingham", value: 1.1 },
  { id: "Leeds", value: 0.8 },
  { id: "Glasgow", value: 0.6 },
  { id: "Sheffield", value: 0.6 },
  { id: "Bradford", value: 0.5 },
  { id: "Manchester", value: 0.5 },
  { id: "Liverpool", value: 0.5 },
  { id: "Edinburgh", value: 0.5 },
  { id: "Bristol", value: 0.5 },
  { id: "Cardiff", value: 0.4 },
  { id: "Belfast", value: 0.3 },
  { id: "Leicester", value: 0.4 },
  { id: "Wakefield", value: 0.3 },
  { id: "Coventry", value: 0.4 },
  { id: "Nottingham", value: 0.3 },
  { id: "Newcastle upon Tyne", value: 0.3 },
  { id: "Sunderland", value: 0.3 },
  { id: "Brighton and Hove", value: 0.3 },
  { id: "Hull", value: 0.3 },
  { id: "Plymouth", value: 0.3 },
]

export default function ChoroplethChartUKDemo() {
  return (
    <ChoroplethChart
      data={populationData}
      geoUrl="https://raw.githubusercontent.com/markmarkoh/datamaps/master/src/js/data/gbr.topo.json"
      topojsonObject="gbr"
      idProperty="name"
      legendTitle="Population (M)"
      colorScale={["#dbeafe", "#3b82f6", "#1e3a8a"]}
      valueFormatter={(v) => `${v.toFixed(1)}M`}
      aspectRatio={1.5}
      projection="mercator"
    />
  )
}
