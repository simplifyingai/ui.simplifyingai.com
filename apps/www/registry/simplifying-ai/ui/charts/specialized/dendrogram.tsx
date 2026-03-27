"use client"

import * as React from "react"
import { hierarchy, cluster } from "d3-hierarchy"
import { linkHorizontal, linkVertical } from "d3-shape"

import { cn } from "@/lib/utils"

export interface DendrogramNode {
  name: string
  value?: number
  children?: DendrogramNode[]
  color?: string
}

export interface DendrogramProps {
  data: DendrogramNode
  className?: string
  orientation?: "horizontal" | "vertical"
  nodeRadius?: number
  showLabels?: boolean
  showValues?: boolean
  linkColor?: string
  colorScheme?: string[]
}

export function Dendrogram({
  data,
  className,
  orientation = "horizontal",
  nodeRadius = 5,
  showLabels = true,
  showValues = false,
  linkColor = "#94a3b8",
  colorScheme = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
}: DendrogramProps) {
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null)

  const isHorizontal = orientation === "horizontal"
  const width = isHorizontal ? 600 : 400
  const height = isHorizontal ? 400 : 500
  const margin = isHorizontal
    ? { top: 20, right: 120, bottom: 20, left: 40 }
    : { top: 40, right: 20, bottom: 120, left: 20 }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create hierarchy and apply cluster layout
  const root = React.useMemo(() => {
    const h = hierarchy(data)
    const clusterLayout = cluster<DendrogramNode>()
      .size(isHorizontal ? [innerHeight, innerWidth] : [innerWidth, innerHeight])

    return clusterLayout(h)
  }, [data, innerWidth, innerHeight, isHorizontal])

  // Get all nodes and links
  const nodes = root.descendants()
  const links = root.links()

  // Link generator
  const linkGenerator = isHorizontal
    ? linkHorizontal<any, any>()
        .x((d: any) => d.y)
        .y((d: any) => d.x)
    : linkVertical<any, any>()
        .x((d: any) => d.x)
        .y((d: any) => d.y)

  // Get color based on depth
  const getNodeColor = (depth: number) => {
    return colorScheme[depth % colorScheme.length]
  }

  // Check if node or any of its descendants is hovered
  const isNodeHighlighted = (node: typeof nodes[number]): boolean => {
    if (node.data.name === hoveredNode) return true
    if (node.ancestors().some((a) => a.data.name === hoveredNode)) return true
    if (node.descendants().some((d) => d.data.name === hoveredNode)) return true
    return false
  }

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Links */}
          {links.map((link, index) => {
            const isHighlighted =
              hoveredNode === null ||
              isNodeHighlighted(link.source) ||
              isNodeHighlighted(link.target)

            return (
              <path
                key={`link-${index}`}
                d={linkGenerator(link) ?? ""}
                fill="none"
                stroke={linkColor}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeOpacity={hoveredNode === null ? 0.6 : isHighlighted ? 1 : 0.15}
                className="transition-all duration-200"
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node, index) => {
            const x = isHorizontal ? node.y : node.x
            const y = isHorizontal ? node.x : node.y
            const isLeaf = !node.children
            const color = node.data.color ?? getNodeColor(node.depth)
            const isHovered = hoveredNode === node.data.name
            const isHighlighted = hoveredNode === null || isNodeHighlighted(node)

            return (
              <g
                key={`node-${index}`}
                transform={`translate(${x}, ${y})`}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  !isHighlighted && "opacity-20"
                )}
                onMouseEnter={() => setHoveredNode(node.data.name)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  r={isHovered ? nodeRadius * 1.5 : nodeRadius}
                  fill={isLeaf ? color : "#fff"}
                  stroke={color}
                  strokeWidth={2}
                  className="transition-all duration-200"
                />

                {showLabels && (
                  <text
                    x={isHorizontal ? (isLeaf ? 10 : -10) : 0}
                    y={isHorizontal ? 0 : (isLeaf ? 15 : -15)}
                    textAnchor={
                      isHorizontal
                        ? isLeaf
                          ? "start"
                          : "end"
                        : "middle"
                    }
                    dominantBaseline={isHorizontal ? "middle" : isLeaf ? "hanging" : "auto"}
                    className="fill-foreground text-[11px]"
                  >
                    {node.data.name}
                  </text>
                )}

                {showValues && node.data.value !== undefined && (
                  <text
                    x={isHorizontal ? (isLeaf ? 10 : -10) : 0}
                    y={isHorizontal ? 12 : (isLeaf ? 28 : -28)}
                    textAnchor={isHorizontal ? (isLeaf ? "start" : "end") : "middle"}
                    className="fill-muted-foreground text-[9px]"
                  >
                    {node.data.value}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredNode && (
        <div className="mt-2 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
            <div className="font-medium">{hoveredNode}</div>
            {nodes.find((n) => n.data.name === hoveredNode)?.data.value !== undefined && (
              <div className="text-muted-foreground">
                Value: {nodes.find((n) => n.data.name === hoveredNode)?.data.value}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
