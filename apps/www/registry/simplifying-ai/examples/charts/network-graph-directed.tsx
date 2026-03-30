"use client"

import { NetworkGraph } from "@/registry/simplifying-ai/ui/charts/specialized/network-graph"

const nodes = [
  { id: "API Gateway", group: "Frontend", size: 12 },
  { id: "Auth Service", group: "Services", size: 10 },
  { id: "User Service", group: "Services", size: 10 },
  { id: "Order Service", group: "Services", size: 10 },
  { id: "Payment Service", group: "Services", size: 10 },
  { id: "PostgreSQL", group: "Database", size: 8 },
  { id: "Redis", group: "Database", size: 8 },
  { id: "RabbitMQ", group: "Queue", size: 8 },
]

const links = [
  { source: "API Gateway", target: "Auth Service" },
  { source: "API Gateway", target: "User Service" },
  { source: "API Gateway", target: "Order Service" },
  { source: "Auth Service", target: "PostgreSQL" },
  { source: "Auth Service", target: "Redis" },
  { source: "User Service", target: "PostgreSQL" },
  { source: "Order Service", target: "PostgreSQL" },
  { source: "Order Service", target: "Payment Service" },
  { source: "Order Service", target: "RabbitMQ" },
  { source: "Payment Service", target: "RabbitMQ" },
]

export default function NetworkGraphDirected() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <NetworkGraph
        nodes={nodes}
        links={links}
        showLabels
        showArrows
        charge={-350}
        linkDistance={100}
        colorScheme={["#dc2626", "#2563eb", "#059669", "#d97706"]}
      />
    </div>
  )
}
