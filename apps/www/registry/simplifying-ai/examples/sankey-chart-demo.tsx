"use client"

import { SankeyChart } from "@/registry/simplifying-ai/ui/charts"

const nodes = [
  { id: "organic", name: "Organic Search" },
  { id: "paid", name: "Paid Ads" },
  { id: "social", name: "Social Media" },
  { id: "landing", name: "Landing Page" },
  { id: "product", name: "Product Page" },
  { id: "cart", name: "Cart" },
  { id: "checkout", name: "Checkout" },
  { id: "purchase", name: "Purchase" },
]

const links = [
  { source: "organic", target: "landing", value: 500 },
  { source: "paid", target: "landing", value: 300 },
  { source: "social", target: "landing", value: 200 },
  { source: "landing", target: "product", value: 600 },
  { source: "product", target: "cart", value: 400 },
  { source: "cart", target: "checkout", value: 300 },
  { source: "checkout", target: "purchase", value: 250 },
]

export default function SankeyChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <SankeyChart
        nodes={nodes}
        links={links}
        nodeWidth={20}
        nodePadding={15}
      />
    </div>
  )
}
