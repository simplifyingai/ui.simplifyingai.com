"use client"

import * as React from "react"
import { scaleBand, scaleLinear, scaleTime } from "d3-scale"
import {
  area,
  curveBasis,
  curveCardinal,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  line,
} from "d3-shape"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartHorizontalGrid, ChartVerticalGrid } from "../chart-grid"
import { ChartLegend, type LegendItem } from "../chart-legend"

// ============================================================================
// Types & Interfaces
// ============================================================================

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
  /** Data series to display */
  data: LineChartSeries[]
  /** X-axis label */
  xAxisLabel?: string
  /** Y-axis label */
  yAxisLabel?: string
  /** Line curve interpolation */
  curve?: "linear" | "monotone" | "cardinal" | "step" | "natural" | "basis"
  /** Show data points */
  showDots?: boolean
  /** Dot radius */
  dotSize?: number
  /** Line stroke width */
  strokeWidth?: number
  /** X-axis data type */
  xType?: "category" | "number" | "time"
  /** Chart variant */
  variant?: "default" | "smooth" | "multi" | "stock" | "sparkline"
  /** Show area fill under lines */
  showArea?: boolean
  /** Area fill opacity */
  areaOpacity?: number
  /** Show crosshair on hover */
  showCrosshair?: boolean
  /** Y-axis value formatter */
  yAxisFormatter?: (value: number) => string
  /** Chart title (for stock variant) */
  title?: string
  /** Chart subtitle */
  subtitle?: string
  /** Line color (for single series) */
  color?: string
  /** Animate on load */
  animate?: boolean
  /** Show data labels on dots */
  showDataLabels?: boolean
  /** Show Y axis */
  showYAxis?: boolean
}

// ============================================================================
// Constants
// ============================================================================

const curveMap = {
  linear: curveLinear,
  monotone: curveMonotoneX,
  cardinal: curveCardinal,
  step: curveStep,
  natural: curveNatural,
  basis: curveBasis,
}

// Default colors for multi-line variant
const MULTI_LINE_COLORS = [
  "#2563eb", // blue
  "#06b6d4", // cyan
  "#f97316", // orange
  "#8b5cf6", // violet
  "#eab308", // yellow
  "#ec4899", // pink
  "#22c55e", // green
  "#64748b", // slate
]

// ============================================================================
// Helper Functions
// ============================================================================

