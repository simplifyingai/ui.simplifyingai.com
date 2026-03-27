"use client"

import { ChoroplethChart } from "@/registry/simplifying-ai/ui/charts"

// Sample GDP data for major countries (in trillion USD)
// IDs are ISO 3166-1 numeric codes used by world-atlas
const gdpData = [
  { id: "840", value: 25.5 }, // United States
  { id: "156", value: 17.9 }, // China
  { id: "392", value: 4.2 }, // Japan
  { id: "276", value: 4.1 }, // Germany
  { id: "356", value: 3.4 }, // India
  { id: "826", value: 3.1 }, // United Kingdom
  { id: "250", value: 2.8 }, // France
  { id: "380", value: 2.1 }, // Italy
  { id: "076", value: 1.9 }, // Brazil
  { id: "124", value: 2.1 }, // Canada
  { id: "643", value: 1.8 }, // Russia
  { id: "410", value: 1.7 }, // South Korea
  { id: "036", value: 1.7 }, // Australia
  { id: "724", value: 1.4 }, // Spain
  { id: "484", value: 1.3 }, // Mexico
  { id: "360", value: 1.2 }, // Indonesia
  { id: "528", value: 1.0 }, // Netherlands
  { id: "682", value: 1.1 }, // Saudi Arabia
  { id: "756", value: 0.8 }, // Switzerland
  { id: "792", value: 0.9 }, // Turkey
  { id: "616", value: 0.7 }, // Poland
  { id: "764", value: 0.5 }, // Thailand
  { id: "032", value: 0.6 }, // Argentina
  { id: "710", value: 0.4 }, // South Africa
  { id: "566", value: 0.5 }, // Nigeria
  { id: "818", value: 0.5 }, // Egypt
  { id: "586", value: 0.3 }, // Pakistan
  { id: "704", value: 0.4 }, // Vietnam
  { id: "152", value: 0.3 }, // Chile
  { id: "458", value: 0.4 }, // Malaysia
  { id: "702", value: 0.4 }, // Singapore
  { id: "608", value: 0.4 }, // Philippines
  { id: "578", value: 0.6 }, // Norway
  { id: "040", value: 0.5 }, // Austria
  { id: "372", value: 0.5 }, // Ireland
  { id: "784", value: 0.5 }, // UAE
  { id: "376", value: 0.5 }, // Israel
]

export default function ChoroplethChartDemo() {
  return (
    <ChoroplethChart
      data={gdpData}
      legendTitle="GDP (Trillion $)"
      colorScale={["#bfdbfe", "#60a5fa", "#1e40af"]}
      valueFormatter={(v) => `$${v.toFixed(1)}T`}
      aspectRatio={2}
    />
  )
}
