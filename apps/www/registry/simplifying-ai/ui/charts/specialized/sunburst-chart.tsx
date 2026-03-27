"use client"

import * as React from "react"
import { hierarchy, partition } from "d3-hierarchy"
import { scaleOrdinal } from "d3-scale"
import { arc } from "d3-shape"

import { cn } from "@/lib/utils"

import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"

export interface SunburstNode {
  name: string
  value?: number
  children?: SunburstNode[]
  color?: string
}

export interface SunburstChartProps extends BaseChartProps {
  data: SunburstNode
  innerRadius?: number
  padAngle?: number
  cornerRadius?: number
  showLabels?: boolean
  labelMinAngle?: number
}

export function SunburstChart({
  data,
  config,
  className,
  width = 500,
  height = 500,
  margin = { top: 10, right: 10, bottom: 10, left: 10 },
  showTooltip = true,
  innerRadius = 50,
  padAngle = 0.01,
  cornerRadius = 3,
  showLabels = true,
  labelMinAngle = 0.1,
}: SunburstChartProps) {
  const [hoveredNode, setHoveredNode] = React.useState<SunburstNode | null>(
    null
  )
  const [breadcrumbs, setBreadcrumbs] = React.useState<SunburstNode[]>([])

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const radius = Math.min(innerWidth, innerHeight) / 2
  const centerX = innerWidth / 2
  const centerY = innerHeight / 2

  // Create hierarchy and partition layout
  const root = React.useMemo(() => {
    const h = hierarchy(data)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    const partitionLayout = partition<SunburstNode>().size([
      2 * Math.PI,
      radius,
    ])

    return partitionLayout(h)
  }, [data, radius])

  // Calculate depth for color scaling
  const maxDepth = root.height

  // Color scale based on depth
  const depthColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ]

  const getColor = (node: typeof root, index: number): string => {
    const nodeData = node.data
    if (nodeData.color) return nodeData.color
    if (config?.[nodeData.name]?.color) return config[nodeData.name].color!
    return depthColors[node.depth % depthColors.length]
  }

  // Arc generator
  const arcGenerator = arc<typeof root>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(padAngle)
    .innerRadius((d) =>
      d.depth === 0 ? 0 : innerRadius + (d.y0 / radius) * (radius - innerRadius)
    )
    .outerRadius((d) =>
      d.depth === 0
        ? innerRadius
        : innerRadius + (d.y1 / radius) * (radius - innerRadius)
    )
    .cornerRadius(cornerRadius)

  // Label arc for positioning
  const labelArc = arc<typeof root>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius(
      (d) => innerRadius + ((d.y0 + d.y1) / 2 / radius) * (radius - innerRadius)
    )
    .outerRadius(
      (d) => innerRadius + ((d.y0 + d.y1) / 2 / radius) * (radius - innerRadius)
    )

  // Get all descendants for rendering
  const descendants = root.descendants()

  // Handle hover
  const handleHover = (node: typeof root | null) => {
    if (!node) {
      setHoveredNode(null)
      setBreadcrumbs([])
      return
    }
    setHoveredNode(node.data)
    setBreadcrumbs(
      node
        .ancestors()
        .reverse()
        .map((n) => n.data)
    )
  }

  // Total value for percentage calculation
  const totalValue = root.value ?? 1

  return (
    <ChartContainer
      config={config}
      className={cn("!aspect-auto flex-col", className)}
    >
      <div className="relative mx-auto aspect-square w-full max-w-[320px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
        >
          <g
            transform={`translate(${margin.left + centerX}, ${margin.top + centerY})`}
          >
            {descendants.map((node, index) => {
              const nodeData = node.data
              const color = getColor(node, index)
              const isHovered = hoveredNode === nodeData
              const isAncestor = breadcrumbs.includes(nodeData)
              const angle = node.x1 - node.x0

              return (
                <g key={`${nodeData.name}-${node.depth}-${index}`}>
                  <path
                    d={arcGenerator(node) ?? ""}
                    fill={color}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      hoveredNode !== null &&
                        !isHovered &&
                        !isAncestor &&
                        "opacity-40",
                      isHovered && "brightness-110"
                    )}
                    onMouseEnter={() => handleHover(node)}
                    onMouseLeave={() => handleHover(null)}
                  />

                  {/* Label */}
                  {showLabels && angle >= labelMinAngle && node.depth > 0 && (
                    <text
                      transform={`translate(${labelArc.centroid(node)}) rotate(${
                        ((node.x0 + node.x1) / 2 - Math.PI / 2) *
                        (180 / Math.PI)
                      })`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none fill-white text-[9px] font-medium"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                    >
                      {nodeData.name.length > 10
                        ? `${nodeData.name.slice(0, 8)}...`
                        : nodeData.name}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Center label */}
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-sm font-medium"
            >
              {hoveredNode?.name ?? data.name}
            </text>
            {hoveredNode && (
              <text
                y={16}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-xs"
              >
                {(hoveredNode.value ?? 0).toLocaleString()}
              </text>
            )}
          </g>
        </svg>

        {/* Breadcrumb trail */}
        {breadcrumbs.length > 1 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 text-xs">
            {breadcrumbs.map((node, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-muted-foreground">/</span>}
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? "font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {node.name}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Tooltip */}
        {showTooltip && hoveredNode && breadcrumbs.length > 1 && (
          <div className="border-border/50 bg-background absolute bottom-2 left-2 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            <div className="font-medium">{hoveredNode.name}</div>
            <div className="text-muted-foreground">
              Value: {(hoveredNode.value ?? 0).toLocaleString()}
            </div>
            <div className="text-muted-foreground">
              {(((hoveredNode.value ?? 0) / totalValue) * 100).toFixed(1)}% of
              total
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  )
}
