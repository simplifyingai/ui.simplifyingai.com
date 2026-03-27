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
  margin = { top: 20, right: 150, bottom: 20, left: 150 },
  showTooltip = true,
  nodeWidth = 15,
  nodePadding = 20,
  nodeAlign = "justify",
  linkOpacity = 0.5,
  showLabels = true,
  showValues = true,
}: SankeyChartProps) {
  const [hoveredElement, setHoveredElement] = React.useState<{
    type: "node" | "link"
    data: SankeyComputedNode | SankeyComputedLink
  } | null>(null)
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Clear hover with a small delay to prevent flickering
  const clearHover = React.useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredElement(null)
    }, 50)
  }, [])

  const setHover = React.useCallback(
    (type: "node" | "link", data: SankeyComputedNode | SankeyComputedLink) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      setHoveredElement({ type, data })
    },
    []
  )

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create sankey layout
  const { computedNodes, computedLinks } = React.useMemo(() => {
    // Validate inputs
    if (!nodes.length || !links.length) {
      return { computedNodes: [], computedLinks: [] }
    }

    // Create graph - use string IDs for links when using nodeId()
    const sankeyData = {
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({
        source: l.source,
        target: l.target,
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

    try {
      const result = sankeyGenerator(sankeyData as any)
      return {
        computedNodes: result.nodes as unknown as SankeyComputedNode[],
        computedLinks: result.links as unknown as SankeyComputedLink[],
      }
    } catch (error) {
      console.error("Sankey layout error:", error)
      return { computedNodes: [], computedLinks: [] }
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
    if (!hoveredElement) return true
    if (hoveredElement.type === "node") {
      const hoveredNode = hoveredElement.data as SankeyComputedNode
      if (hoveredNode === node) return true
      return (
        hoveredNode.sourceLinks.some((l) => l.target === node) ||
        hoveredNode.targetLinks.some((l) => l.source === node)
      )
    }
    if (hoveredElement.type === "link") {
      const hoveredLink = hoveredElement.data as SankeyComputedLink
      return hoveredLink.source === node || hoveredLink.target === node
    }
    return false
  }

  const isLinkHighlighted = (link: SankeyComputedLink): boolean => {
    if (!hoveredElement) return true
    if (hoveredElement.type === "link") {
      return hoveredElement.data === link
    }
    if (hoveredElement.type === "node") {
      const hoveredNode = hoveredElement.data as SankeyComputedNode
      return link.source === hoveredNode || link.target === hoveredNode
    }
    return false
  }

  return (
    <ChartContainer
      config={config}
      className={cn("!aspect-auto flex-col", className)}
    >
      <div
        className="relative mx-auto w-full"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Links */}
            {computedLinks.map((link, index) => {
              const color =
                link.color ??
                getNodeColor(link.source, computedNodes.indexOf(link.source))
              const highlighted = isLinkHighlighted(link)
              const isHovered =
                hoveredElement?.type === "link" && hoveredElement.data === link

              return (
                <path
                  key={index}
                  d={linkPath(link as any) ?? ""}
                  fill="none"
                  stroke={color}
                  strokeWidth={Math.max(1, link.width)}
                  opacity={highlighted ? 1 : 0.15}
                  strokeOpacity={isHovered ? linkOpacity + 0.2 : linkOpacity}
                  className="cursor-pointer"
                  style={{ transition: "opacity 150ms ease-out" }}
                  onMouseEnter={() => setHover("link", link)}
                  onMouseLeave={clearHover}
                />
              )
            })}

            {/* Nodes */}
            {computedNodes.map((node, index) => {
              const color = getNodeColor(node, index)
              const highlighted = isNodeHighlighted(node)

              // Determine node type and label position:
              // - Source nodes (no incoming): label on LEFT
              // - Sink nodes (no outgoing): label on RIGHT
              // - Middle nodes: label on LEFT (same as source to prevent horizontal overlap)
              const isSink = node.sourceLinks.length === 0

              // Calculate label position - all non-sink nodes get labels on LEFT
              let labelX: number
              let labelY: number
              let textAnchor: "start" | "middle" | "end"

              if (isSink) {
                // Right side label for sink nodes
                labelX = node.x1 + 8
                labelY = (node.y0 + node.y1) / 2
                textAnchor = "start"
              } else {
                // Left side label for source and middle nodes
                labelX = node.x0 - 8
                labelY = (node.y0 + node.y1) / 2
                textAnchor = "end"
              }

              const labelText = showValues
                ? `${node.name ?? node.id} (${node.value.toLocaleString()})`
                : (node.name ?? node.id)

              return (
                <g key={node.id}>
                  <rect
                    x={node.x0}
                    y={node.y0}
                    width={node.x1 - node.x0}
                    height={Math.max(1, node.y1 - node.y0)}
                    fill={color}
                    rx={2}
                    opacity={highlighted ? 1 : 0.3}
                    className="cursor-pointer"
                    style={{ transition: "opacity 150ms ease-out" }}
                    onMouseEnter={() => setHover("node", node)}
                    onMouseLeave={clearHover}
                  />

                  {/* Node label */}
                  {showLabels && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      opacity={highlighted ? 1 : 0.4}
                      className="fill-foreground pointer-events-none text-[10px] font-medium"
                      style={{ transition: "opacity 150ms ease-out" }}
                    >
                      {labelText}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>

        {/* Tooltip */}
        {showTooltip && hoveredElement && (
          <div className="border-border/50 bg-background absolute bottom-4 left-4 rounded-lg border px-3 py-2 text-sm shadow-xl">
            {hoveredElement.type === "node" && (
              <>
                <div className="font-medium">
                  {(hoveredElement.data as SankeyComputedNode).name ??
                    (hoveredElement.data as SankeyComputedNode).id}
                </div>
                <div className="text-muted-foreground">
                  Value:{" "}
                  {(
                    hoveredElement.data as SankeyComputedNode
                  ).value.toLocaleString()}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Incoming:{" "}
                  {
                    (hoveredElement.data as SankeyComputedNode).targetLinks
                      .length
                  }{" "}
                  | Outgoing:{" "}
                  {
                    (hoveredElement.data as SankeyComputedNode).sourceLinks
                      .length
                  }
                </div>
              </>
            )}
            {hoveredElement.type === "link" && (
              <>
                <div className="font-medium">
                  {(hoveredElement.data as SankeyComputedLink).source.name ??
                    (hoveredElement.data as SankeyComputedLink).source.id}{" "}
                  →{" "}
                  {(hoveredElement.data as SankeyComputedLink).target.name ??
                    (hoveredElement.data as SankeyComputedLink).target.id}
                </div>
                <div className="text-muted-foreground">
                  Value:{" "}
                  {(
                    hoveredElement.data as SankeyComputedLink
                  ).value.toLocaleString()}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ChartContainer>
  )
}
