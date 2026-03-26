"use client"

import { ChoroplethChart } from "@/registry/simplifying-ai/ui/charts"

// China Provinces GDP data (in trillion CNY)
// Province names match the datamaps TopoJSON "name" property
const gdpData = [
  { id: "Guangdong", value: 12.4 },
  { id: "Jiangsu", value: 11.6 },
  { id: "Shandong", value: 8.3 },
  { id: "Zhejiang", value: 7.4 },
  { id: "Henan", value: 5.9 },
  { id: "Sichuan", value: 5.4 },
  { id: "Hubei", value: 5.0 },
  { id: "Fujian", value: 4.9 },
  { id: "Hunan", value: 4.6 },
  { id: "Shanghai", value: 4.3 },
  { id: "Anhui", value: 4.3 },
  { id: "Beijing", value: 4.0 },
  { id: "Hebei", value: 4.0 },
  { id: "Shaanxi", value: 3.0 },
  { id: "Jiangxi", value: 2.9 },
  { id: "Chongqing", value: 2.8 },
  { id: "Liaoning", value: 2.8 },
  { id: "Yunnan", value: 2.7 },
  { id: "Guangxi", value: 2.5 },
  { id: "Guizhou", value: 2.0 },
  { id: "Shanxi", value: 2.0 },
  { id: "Nei Mongol", value: 2.0 },
  { id: "Xinjiang", value: 1.6 },
  { id: "Tianjin", value: 1.6 },
  { id: "Heilongjiang", value: 1.5 },
  { id: "Jilin", value: 1.3 },
  { id: "Gansu", value: 1.1 },
  { id: "Hainan", value: 0.6 },
  { id: "Ningxia", value: 0.5 },
  { id: "Qinghai", value: 0.4 },
  { id: "Xizang", value: 0.2 },
]

export default function ChoroplethChartChinaDemo() {
  return (
    <ChoroplethChart
      data={gdpData}
      geoUrl="https://raw.githubusercontent.com/markmarkoh/datamaps/master/src/js/data/chn.topo.json"
      topojsonObject="chn"
      idProperty="name"
      legendTitle="GDP (T CNY)"
      colorScale={["#fee2e2", "#ef4444", "#991b1b"]}
      valueFormatter={(v) => `¥${v.toFixed(1)}T`}
      aspectRatio={1.3}
      projection="mercator"
    />
  )
}
