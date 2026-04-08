"use client"

import { SankeyChart } from "@/registry/simplifying-ai/ui/charts"

// Website traffic flow - Sources to Destinations
// Colors are derived from CSS variables (--chart-1 through --chart-5)
const nodes = [
  // Sources (left)
  { id: "organic", name: "Organic" },
  { id: "paid", name: "Paid Ads" },
  { id: "social", name: "Social" },
  { id: "referral", name: "Referral" },
  // Destinations (right)
  { id: "signup", name: "Sign Up" },
  { id: "purchase", name: "Purchase" },
  { id: "bounce", name: "Bounce" },
]

const links = [
  // Organic traffic
  { source: "organic", target: "signup", value: 320 },
  { source: "organic", target: "purchase", value: 180 },
  { source: "organic", target: "bounce", value: 100 },
  // Paid ads
  { source: "paid", target: "signup", value: 200 },
  { source: "paid", target: "purchase", value: 250 },
  { source: "paid", target: "bounce", value: 150 },
  // Social
  { source: "social", target: "signup", value: 180 },
  { source: "social", target: "purchase", value: 80 },
  { source: "social", target: "bounce", value: 140 },
  // Referral
  { source: "referral", target: "signup", value: 100 },
  { source: "referral", target: "purchase", value: 120 },
  { source: "referral", target: "bounce", value: 80 },
]

export default function SankeyChartDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SankeyChart
        nodes={nodes}
        links={links}
        nodeWidth={16}
        nodePadding={16}
        width={600}
        height={340}
        margin={{ top: 20, right: 80, bottom: 20, left: 70 }}
      />
    </div>
  )
}
