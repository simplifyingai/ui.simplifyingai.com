"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartGrid } from "../chart-grid"
import { ChartLegend, type LegendItem } from "../chart-legend"
import { ChartTooltipContent } from "../chart-tooltip"

export interface ScatterChartDataPoint {
  x: number
  y: number
  size?: number
  label?: string
  [key: string]: unknown
}

export interface ScatterChartSeries {
  name: string
  data: ScatterChartDataPoint[]
  color?: string
  symbol?: "circle" | "square" | "triangle" | "diamond" | "cross"
  size?: number
}

export interface ScatterChartProps extends Omit<BaseChartProps, "config"> {
  data: ScatterChartSeries[]
  xAxisLabel?: string
  yAxisLabel?: string
  sizeRange?: [number, number]
  symbol?: "circle" | "square" | "triangle" | "diamond" | "cross"
  size?: number
  showTrendLine?: boolean
  config?: ChartConfig
}

// SVG path generators for different symbols
const symbolPaths: Record<string, (size: number) => string> = {
  circle: (s) => {
    const r = s / 2
    return `M 0,${-r} A ${r},${r} 0 1,1 0,${r} A ${r},${r} 0 1,1 0,${-r}`
  },
  square: (s) => {
    const h = s / 2
    return `M ${-h},${-h} L ${h},${-h} L ${h},${h} L ${-h},${h} Z`
  },
  triangle: (s) => {
    const h = s / 2
    return `M 0,${-h} L ${h},${h} L ${-h},${h} Z`
  },
  diamond: (s) => {
    const h = s / 2
    return `M 0,${-h} L ${h},0 L 0,${h} L ${-h},0 Z`
  },
  cross: (s) => {
    const h = s / 2
    const w = s / 6
    return `M ${-w},${-h} L ${w},${-h} L ${w},${-w} L ${h},${-w} L ${h},${w} L ${w},${w} L ${w},${h} L ${-w},${h} L ${-w},${w} L ${-h},${w} L ${-h},${-w} L ${-w},${-w} Z`
  },
}

export function ScatterChart({
  data,
  config,
  className,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 50, left: 60 },
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
  sizeRange = [6, 20],
  symbol = "circle",
  size = 8,
  showTrendLine = false,
}: ScatterChartProps) {
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    seriesIndex: number
    pointIndex: number
    x: number
    y: number
  } | null>(null)
  const [hoveredSeries, setHoveredSeries] = React.useState<string | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Flatten all data points for scales
  const allPoints = data.flatMap((series) => series.data)

  // Scales
  const xScale = React.useMemo(() => {
    const xValues = allPoints.map((d) => d.x)
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const padding = (xMax - xMin) * 0.1
    return scaleLinear()
      .domain([xMin - padding, xMax + padding])
      .range([0, innerWidth])
      .nice()
  }, [allPoints, innerWidth])

  const yScale = React.useMemo(() => {
    const yValues = allPoints.map((d) => d.y)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    const padding = (yMax - yMin) * 0.1
    return scaleLinear()
      .domain([yMin - padding, yMax + padding])
      .range([innerHeight, 0])
      .nice()
  }, [allPoints, innerHeight])

  // Size scale for bubble chart
  const sizeScale = React.useMemo(() => {
    const sizeValues = allPoints.map((d) => d.size ?? 1)
    const sizeMin = Math.min(...sizeValues)
    const sizeMax = Math.max(...sizeValues)
    return scaleLinear().domain([sizeMin, sizeMax]).range(sizeRange)
  }, [allPoints, sizeRange])

  // Calculate trend line (simple linear regression)
  const trendLine = React.useMemo(() => {
    if (!showTrendLine) return null

    const n = allPoints.length
    if (n < 2) return null

    const sumX = allPoints.reduce((acc, d) => acc + d.x, 0)
    const sumY = allPoints.reduce((acc, d) => acc + d.y, 0)
    const sumXY = allPoints.reduce((acc, d) => acc + d.x * d.y, 0)
    const sumX2 = allPoints.reduce((acc, d) => acc + d.x * d.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const xDomain = xScale.domain()
    return {
      x1: xDomain[0],
      y1: slope * xDomain[0] + intercept,
      x2: xDomain[1],
      y2: slope * xDomain[1] + intercept,
    }
  }, [allPoints, showTrendLine, xScale])

  // Legend items
  const legendItems: LegendItem[] = data.map((series) => ({
    name: series.name,
    color: series.color ?? "hsl(var(--foreground))",
  }))

  return (
    <ChartContainer config={config} className={cn("!aspect-auto flex-col", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {showGrid && (
            <ChartGrid
              xScale={xScale}
              yScale={yScale}
              width={innerWidth}
              height={innerHeight}
            />
          )}

          {/* Trend line */}
          {trendLine && (
            <line
              x1={xScale(trendLine.x1)}
              y1={yScale(trendLine.y1)}
              x2={xScale(trendLine.x2)}
              y2={yScale(trendLine.y2)}
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="6,4"
              className="text-muted-foreground/50"
            />
          )}

          {/* Points */}
          {data.map((series, seriesIndex) => {
            const seriesColor = series.color ?? "hsl(var(--foreground))"
            const seriesSymbol = series.symbol ?? symbol
            const isSeriesHovered =
              hoveredSeries === null || hoveredSeries === series.name

            return series.data.map((point, pointIndex) => {
              const pointSize =
                point.size !== undefined
                  ? sizeScale(point.size)
                  : (series.size ?? size)
              const isHovered =
                hoveredPoint?.seriesIndex === seriesIndex &&
                hoveredPoint?.pointIndex === pointIndex

              return (
                <g
                  key={`${seriesIndex}-${pointIndex}`}
                  transform={`translate(${xScale(point.x)}, ${yScale(point.y)})`}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    !isSeriesHovered && "opacity-30"
                  )}
                  onMouseEnter={() =>
                    setHoveredPoint({
                      seriesIndex,
                      pointIndex,
                      x: xScale(point.x),
                      y: yScale(point.y),
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <path
                    d={symbolPaths[seriesSymbol](
                      isHovered ? pointSize * 1.3 : pointSize
                    )}
                    fill={seriesColor}
                    stroke="white"
                    strokeWidth={1}
                  />
                </g>
              )
            })
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
      {showTooltip && hoveredPoint && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: margin.left + hoveredPoint.x + 15,
            top: margin.top + hoveredPoint.y - 10,
          }}
        >
          <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            <div className="mb-1 font-medium">
              {data[hoveredPoint.seriesIndex].data[hoveredPoint.pointIndex]
                .label ?? data[hoveredPoint.seriesIndex].name}
            </div>
            <div className="text-muted-foreground">
              x:{" "}
              {data[hoveredPoint.seriesIndex].data[
                hoveredPoint.pointIndex
              ].x.toLocaleString()}
            </div>
            <div className="text-muted-foreground">
              y:{" "}
              {data[hoveredPoint.seriesIndex].data[
                hoveredPoint.pointIndex
              ].y.toLocaleString()}
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