function formatDateAxis(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}`
}

function defaultYFormatter(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(0)
}

// ============================================================================
// Component
// ============================================================================

export function LineChart({
  data,
  config,
  className,
  width = 600,
  height = 400,
  margin: marginProp,
  showGrid: showGridProp,
  showTooltip = true,
  showLegend: showLegendProp,
  xAxisLabel,
  yAxisLabel,
  curve: curveProp,
  showDots: showDotsProp,
  dotSize = 4,
  strokeWidth: strokeWidthProp,
  xType = "category",
  variant = "default",
  showArea: showAreaProp,
  areaOpacity = 0.15,
  showCrosshair: showCrosshairProp,
  yAxisFormatter,
  title,
  subtitle,
  color,
  animate = false,
  showDataLabels: showDataLabelsProp,
  showYAxis: showYAxisProp,
}: LineChartProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    seriesIndex: number
    pointIndex: number
    x: number
    y: number
  } | null>(null)
  const [hoveredSeries, setHoveredSeries] = React.useState<string | null>(null)
  const [crosshairX, setCrosshairX] = React.useState<number | null>(null)

  // Variant-specific defaults
  const getVariantDefaults = () => {
    switch (variant) {
      case "smooth":
        return {
          curve: "natural" as const,
          showDots: false,
          strokeWidth: 2,
          showArea: false,
          showLegend: false,
          showGrid: false,
          showCrosshair: true,
          showDataLabels: false,
          showYAxis: false,
          margin: { top: 20, right: 20, bottom: 40, left: 20 },
        }
      case "multi":
        return {
          curve: "monotone" as const,
          showDots: false,
          strokeWidth: 2,
          showArea: false,
          showLegend: false,
          showGrid: true,
          showCrosshair: true,
          showDataLabels: false,
          showYAxis: true,
          margin: { top: 20, right: 20, bottom: 40, left: 60 },
        }
      case "stock":
        return {
          curve: "linear" as const,
          showDots: false,
          strokeWidth: 1.5,
          showArea: false,
          showLegend: false,
          showGrid: true,
          showCrosshair: true,
          showDataLabels: false,
          showYAxis: true,
          margin: { top: 60, right: 20, bottom: 50, left: 70 },
        }
      case "sparkline":
        return {
          curve: "monotone" as const,
          showDots: false,
          strokeWidth: 1.5,
          showArea: true,
          showLegend: false,
          showGrid: false,
          showTooltip: false,
          showDataLabels: false,
          showYAxis: false,
          margin: { top: 5, right: 5, bottom: 5, left: 5 },
        }
      default:
        return {
          curve: "natural" as const,
          showDots: true,
          strokeWidth: 2,
          showArea: false,
          showLegend: false,
          showGrid: false,
          showCrosshair: false,
          showDataLabels: true,
          showYAxis: false,
          margin: { top: 40, right: 30, bottom: 50, left: 30 },
        }
    }
  }

  const defaults = getVariantDefaults()
  const margin = marginProp ?? defaults.margin
  const showDots = showDotsProp ?? defaults.showDots
  const strokeWidth = strokeWidthProp ?? defaults.strokeWidth
  const curve = curveProp ?? defaults.curve
  const showArea = showAreaProp ?? defaults.showArea
  const showGrid = showGridProp ?? defaults.showGrid
  const showLegend = showLegendProp ?? defaults.showLegend
  const showCrosshair = showCrosshairProp ?? defaults.showCrosshair
  const showDataLabels = showDataLabelsProp ?? defaults.showDataLabels
  const showYAxis = showYAxisProp ?? defaults.showYAxis

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

    // For stock variant, don't include 0 in domain
    if (variant === "stock" || variant === "sparkline") {
      return scaleLinear()
        .domain([yMin - padding, yMax + padding])
        .range([innerHeight, 0])
        .nice()
    }

    return scaleLinear()
      .domain([Math.min(0, yMin - padding), yMax + padding])
      .range([innerHeight, 0])
      .nice()
  }, [allPoints, innerHeight, variant])

  // Get X position
  const getX = (point: LineChartDataPoint): number => {
    if (xType === "number") {
      return (xScale as ReturnType<typeof scaleLinear<number, number>>)(
        point.x as number
      ) as number
    }
    if (xType === "time") {
      return (xScale as ReturnType<typeof scaleTime<number, number>>)(
        new Date(point.x as string | Date)
      ) as number
    }
    const bandScale = xScale as ReturnType<typeof scaleBand<string>>
    return (bandScale(String(point.x)) ?? 0) + bandScale.bandwidth() / 2
  }

  // Generate line path
  const lineFn = line<LineChartDataPoint>()
    .x((d) => getX(d))
    .y((d) => yScale(d.y))
    .curve(curveMap[curve])

  // Generate area path
  const areaFn = area<LineChartDataPoint>()
    .x((d) => getX(d))
    .y0(innerHeight)
    .y1((d) => yScale(d.y))
    .curve(curveMap[curve])

  // Get series color
  const getSeriesColor = (series: LineChartSeries, index: number): string => {
    if (series.color) return series.color
    if (color && data.length === 1) return color
    const configColor = config?.[series.name]?.color
    if (configColor) return configColor
    if (variant === "smooth") return "#93c5fd"
    return MULTI_LINE_COLORS[index % MULTI_LINE_COLORS.length]
  }

  // Legend items
  const legendItems: LegendItem[] = data.map((series, i) => ({
    name: series.name,
    color: getSeriesColor(series, i),
  }))

  // Y-axis formatter
  const formatYValue = yAxisFormatter ?? defaultYFormatter

  // Handle mouse move for crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!showCrosshair) return
    const svg = svgRef.current
    if (!svg) return

    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return

    const svgPoint = pt.matrixTransform(ctm.inverse())
    const x = svgPoint.x - margin.left

    if (x >= 0 && x <= innerWidth) {
      setCrosshairX(x)
    }
  }

  const handleMouseLeave = () => {
    setCrosshairX(null)
    setHoveredPoint(null)
  }

  // Find closest point to crosshair
  const getClosestPoints = React.useCallback(() => {
    if (crosshairX === null) return null

    return data.map((series, seriesIndex) => {
      let closestPoint = series.data[0]
      let closestDist = Infinity
      let closestIdx = 0

      series.data.forEach((point, idx) => {
        const dist = Math.abs(getX(point) - crosshairX)
        if (dist < closestDist) {
          closestDist = dist
          closestPoint = point
          closestIdx = idx
        }
      })

      return { point: closestPoint, index: closestIdx, seriesIndex }
    })
  }, [crosshairX, data, getX])

  const closestPoints = getClosestPoints()

  return (
    <ChartContainer
      config={config}
      className={cn("relative flex-col", className)}
    >
      {/* Title for stock variant */}
      {variant === "stock" && title && (
        <div className="absolute top-0 left-0 px-4 pt-2 pb-4">
          <div className="text-foreground text-sm font-semibold">{title}</div>
          {subtitle && (
            <div className="text-muted-foreground mt-0.5 text-xs">
              {subtitle}
            </div>
          )}
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full flex-1"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Gradient definitions for area fill */}
        <defs>
          {data.map((series, idx) => {
            const seriesColor = getSeriesColor(series, idx)
            return (
              <linearGradient
                key={`gradient-${idx}`}
                id={`area-gradient-${idx}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={seriesColor}
                  stopOpacity={areaOpacity * 2}
                />
                <stop offset="100%" stopColor={seriesColor} stopOpacity={0} />
              </linearGradient>
            )
          })}
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Invisible background for mouse events */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            className="cursor-crosshair"
          />

          {/* Grid */}
          {showGrid && (
            <>
              <ChartHorizontalGrid scale={yScale} width={innerWidth} />
              {variant === "stock" && xType === "time" && (
                <ChartVerticalGrid
                  scale={
                    xScale as unknown as {
                      ticks: (count?: number) => unknown[];
                      (value: unknown): number
                    }
                  }
                  height={innerHeight}
                />
              )}
            </>
          )}

          {/* Crosshair */}
          {showCrosshair && crosshairX !== null && (
            <line
              x1={crosshairX}
              y1={0}
              x2={crosshairX}
              y2={innerHeight}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          )}

          {/* Areas */}
          {showArea &&
            data.map((series, seriesIndex) => {
              const isHovered =
                hoveredSeries === null || hoveredSeries === series.name

              return (
                <path
                  key={`area-${series.name}`}
                  d={areaFn(series.data) ?? ""}
                  fill={`url(#area-gradient-${seriesIndex})`}
                  className={cn(
                    "transition-opacity duration-200",
                    !isHovered && "opacity-30"
                  )}
                />
              )
            })}

          {/* Lines */}
          {data.map((series, seriesIndex) => {
            const seriesColor = getSeriesColor(series, seriesIndex)
            const isHovered =
              hoveredSeries === null || hoveredSeries === series.name

            return (
              <g key={series.name}>
                {/* Invisible hit area for better mouse interaction */}
                <path
                  d={lineFn(series.data) ?? ""}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                  className="cursor-pointer"
                  style={{ pointerEvents: "stroke" }}
                />
                {/* Visible Line */}
                <path
                  d={lineFn(series.data) ?? ""}
                  fill="none"
                  stroke={seriesColor}
                  strokeWidth={series.strokeWidth ?? strokeWidth}
                  strokeDasharray={series.strokeDasharray}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ pointerEvents: "none" }}
                  className={cn(
                    "transition-opacity duration-200",
                    !isHovered && "opacity-30",
                    animate && "animate-draw"
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

                {/* Data Labels */}
                {showDataLabels &&
                  series.data.map((point, pointIndex) => {
                    const x = getX(point)
                    const y = yScale(point.y)
                    // Position label above or below based on surrounding points
                    const prevY =
                      pointIndex > 0 ? yScale(series.data[pointIndex - 1].y) : y
                    const nextY =
                      pointIndex < series.data.length - 1
                        ? yScale(series.data[pointIndex + 1].y)
                        : y
                    const isLocalMin = y > prevY && y > nextY
                    const labelY = isLocalMin ? y + 20 : y - 12

                    return (
                      <text
                        key={`label-${pointIndex}`}
                        x={x}
                        y={labelY}
                        textAnchor="middle"
                        className="fill-muted-foreground text-xs font-medium"
                        style={{ pointerEvents: "none" }}
                      >
                        {Math.round(point.y)}
                      </text>
                    )
                  })}

                {/* Crosshair dots */}
                {showCrosshair && closestPoints && (
                  <circle
                    cx={getX(closestPoints[seriesIndex].point)}
                    cy={yScale(closestPoints[seriesIndex].point.y)}
                    r={5}
                    fill="var(--background)"
                    stroke={seriesColor}
                    strokeWidth={2}
                    className={cn(!isHovered && "opacity-30")}
                  />
                )}
              </g>
            )
          })}

          {/* X Axis */}
          {variant !== "sparkline" && (
            <ChartAxis
              scale={xScale}
              orientation="bottom"
              transform={`translate(0, ${innerHeight})`}
              label={xAxisLabel}
              tickFormat={
                xType === "time" ? (d) => formatDateAxis(d as Date) : undefined
              }
            />
          )}

          {/* Y Axis */}
          {variant !== "sparkline" && showYAxis && (
            <ChartAxis
              scale={yScale}
              orientation="left"
              label={yAxisLabel}
              tickFormat={(d) => formatYValue(d as number)}
            />
          )}
        </g>
      </svg>

      {/* Crosshair Tooltip */}
      {showCrosshair && crosshairX !== null && closestPoints && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: margin.left + crosshairX + 15,
            top: margin.top + 10,
          }}
        >
          <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
            <div className="text-muted-foreground mb-1.5 font-medium">
              {xType === "time"
                ? formatDateAxis(
                    new Date(closestPoints[0].point.x as string | Date)
                  )
                : String(closestPoints[0].point.x)}
            </div>
            {closestPoints.map((cp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getSeriesColor(data[idx], idx) }}
                />
                <span className="text-muted-foreground">{data[idx].name}:</span>
                <span className="font-medium">{formatYValue(cp.point.y)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Tooltip */}
      {showTooltip && !showCrosshair && hoveredPoint && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: margin.left + hoveredPoint.x + 10,
            top: margin.top + hoveredPoint.y - 10,
          }}
        >
          <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            {data.length > 1 && (
              <div
                className="mb-1 font-medium"
                style={{
                  color: getSeriesColor(
                    data[hoveredPoint.seriesIndex],
                    hoveredPoint.seriesIndex
                  ),
                }}
              >
                {data[hoveredPoint.seriesIndex].name}
              </div>
            )}
            <div className="text-muted-foreground">
              {String(
                data[hoveredPoint.seriesIndex].data[hoveredPoint.pointIndex].x
              )}
            </div>
            <div className="font-medium">
              {formatYValue(
                data[hoveredPoint.seriesIndex].data[hoveredPoint.pointIndex].y
              )}
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
