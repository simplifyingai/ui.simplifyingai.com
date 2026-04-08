"use client"

import * as React from "react"
import { hierarchy, partition } from "d3-hierarchy"

import { cn } from "@/lib/utils"

export interface IcicleNode {
  name: string
  value?: number
  children?: IcicleNode[]
  color?: string
}

export interface IcicleChartProps {
  data: IcicleNode
  className?: string
  orientation?: "horizontal" | "vertical"
  showLabels?: boolean
  labelMinSize?: number
  padding?: number
  colorScheme?: string[]
}

export function IcicleChart({
  data,
  className,
  orientation = "vertical",
  showLabels = true,
  labelMinSize = 40,
  padding = 1,
  colorScheme = [
    "var(--chart-5)",
    "var(--chart-4)",
    "var(--chart-3)",
    "var(--chart-2)",
    "var(--chart-1)",
    "var(--chart-1)",
  ],
}: IcicleChartProps) {
  const [hoveredNode, setHoveredNode] = React.useState<IcicleNode | null>(null)

  const isVertical = orientation === "vertical"
  const width = 500
  const height = 400

  // Create hierarchy and partition layout
  const root = React.useMemo(() => {
    const h = hierarchy(data)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    const partitionLayout = partition<IcicleNode>()
      .size(isVertical ? [width, height] : [height, width])
      .padding(padding)

    return partitionLayout(h)
  }, [data, width, height, padding, isVertical])

  // Get all nodes except root
  const nodes = root.descendants().filter((d) => d.depth > 0)

  // Calculate total value for percentages
  const totalValue = root.value ?? 1

  // Get color based on depth and index
  const getColor = (node: (typeof nodes)[number]): string => {
    if (node.data.color) return node.data.color
    const depthIndex = node.depth - 1
    return colorScheme[depthIndex % colorScheme.length]
  }

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        {nodes.map((node, index) => {
          const isHovered = hoveredNode === node.data

          // For vertical: x0,x1 are horizontal, y0,y1 are depth
          // For horizontal: swap them
          const x = isVertical ? node.x0 : node.y0
          const y = isVertical ? node.y0 : node.x0
          const w = isVertical ? node.x1 - node.x0 : node.y1 - node.y0
          const h = isVertical ? node.y1 - node.y0 : node.x1 - node.x0

          const color = getColor(node)
          const showLabel = showLabels && w >= labelMinSize && h >= 20

          return (
            <g key={`${node.data.name}-${index}`}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={color}
                stroke="#fff"
                strokeWidth={1}
                rx={2}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  hoveredNode !== null && !isHovered && "opacity-60",
                  isHovered && "brightness-110"
                )}
                onMouseEnter={() => setHoveredNode(node.data)}
                onMouseLeave={() => setHoveredNode(null)}
              />

              {showLabel && (
                <text
                  x={x + w / 2}
                  y={y + h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-white text-[11px] font-medium"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                >
                  {node.data.name.length > w / 8
                    ? `${node.data.name.slice(0, Math.floor(w / 8))}...`
                    : node.data.name}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoveredNode && (
        <div className="mt-3 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
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
    </div>
  )
}
