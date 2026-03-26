"use client"

import * as React from "react"
import {
  sankey,
  sankeyCenter,
  sankeyJustify,
  sankeyLeft,
  sankeyLinkHorizontal,
  sankeyRight,
} from "d3-sankey"

import { cn } from "@/lib/utils"

import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"

export interface SankeyNode {
  id: string
  name?: string
  color?: string
}

export interface SankeyLink {
  source: string
  target: string
  value: number
  color?: string
}

export interface SankeyChartProps extends BaseChartProps {
  nodes: SankeyNode[]
  links: SankeyLink[]
  nodeWidth?: number
  nodePadding?: number
  nodeAlign?: "left" | "right" | "center" | "justify"
  linkOpacity?: number
  showLabels?: boolean
  showValues?: boolean
}

const alignMap = {
  left: sankeyLeft,
  right: sankeyRight,
  center: sankeyCenter,
  justify: sankeyJustify,
}

interface SankeyComputedNode {
  id: string
  name?: string
  color?: string
  x0: number
  x1: number
  y0: number
  y1: number
  value: number
  sourceLinks: SankeyComputedLink[]
  targetLinks: SankeyComputedLink[]
}

interface SankeyComputedLink {
  source: SankeyComputedNode
  target: SankeyComputedNode
  value: number
  width: number
  y0: number
  y1: number
  color?: string
}

export function SankeyChart({
  nodes,
  links,
  config,
  className,
  width = 800,
  height = 500,
  margin = { top: 20, right: 120, bottom: 20, left: 20 },
  showTooltip = true,
  nodeWidth = 15,
  nodePadding = 20,
  nodeAlign = "justify",
  linkOpacity = 0.5,
  showLabels = true,
  showValues = true,
}: SankeyChartProps) {
  const [hoveredNode, setHoveredNode] =
    React.useState<SankeyComputedNode | null>(null)
  const [hoveredLink, setHoveredLink] =
    React.useState<SankeyComputedLink | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create sankey layout
  const { computedNodes, computedLinks } = React.useMemo(() => {
    // Create node map
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    // Create graph
    const sankeyData = {
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({
        source: nodes.findIndex((n) => n.id === l.source),
        target: nodes.findIndex((n) => n.id === l.target),
        value: l.value,
        color: l.color,
      })),
    }

    // Create sankey generator
    const sankeyGenerator = sankey<
      (typeof sankeyData.nodes)[0],
      (typeof sankeyData.links)[0]
    >()
      .nodeId((d) => d.id)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .nodeAlign(alignMap[nodeAlign])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])

    const result = sankeyGenerator(sankeyData as any)

    return {
      computedNodes: result.nodes as unknown as SankeyComputedNode[],
      computedLinks: result.links as unknown as SankeyComputedLink[],
    }
  }, [nodes, links, innerWidth, innerHeight, nodeWidth, nodePadding, nodeAlign])

  // Get color for node
  const getNodeColor = (node: SankeyComputedNode, index: number): string => {
    if (node.color) return node.color
    const configColor =
      config?.[node.id]?.color ?? config?.[node.name ?? ""]?.color
    if (configColor) return configColor
    return `var(--chart-${(index % 5) + 1})`
  }

  // Link path generator
  const linkPath = sankeyLinkHorizontal()

  // Check if node or its links are highlighted
  const isNodeHighlighted = (node: SankeyComputedNode): boolean => {
    if (!hoveredNode && !hoveredLink) return true
    if (hoveredNode === node) return true
    if (hoveredLink) {
      return hoveredLink.source === node || hoveredLink.target === node
    }
    if (hoveredNode) {
      return (
        hoveredNode.sourceLinks.some((l) => l.target === node) ||
        hoveredNode.targetLinks.some((l) => l.source === node)
      )
    }
    return false
  }

  const isLinkHighlighted = (link: SankeyComputedLink): boolean => {
    if (!hoveredNode && !hoveredLink) return true
    if (hoveredLink === link) return true
    if (hoveredNode) {
      return link.source === hoveredNode || link.target === hoveredNode
    }
    return false
  }

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Links */}
          {computedLinks.map((link, index) => {
            const color =
              link.color ??
              getNodeColor(link.source, computedNodes.indexOf(link.source))
            const highlighted = isLinkHighlighted(link)

            return (
              <path
                key={index}
                d={linkPath(link as any) ?? ""}
                fill="none"
                stroke={color}
                strokeWidth={Math.max(1, link.width)}
                strokeOpacity={highlighted ? linkOpacity : 0.1}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  hoveredLink === link && "stroke-[2]"
                )}
                onMouseEnter={() => setHoveredLink(link)}
                onMouseLeave={() => setHoveredLink(null)}
              />
            )
          })}

          {/* Nodes */}
          {computedNodes.map((node, index) => {
            const color = getNodeColor(node, index)
            const highlighted = isNodeHighlighted(node)

            return (
              <g key={node.id}>
                <rect
                  x={node.x0}
                  y={node.y0}
                  width={node.x1 - node.x0}
                  height={Math.max(1, node.y1 - node.y0)}
                  fill={color}
                  rx={2}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    !highlighted && "opacity-30"
                  )}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                />

                {/* Node label */}
                {showLabels && (
                  <text
                    x={node.x0 < innerWidth / 2 ? node.x1 + 6 : node.x0 - 6}
                    y={(node.y0 + node.y1) / 2}
                    textAnchor={node.x0 < innerWidth / 2 ? "start" : "end"}
                    dominantBaseline="middle"
                    className={cn(
                      "pointer-events-none text-[11px] transition-opacity duration-200",
                      highlighted
                        ? "fill-foreground"
                        : "fill-muted-foreground/50"
                    )}
                  >
                    {node.name ?? node.id}
                    {showValues && ` (${node.value.toLocaleString()})`}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && (hoveredNode || hoveredLink) && (
        <div className="border-border/50 bg-background absolute bottom-4 left-4 rounded-lg border px-3 py-2 text-sm shadow-xl">
          {hoveredNode && (
            <>
              <div className="font-medium">
                {hoveredNode.name ?? hoveredNode.id}
              </div>
              <div className="text-muted-foreground">
                Value: {hoveredNode.value.toLocaleString()}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                Incoming: {hoveredNode.targetLinks.length} | Outgoing:{" "}
                {hoveredNode.sourceLinks.length}
              </div>
            </>
          )}
          {hoveredLink && (
            <>
              <div className="font-medium">
                {hoveredLink.source.name ?? hoveredLink.source.id} →{" "}
                {hoveredLink.target.name ?? hoveredLink.target.id}
              </div>
              <div className="text-muted-foreground">
                Value: {hoveredLink.value.toLocaleString()}
              </div>
            </>
          )}
        </div>
      )}
    </ChartContainer>
  )
}
