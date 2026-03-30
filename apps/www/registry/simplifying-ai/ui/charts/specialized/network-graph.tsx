"use client"

import * as React from "react"
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force"

import { cn } from "@/lib/utils"

export interface NetworkNode extends SimulationNodeDatum {
  id: string
  label?: string
  group?: string
  size?: number
  color?: string
}

export interface NetworkLink extends SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode
  target: string | NetworkNode
  value?: number
  color?: string
}

export interface NetworkGraphProps {
  nodes: NetworkNode[]
  links: NetworkLink[]
  className?: string
  nodeRadius?: number
  linkWidth?: number
  showLabels?: boolean
  showArrows?: boolean
  charge?: number
  linkDistance?: number
  colorScheme?: string[]
}

export function NetworkGraph({
  nodes: initialNodes,
  links: initialLinks,
  className,
  nodeRadius = 8,
  linkWidth = 1.5,
  showLabels = true,
  showArrows = false,
  charge = -300,
  linkDistance = 100,
  colorScheme = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
}: NetworkGraphProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = React.useState<NetworkNode[]>([])
  const [links, setLinks] = React.useState<NetworkLink[]>([])
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null)

  const width = 500
  const height = 400

  // Get unique groups for coloring
  const groups = React.useMemo(() => {
    return [...new Set(initialNodes.map((n) => n.group ?? "default"))]
  }, [initialNodes])

  const getGroupColor = (group?: string) => {
    const index = groups.indexOf(group ?? "default")
    return colorScheme[index % colorScheme.length]
  }

  // Run force simulation
  React.useEffect(() => {
    const nodesCopy = initialNodes.map((n) => ({ ...n }))
    const linksCopy = initialLinks.map((l) => ({ ...l }))

    const simulation = forceSimulation<NetworkNode>(nodesCopy)
      .force(
        "link",
        forceLink<NetworkNode, NetworkLink>(linksCopy)
          .id((d) => d.id)
          .distance(linkDistance)
      )
      .force("charge", forceManyBody().strength(charge))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collide", forceCollide(nodeRadius * 2))

    simulation.on("tick", () => {
      setNodes([...nodesCopy])
      setLinks([...linksCopy])
    })

    simulation.alpha(1).restart()

    return () => {
      simulation.stop()
    }
  }, [
    initialNodes,
    initialLinks,
    charge,
    linkDistance,
    nodeRadius,
    width,
    height,
  ])

  return (
    <div className={cn("w-full", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        {/* Arrow marker definition */}
        {showArrows && (
          <defs>
            <marker
              id="arrowhead"
              viewBox="0 -5 10 10"
              refX={20}
              refY={0}
              markerWidth={6}
              markerHeight={6}
              orient="auto"
            >
              <path d="M0,-5L10,0L0,5" fill="#94a3b8" />
            </marker>
          </defs>
        )}

        {/* Links */}
        <g>
          {links.map((link, index) => {
            const sourceNode = link.source as NetworkNode
            const targetNode = link.target as NetworkNode
            if (
              !sourceNode.x ||
              !sourceNode.y ||
              !targetNode.x ||
              !targetNode.y
            )
              return null

            const isConnectedToHovered =
              hoveredNode === sourceNode.id || hoveredNode === targetNode.id

            return (
              <line
                key={`link-${index}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={link.color ?? "#94a3b8"}
                strokeWidth={link.value ? linkWidth * link.value : linkWidth}
                strokeOpacity={
                  hoveredNode ? (isConnectedToHovered ? 1 : 0.2) : 0.6
                }
                markerEnd={showArrows ? "url(#arrowhead)" : undefined}
                className="transition-opacity duration-200"
              />
            )
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node) => {
            if (!node.x || !node.y) return null
            const color = node.color ?? getGroupColor(node.group)
            const isHovered = hoveredNode === node.id
            const isConnected = links.some(
              (l) =>
                (typeof l.source === "object" ? l.source.id : l.source) ===
                  node.id ||
                (typeof l.target === "object" ? l.target.id : l.target) ===
                  node.id
            )
            const radius = node.size ?? nodeRadius

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? radius * 1.3 : radius}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    hoveredNode && !isHovered && !isConnected && "opacity-30"
                  )}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
                {showLabels && (
                  <text
                    x={node.x}
                    y={node.y + radius + 14}
                    textAnchor="middle"
                    className={cn(
                      "fill-foreground text-[10px] transition-opacity duration-200",
                      hoveredNode && !isHovered && "opacity-30"
                    )}
                  >
                    {node.label ?? node.id}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Legend */}
      {groups.length > 1 && (
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {groups.map((group) => (
            <div key={group} className="flex items-center gap-1.5 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getGroupColor(group) }}
              />
              <span className="text-muted-foreground">{group}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
