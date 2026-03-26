"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"
import { curveLinearClosed, lineRadial } from "d3-shape"

import { cn } from "@/lib/utils"

import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartLegend, type LegendItem } from "../chart-legend"

export interface RadarChartDataPoint {
  axis: string
  value: number
}

export interface RadarChartSeries {
  name: string
  data: RadarChartDataPoint[]
  color?: string
  fillOpacity?: number
}

export interface RadarChartProps extends BaseChartProps {
  data: RadarChartSeries[]
  maxValue?: number
  levels?: number
  showDots?: boolean
  dotSize?: number
  fillOpacity?: number
  strokeWidth?: number
  showLabels?: boolean
  labelOffset?: number
}

export function RadarChart({
  data,
  config,
  className,
  width = 500,
  height = 500,
  margin = { top: 50, right: 50, bottom: 50, left: 50 },
  showTooltip = true,
  showLegend = true,
  maxValue: maxValueProp,
  levels = 5,
  showDots = true,
  dotSize = 4,
  fillOpacity = 0.25,
  strokeWidth = 2,
  showLabels = true,
  labelOffset = 20,
}: RadarChartProps) {
  const [hoveredSeries, setHoveredSeries] = React.useState<string | null>(null)
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    series: string
    axis: string
    value: number
    x: number
    y: number
  } | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const radius = Math.min(innerWidth, innerHeight) / 2
  const centerX = innerWidth / 2
  const centerY = innerHeight / 2

  // Get all axes from data
  const axes = React.useMemo(() => {
    const axisSet = new Set<string>()
    data.forEach((series) => {
      series.data.forEach((d) => axisSet.add(d.axis))
    })
    return Array.from(axisSet)
  }, [data])

  const angleSlice = (2 * Math.PI) / axes.length

  // Calculate max value
  const maxValue =
    maxValueProp ??
    Math.max(...data.flatMap((s) => s.data.map((d) => d.value))) * 1.1

  // Radial scale
  const rScale = scaleLinear().domain([0, maxValue]).range([0, radius])

  // Get coordinates for a data point
  const getPoint = (axis: string, value: number) => {
    const index = axes.indexOf(axis)
    const angle = angleSlice * index - Math.PI / 2
    const r = rScale(value)
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    }
  }

  // Generate radar area path
  const radarLine = lineRadial<RadarChartDataPoint>()
    .angle((d) => axes.indexOf(d.axis) * angleSlice)
    .radius((d) => rScale(d.value))
    .curve(curveLinearClosed)

  // Legend items
  const legendItems: LegendItem[] = data.map((series, i) => ({
    name: series.name,
    color:
      series.color ??
      config?.[series.name]?.color ??
      `var(--chart-${(i % 5) + 1})`,
  }))

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Background circles */}
          {Array.from({ length: levels }, (_, i) => {
            const levelRadius = (radius / levels) * (i + 1)
            return (
              <circle
                key={i}
                cx={centerX}
                cy={centerY}
                r={levelRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.5}
                strokeOpacity={0.3}
                className="text-border"
              />
            )
          })}

          {/* Axis lines */}
          {axes.map((axis, i) => {
            const angle = angleSlice * i - Math.PI / 2
            const x2 = centerX + radius * Math.cos(angle)
            const y2 = centerY + radius * Math.sin(angle)
            return (
              <line
                key={axis}
                x1={centerX}
                y1={centerY}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={0.5}
                strokeOpacity={0.3}
                className="text-border"
              />
            )
          })}

          {/* Axis labels */}
          {showLabels &&
            axes.map((axis, i) => {
              const angle = angleSlice * i - Math.PI / 2
              const x = centerX + (radius + labelOffset) * Math.cos(angle)
              const y = centerY + (radius + labelOffset) * Math.sin(angle)
              return (
                <text
                  key={axis}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {axis}
                </text>
              )
            })}

          {/* Level labels */}
          {Array.from({ length: levels }, (_, i) => {
            const levelValue = (maxValue / levels) * (i + 1)
            const levelRadius = (radius / levels) * (i + 1)
            return (
              <text
                key={i}
                x={centerX + 4}
                y={centerY - levelRadius}
                className="fill-muted-foreground text-[9px]"
                dominantBaseline="middle"
              >
                {levelValue.toFixed(0)}
              </text>
            )
          })}

          {/* Radar areas */}
          {data.map((series, seriesIndex) => {
            const color =
              series.color ??
              config?.[series.name]?.color ??
              `var(--chart-${(seriesIndex % 5) + 1})`
            const isHovered =
              hoveredSeries === null || hoveredSeries === series.name

            // Sort data by axis order
            const sortedData = axes.map((axis) => {
              const point = series.data.find((d) => d.axis === axis)
              return { axis, value: point?.value ?? 0 }
            })

            return (
              <g key={series.name}>
                {/* Area */}
                <path
                  d={radarLine(sortedData) ?? ""}
                  transform={`translate(${centerX}, ${centerY})`}
                  fill={color}
                  fillOpacity={series.fillOpacity ?? fillOpacity}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  className={cn(
                    "transition-opacity duration-200",
                    !isHovered && "opacity-30"
                  )}
                />

                {/* Dots */}
                {showDots &&
                  sortedData.map((d) => {
                    const point = getPoint(d.axis, d.value)
                    const isPointHovered =
                      hoveredPoint?.series === series.name &&
                      hoveredPoint?.axis === d.axis

                    return (
                      <circle
                        key={d.axis}
                        cx={point.x}
                        cy={point.y}
                        r={isPointHovered ? dotSize * 1.5 : dotSize}
                        fill={color}
                        stroke="white"
                        strokeWidth={1.5}
                        className={cn(
                          "cursor-pointer transition-all duration-200",
                          !isHovered && "opacity-30"
                        )}
                        onMouseEnter={() =>
                          setHoveredPoint({
                            series: series.name,
                            axis: d.axis,
                            value: d.value,
                            x: point.x,
                            y: point.y,
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    )
                  })}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredPoint && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: margin.left + hoveredPoint.x,
            top: margin.top + hoveredPoint.y - 10,
          }}
        >
          <div className="border-border/50 bg-background -translate-x-1/2 -translate-y-full rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            <div className="font-medium">{hoveredPoint.series}</div>
            <div className="text-muted-foreground">
              {hoveredPoint.axis}: {hoveredPoint.value.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && data.length > 1 && (
        <ChartLegend items={legendItems} onItemHover={setHoveredSeries} />
      )}
    </ChartContainer>
  )
}
