"use client"

import * as React from "react"
import { scaleBand, scaleLinear, scaleTime } from "d3-scale"
import {
  curveCardinal,
  curveLinear,
  curveMonotoneX,
  curveStep,
  line,
} from "d3-shape"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartHorizontalGrid } from "../chart-grid"
import { ChartLegend, type LegendItem } from "../chart-legend"
import { ChartTooltipContent } from "../chart-tooltip"

export interface LineChartDataPoint {
  x: string | number | Date
  y: number
  [key: string]: unknown
}

export interface LineChartSeries {
  name: string
  data: LineChartDataPoint[]
  color?: string
  strokeWidth?: number
  strokeDasharray?: string
  showDots?: boolean
  dotSize?: number
}

export interface LineChartProps extends BaseChartProps {
  data: LineChartSeries[]
  xAxisLabel?: string
  yAxisLabel?: string
  curve?: "linear" | "monotone" | "cardinal" | "step"
  showDots?: boolean
  dotSize?: number
  strokeWidth?: number
  xType?: "category" | "number" | "time"
}

const curveMap = {
  linear: curveLinear,
  monotone: curveMonotoneX,
  cardinal: curveCardinal,
  step: curveStep,
}

export function LineChart({
  data,
  config,
  className,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 40, left: 50 },
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
  curve = "monotone",
  showDots = true,
  dotSize = 4,
  strokeWidth = 2,
  xType = "category",
}: LineChartProps) {
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

  // X Scale
  const xScale = React.useMemo(() => {
    if (xType === "number") {
      const xValues = allPoints.map((d) => d.x as number)
      return scaleLinear()
        .domain([Math.min(...xValues), Math.max(...xValues)])
        .range([0, innerWidth])
    }
    if (xType === "time") {
      const xValues = allPoints.map((d) =>
        new Date(d.x as string | Date).getTime()
      )
      return scaleTime()
        .domain([
          new Date(Math.min(...xValues)),
          new Date(Math.max(...xValues)),
        ])
        .range([0, innerWidth])
    }
    // Category
    const categories = [...new Set(allPoints.map((d) => String(d.x)))]
    return scaleBand().domain(categories).range([0, innerWidth]).padding(0)
  }, [allPoints, innerWidth, xType])

  // Y Scale
  const yScale = React.useMemo(() => {
    const yValues = allPoints.map((d) => d.y)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    const padding = (yMax - yMin) * 0.1
    return scaleLinear()
      .domain([Math.min(0, yMin - padding), yMax + padding])
      .range([innerHeight, 0])
      .nice()
  }, [allPoints, innerHeight])

  // Get X position
  const getX = (point: LineChartDataPoint): number => {
    if (xType === "number") {
      return (xScale as ReturnType<typeof scaleLinear>)(point.x as number)
    }
    if (xType === "time") {
      return (xScale as ReturnType<typeof scaleTime>)(
        new Date(point.x as string | Date)
      )
    }
    const bandScale = xScale as ReturnType<typeof scaleBand>
    return (bandScale(String(point.x)) ?? 0) + bandScale.bandwidth() / 2
  }

  // Generate line path
  const lineFn = line<LineChartDataPoint>()
    .x((d) => getX(d))
    .y((d) => yScale(d.y))
    .curve(curveMap[curve])

  // Legend items
  const legendItems: LegendItem[] = data.map((series, i) => ({
    name: series.name,
    color:
      series.color ?? config?.[series.name]?.color ?? `var(--chart-${i + 1})`,
  }))

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {showGrid && (
            <ChartHorizontalGrid scale={yScale} width={innerWidth} />
          )}

          {/* Lines */}
          {data.map((series, seriesIndex) => {
            const seriesColor =
              series.color ??
              config?.[series.name]?.color ??
              `var(--chart-${seriesIndex + 1})`
            const isHovered =
              hoveredSeries === null || hoveredSeries === series.name

            return (
              <g key={series.name}>
                {/* Line */}
                <path
                  d={lineFn(series.data) ?? ""}
                  fill="none"
                  stroke={seriesColor}
                  strokeWidth={series.strokeWidth ?? strokeWidth}
                  strokeDasharray={series.strokeDasharray}
                  className={cn(
                    "transition-opacity duration-200",
                    !isHovered && "opacity-30"
                  )}
                />

                {/* Dots */}
                {(series.showDots ?? showDots) &&
                  series.data.map((point, pointIndex) => (
                    <circle
                      key={pointIndex}
                      cx={getX(point)}
                      cy={yScale(point.y)}
                      r={
                        hoveredPoint?.seriesIndex === seriesIndex &&
                        hoveredPoint?.pointIndex === pointIndex
                          ? (series.dotSize ?? dotSize) * 1.5
                          : (series.dotSize ?? dotSize)
                      }
                      fill={seriesColor}
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        !isHovered && "opacity-30"
                      )}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          seriesIndex,
                          pointIndex,
                          x: getX(point),
                          y: yScale(point.y),
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
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
      {showTooltip && hoveredPoint && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: margin.left + hoveredPoint.x + 10,
            top: margin.top + hoveredPoint.y - 10,
          }}
        >
          <ChartTooltipContent
            label={String(
              data[hoveredPoint.seriesIndex].data[hoveredPoint.pointIndex].x
            )}
            value={
              data[hoveredPoint.seriesIndex].data[hoveredPoint.pointIndex].y
            }
            color={
              data[hoveredPoint.seriesIndex].color ??
              config?.[data[hoveredPoint.seriesIndex].name]?.color ??
              `var(--chart-${hoveredPoint.seriesIndex + 1})`
            }
          />
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <ChartLegend items={legendItems} onItemHover={setHoveredSeries} />
      )}
    </ChartContainer>
  )
}
