"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartHorizontalGrid } from "../chart-grid"
import { ChartTooltipContent } from "../chart-tooltip"

export interface WaterfallDataPoint {
  label: string
  value: number
  isTotal?: boolean
  isSubtotal?: boolean
}

export interface WaterfallChartProps extends BaseChartProps {
  data: WaterfallDataPoint[]
  positiveColor?: string
  negativeColor?: string
  totalColor?: string
  connectorColor?: string
  showConnector?: boolean
  barRadius?: number
  xAxisLabel?: string
  yAxisLabel?: string
}

export function WaterfallChart({
  data,
  config,
  className,
  width = 700,
  height = 400,
  margin = { top: 20, right: 20, bottom: 60, left: 60 },
  showGrid = true,
  showTooltip = true,
  positiveColor = "#3b82f6",
  negativeColor = "#93c5fd",
  totalColor = "#1e40af",
  connectorColor = "currentColor",
  showConnector = true,
  barRadius = 2,
  xAxisLabel,
  yAxisLabel,
}: WaterfallChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Calculate cumulative values
  const processedData = React.useMemo(() => {
    let runningTotal = 0
    return data.map((d, i) => {
      const start = d.isTotal || d.isSubtotal ? 0 : runningTotal
      const end = d.isTotal || d.isSubtotal ? d.value : runningTotal + d.value
      runningTotal = end
      return {
        ...d,
        start,
        end,
        isPositive: d.value >= 0,
      }
    })
  }, [data])

  // Scales
  const xScale = React.useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.3)
  }, [data, innerWidth])

  const yScale = React.useMemo(() => {
    const allValues = processedData.flatMap((d) => [d.start, d.end])
    const minVal = Math.min(0, ...allValues)
    const maxVal = Math.max(0, ...allValues)
    const padding = (maxVal - minVal) * 0.1
    return scaleLinear()
      .domain([minVal - padding, maxVal + padding])
      .range([innerHeight, 0])
      .nice()
  }, [processedData, innerHeight])

  return (
    <ChartContainer config={config} className={cn("!aspect-auto", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {showGrid && (
            <ChartHorizontalGrid scale={yScale} width={innerWidth} />
          )}

          {/* Zero line */}
          <line
            x1={0}
            x2={innerWidth}
            y1={yScale(0)}
            y2={yScale(0)}
            stroke="currentColor"
            strokeWidth={1}
            className="text-border"
          />

          {/* Bars and connectors */}
          {processedData.map((d, index) => {
            const x = xScale(d.label) ?? 0
            const barWidth = xScale.bandwidth()
            const y1 = yScale(Math.max(d.start, d.end))
            const y2 = yScale(Math.min(d.start, d.end))
            const barHeight = Math.abs(y2 - y1)

            const color =
              d.isTotal || d.isSubtotal
                ? totalColor
                : d.isPositive
                  ? positiveColor
                  : negativeColor

            const isHovered = hoveredIndex === index

            return (
              <g key={index}>
                {/* Connector line */}
                {showConnector && index > 0 && !d.isTotal && (
                  <line
                    x1={xScale(processedData[index - 1].label)! + barWidth}
                    x2={x}
                    y1={yScale(processedData[index - 1].end)}
                    y2={yScale(processedData[index - 1].end)}
                    stroke={connectorColor}
                    strokeWidth={1}
                    strokeDasharray="3,3"
                    className="text-muted-foreground/50"
                  />
                )}

                {/* Bar */}
                <rect
                  x={x}
                  y={y1}
                  width={barWidth}
                  height={Math.max(1, barHeight)}
                  fill={color}
                  rx={barRadius}
                  ry={barRadius}
                  className={cn(
                    "cursor-pointer transition-opacity duration-200",
                    hoveredIndex !== null && !isHovered && "opacity-50"
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Value label */}
                <text
                  x={x + barWidth / 2}
                  y={d.value >= 0 ? y1 - 5 : y2 + 14}
                  textAnchor="middle"
                  className="fill-foreground pointer-events-none text-[10px] font-medium"
                >
                  {d.value >= 0 ? "+" : ""}
                  {d.value.toLocaleString()}
                </text>
              </g>
            )
          })}

          {/* X Axis */}
          <ChartAxis
            scale={xScale}
            orientation="bottom"
            transform={`translate(0, ${innerHeight})`}
            label={xAxisLabel}
          />

          {/* Y Axis */}
          <ChartAxis scale={yScale} orientation="left" label={yAxisLabel} />
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left:
              margin.left +
              (xScale(processedData[hoveredIndex].label) ?? 0) +
              xScale.bandwidth() / 2,
            top:
              margin.top +
              yScale(
                Math.max(
                  processedData[hoveredIndex].start,
                  processedData[hoveredIndex].end
                )
              ) -
              50,
          }}
        >
          <div className="border-border/50 bg-background -translate-x-1/2 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            <div className="font-medium">
              {processedData[hoveredIndex].label}
            </div>
            <div className="text-muted-foreground">
              Change: {processedData[hoveredIndex].value >= 0 ? "+" : ""}
              {processedData[hoveredIndex].value.toLocaleString()}
            </div>
            <div className="text-muted-foreground">
              Running Total: {processedData[hoveredIndex].end.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  )
}
