"use client"

import * as React from "react"
import { arc, pie } from "d3-shape"

import { cn } from "@/lib/utils"

import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartLegend, type LegendItem } from "../chart-legend"
import { ChartTooltipContent } from "../chart-tooltip"

export interface PieChartDataPoint {
  label: string
  value: number
  color?: string
  [key: string]: unknown
}

export interface PieChartProps extends BaseChartProps {
  data: PieChartDataPoint[]
  innerRadius?: number
  outerRadius?: number
  padAngle?: number
  cornerRadius?: number
  startAngle?: number
  endAngle?: number
  sortValues?: boolean
  showLabels?: boolean
  labelType?: "percent" | "value" | "label"
}

export function PieChart({
  data,
  config,
  className,
  width = 400,
  height = 400,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  showTooltip = true,
  showLegend = true,
  innerRadius = 0,
  outerRadius: outerRadiusProp,
  padAngle = 0.02,
  cornerRadius = 4,
  startAngle = 0,
  endAngle = 2 * Math.PI,
  sortValues = false,
  showLabels = false,
  labelType = "percent",
}: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const radius = Math.min(innerWidth, innerHeight) / 2
  const outerRadius = outerRadiusProp ?? radius

  // Calculate total
  const total = data.reduce((sum, d) => sum + d.value, 0)

  // Create pie generator
  const pieGenerator = pie<PieChartDataPoint>()
    .value((d) => d.value)
    .padAngle(padAngle)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .sort(sortValues ? (a, b) => b.value - a.value : null)

  // Create arc generator
  const arcGenerator = arc<ReturnType<typeof pieGenerator>[number]>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(cornerRadius)

  // Hover arc (slightly larger)
  const hoverArcGenerator = arc<ReturnType<typeof pieGenerator>[number]>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius * 1.05)
    .cornerRadius(cornerRadius)

  // Label arc
  const labelArcGenerator = arc<ReturnType<typeof pieGenerator>[number]>()
    .innerRadius(outerRadius * 0.7)
    .outerRadius(outerRadius * 0.7)

  const arcs = pieGenerator(data)

  // Get color for segment
  const getColor = (d: PieChartDataPoint, index: number): string => {
    return (
      d.color ?? config?.[d.label]?.color ?? `var(--chart-${(index % 5) + 1})`
    )
  }

  // Format label
  const formatLabel = (d: PieChartDataPoint): string => {
    switch (labelType) {
      case "percent":
        return `${((d.value / total) * 100).toFixed(1)}%`
      case "value":
        return d.value.toLocaleString()
      case "label":
        return d.label
      default:
        return ""
    }
  }

  // Legend items
  const legendItems: LegendItem[] = data.map((d, i) => ({
    name: d.label,
    color: getColor(d, i),
    value: d.value,
  }))

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g
          transform={`translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight / 2})`}
        >
          {arcs.map((arcData, index) => {
            const isHovered = hoveredIndex === index
            const color = getColor(data[index], index)

            return (
              <g key={index}>
                {/* Pie segment */}
                <path
                  d={
                    (isHovered ? hoverArcGenerator : arcGenerator)(arcData) ??
                    ""
                  }
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    hoveredIndex !== null && !isHovered && "opacity-50"
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Labels */}
                {showLabels && (
                  <text
                    transform={`translate(${labelArcGenerator.centroid(arcData)})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none fill-white text-[10px] font-medium"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {formatLabel(data[index])}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredIndex !== null && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
          <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-sm shadow-xl">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: getColor(data[hoveredIndex], hoveredIndex),
                }}
              />
              <span className="font-medium">{data[hoveredIndex].label}</span>
            </div>
            <div className="text-muted-foreground mt-1">
              {data[hoveredIndex].value.toLocaleString()} (
              {((data[hoveredIndex].value / total) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <ChartLegend
          items={legendItems}
          onItemHover={(name) => {
            const index = data.findIndex((d) => d.label === name)
            setHoveredIndex(index >= 0 ? index : null)
          }}
        />
      )}
    </ChartContainer>
  )
}
