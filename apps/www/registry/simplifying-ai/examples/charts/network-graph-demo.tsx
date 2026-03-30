"use client"

import { NetworkGraph } from "@/registry/simplifying-ai/ui/charts/specialized/network-graph"

const nodes = [
  { id: "Alice", group: "Team A" },
  { id: "Bob", group: "Team A" },
  { id: "Carol", group: "Team B" },
  { id: "Dave", group: "Team B" },
  { id: "Eve", group: "Team C" },
  { id: "Frank", group: "Team C" },
  { id: "Grace", group: "Team A" },
  { id: "Henry", group: "Team B" },
]

const links = [
  { source: "Alice", target: "Bob", value: 2 },
  { source: "Alice", target: "Carol", value: 1 },
  { source: "Bob", target: "Dave", value: 1 },
  { source: "Carol", target: "Dave", value: 2 },
  { source: "Eve", target: "Frank", value: 2 },
  { source: "Eve", target: "Alice", value: 1 },
  { source: "Frank", target: "Grace", value: 1 },
  { source: "Grace", target: "Henry", value: 1 },
  { source: "Henry", target: "Carol", value: 1 },
  { source: "Dave", target: "Eve", value: 1 },
]

export default function NetworkGraphDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <NetworkGraph
        nodes={nodes}
        links={links}
        showLabels
        charge={-200}
        linkDistance={80}
      />
    </div>
  )
}
