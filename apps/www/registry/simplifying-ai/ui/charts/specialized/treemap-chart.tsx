"use client"

import * as React from "react"
import {
  hierarchy,
  treemap,
  treemapBinary,
  treemapDice,
  treemapSlice,
  treemapSquarify,
} from "d3-hierarchy"

import { cn } from "@/lib/utils"

import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"

export interface TreemapNode {
  name: string
  value?: number
  children?: TreemapNode[]
  color?: string
}

export interface TreemapChartProps extends BaseChartProps {
  data: TreemapNode
  tile?: "squarify" | "binary" | "slice" | "dice"
  padding?: number
  paddingInner?: number
  paddingOuter?: number
  round?: boolean
  showLabels?: boolean
  labelMinSize?: number
}

const tileMap = {
  squarify: treemapSquarify,
  binary: treemapBinary,
  slice: treemapSlice,
  dice: treemapDice,
}

export function TreemapChart({
  data,
  config,
  className,
  width = 600,
  height = 400,
  margin = { top: 10, right: 10, bottom: 10, left: 10 },
  showTooltip = true,
  tile = "squarify",
  padding = 1,
  paddingInner = 2,
  paddingOuter = 2,
  round = true,
  showLabels = true,
  labelMinSize = 30,
}: TreemapChartProps) {
  const [hoveredNode, setHoveredNode] = React.useState<TreemapNode | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create hierarchy and compute treemap layout
  const root = React.useMemo(() => {
    const h = hierarchy(data)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    const treemapLayout = treemap<TreemapNode>()
      .size([innerWidth, innerHeight])
      .tile(tileMap[tile])
      .padding(padding)
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter)
      .round(round)

    return treemapLayout(h)
  }, [
    data,
    innerWidth,
    innerHeight,
    tile,
    padding,
    paddingInner,
    paddingOuter,
    round,
  ])

  // Get all leaves (nodes with values)
  const leaves = root.leaves()

  // Calculate total value for percentages
  const totalValue = root.value ?? 1

  // Generate colors based on depth and index
  const getColor = (node: (typeof leaves)[number], index: number): string => {
    const nodeData = node.data
    if (nodeData.color) return nodeData.color
    if (config?.[nodeData.name]?.color) return config[nodeData.name].color!

    // Use different shades based on parent
    const parentIndex = node.parent
      ? leaves.filter((l) => l.parent === node.parent).indexOf(node)
      : index
    return `var(--chart-${(parentIndex % 5) + 1})`
  }

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {leaves.map((node, index) => {
            const nodeData = node.data
            const x = node.x0
            const y = node.y0
            const w = node.x1 - node.x0
            const h = node.y1 - node.y0
            const color = getColor(node, index)
            const isHovered = hoveredNode === nodeData

            return (
              <g key={`${nodeData.name}-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={color}
                  rx={2}
                  ry={2}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    hoveredNode !== null && !isHovered && "opacity-60",
                    isHovered && "brightness-110"
                  )}
                  onMouseEnter={() => setHoveredNode(nodeData)}
                  onMouseLeave={() => setHoveredNode(null)}
                />

                {/* Label */}
                {showLabels && w >= labelMinSize && h >= labelMinSize && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none fill-white text-[11px] font-medium"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                  >
                    {nodeData.name.length > w / 8
                      ? `${nodeData.name.slice(0, Math.floor(w / 8))}...`
                      : nodeData.name}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredNode && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-sm shadow-xl">
            <div className="font-medium">{hoveredNode.name}</div>
            <div className="text-muted-foreground">
              Value: {(hoveredNode.value ?? 0).toLocaleString()}
            </div>
            <div className="text-muted-foreground">
              {(((hoveredNode.value ?? 0) / totalValue) * 100).toFixed(1)}% of
              total
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  )
}
