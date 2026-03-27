"use client"

import { SankeyChart } from "@/registry/simplifying-ai/ui/charts"

// Complex multi-level user journey
const nodes = [
  // Level 1 - Traffic Sources
  { id: "google", name: "Google", color: "#1e40af" },
  { id: "facebook", name: "Facebook", color: "#2563eb" },
  { id: "twitter", name: "Twitter", color: "#3b82f6" },
  { id: "direct", name: "Direct", color: "#60a5fa" },
  // Level 2 - Entry Pages
  { id: "home", name: "Homepage", color: "#93c5fd" },
  { id: "blog", name: "Blog", color: "#bfdbfe" },
  { id: "product", name: "Products", color: "#1e40af" },
  // Level 3 - Actions
  { id: "browse", name: "Browse", color: "#2563eb" },
  { id: "search", name: "Search", color: "#3b82f6" },
  { id: "add_cart", name: "Add to Cart", color: "#60a5fa" },
  // Level 4 - Outcomes
  { id: "purchase", name: "Purchase", color: "#1e40af" },
  { id: "abandon", name: "Abandon", color: "#93c5fd" },
  { id: "subscribe", name: "Subscribe", color: "#2563eb" },
]

const links = [
  // Traffic to Entry
  { source: "google", target: "home", value: 300 },
  { source: "google", target: "product", value: 200 },
  { source: "facebook", target: "home", value: 180 },
  { source: "facebook", target: "blog", value: 120 },
  { source: "twitter", target: "blog", value: 100 },
  { source: "twitter", target: "home", value: 50 },
  { source: "direct", target: "home", value: 250 },
  { source: "direct", target: "product", value: 150 },
  // Entry to Actions
  { source: "home", target: "browse", value: 400 },
  { source: "home", target: "search", value: 280 },
  { source: "blog", target: "subscribe", value: 120 },
  { source: "blog", target: "browse", value: 100 },
  { source: "product", target: "add_cart", value: 250 },
  { source: "product", target: "browse", value: 100 },
  // Actions to Outcomes
  { source: "browse", target: "add_cart", value: 300 },
  { source: "browse", target: "abandon", value: 300 },
  { source: "search", target: "add_cart", value: 180 },
  { source: "search", target: "abandon", value: 100 },
  { source: "add_cart", target: "purchase", value: 450 },
  { source: "add_cart", target: "abandon", value: 280 },
]

export default function SankeyChartMultilevelDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SankeyChart
        nodes={nodes}
        links={links}
        nodeWidth={12}
        nodePadding={10}
        width={600}
        height={380}
        linkOpacity={0.45}
        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
      />
    </div>
  )
}
