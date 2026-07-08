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
import {
  ChartZoomResetButton,
  ChartZoomSelectionRect,
  getBandScaleIndexRange,
  useChartZoom,
} from "../chart-zoom"

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

// Default colors for multi-line variant (CSS variables for theme support)
const MULTI_LINE_COLORS = [
  "var(--chart-3)",
  "var(--chart-1)",
  "var(--chart-5)",
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-1)",
  "var(--chart-5)",
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
    point: LineChartDataPoint
    x: number
    y: number
  } | null>(null)
  const [hoveredSeries, setHoveredSeries] = React.useState<string | null>(null)
  const [crosshairX, setCrosshairX] = React.useState<number | null>(null)
  const [activeSeries, setActiveSeries] = React.useState<string | null>(null)
  const [zoomDomain, setZoomDomain] = React.useState<[number, number] | null>(
    null
  )
  const isZoomed = zoomDomain !== null

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

  // Full (unzoomed) points establish the stable category order and index
  // range that drag-to-zoom windows are computed against.
  const fullPoints = data.flatMap((series) => series.data)
  const fullCategories = React.useMemo(
    () => [...new Set(fullPoints.map((d) => String(d.x)))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  // Apply the active zoom window (if any) by filtering each series down
  // to the selected x-range — for xType="category" the range is a pair of
  // indices into `fullCategories`, otherwise it's raw x values.
  const plotData = React.useMemo((): LineChartSeries[] => {
    if (!zoomDomain) return data
    const [lo, hi] = zoomDomain
    if (xType === "category") {
      const selected = new Set(fullCategories.slice(lo, hi + 1))
      return data.map((series) => ({
        ...series,
        data: series.data.filter((d) => selected.has(String(d.x))),
      }))
    }
    return data.map((series) => ({
      ...series,
      data: series.data.filter((d) => {
        const v =
          xType === "time"
            ? new Date(d.x as string | Date).getTime()
            : (d.x as number)
        return v >= lo && v <= hi
      }),
    }))
  }, [data, zoomDomain, xType, fullCategories])

  // Flatten currently-visible data points for scales
  const allPoints = plotData.flatMap((series) => series.data)

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
    const categories = zoomDomain
      ? fullCategories.slice(zoomDomain[0], zoomDomain[1] + 1)
      : fullCategories
    return scaleBand().domain(categories).range([0, innerWidth]).padding(0)
  }, [allPoints, innerWidth, xType, zoomDomain, fullCategories])

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

  // Drag-to-zoom: converts the pixel drag range into a data-domain range
  // and narrows the view to it. Re-zooming while already zoomed narrows
  // further (inverted against the current, already-zoomed scale).
  const zoom = useChartZoom({
    svgRef,
    marginLeft: margin.left,
    innerWidth,
    disabled: variant === "sparkline",
    onZoom: ({ x0, x1 }) => {
      if (xType === "category") {
        const [start, end] = getBandScaleIndexRange(
          xScale as ReturnType<typeof scaleBand<string>>,
          x0,
          x1
        )
        const currentOffset = zoomDomain ? zoomDomain[0] : 0
        setZoomDomain([currentOffset + start, currentOffset + end])
        return
      }
      const scale = xScale as ReturnType<
        typeof scaleLinear<number, number> | typeof scaleTime<number, number>
      >
      const lo = scale.invert(x0)
      const hi = scale.invert(x1)
      const loVal = lo instanceof Date ? lo.getTime() : (lo as number)
      const hiVal = hi instanceof Date ? hi.getTime() : (hi as number)
      const hasPointsInRange = allPoints.some((d) => {
        const v =
          xType === "time"
            ? new Date(d.x as string | Date).getTime()
            : (d.x as number)
        return v >= loVal && v <= hiVal
      })
      if (hasPointsInRange) setZoomDomain([loVal, hiVal])
    },
    onReset: () => setZoomDomain(null),
  })

  const isSeriesVisible = React.useCallback(
    (name: string) => activeSeries === null || activeSeries === name,
    [activeSeries]
  )

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
    if (variant === "smooth") return "var(--chart-3)"
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

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    handleMouseMove(e)
    zoom.handlers.onMouseMove(e)
  }

  const handleSvgMouseLeave = (e: React.MouseEvent<SVGSVGElement>) => {
    handleMouseLeave()
    zoom.handlers.onMouseLeave(e)
  }

  // Find closest point to crosshair (skips series that are empty in the
  // current zoom window or hidden via legend isolate; keeps the array
  // index-aligned with `data`/`plotData` so callers can index by
  // seriesIndex directly)
  const getClosestPoints = React.useCallback(() => {
    if (crosshairX === null) return null

    return data.map((series, seriesIndex) => {
      const plotSeries = plotData[seriesIndex]
      if (
        !plotSeries ||
        plotSeries.data.length === 0 ||
        !isSeriesVisible(series.name)
      ) {
        return null
      }

      let closestPoint = plotSeries.data[0]
      let closestDist = Infinity
      let closestIdx = 0

      plotSeries.data.forEach((point, idx) => {
        const dist = Math.abs(getX(point) - crosshairX)
        if (dist < closestDist) {
          closestDist = dist
          closestPoint = point
          closestIdx = idx
        }
      })

      return { point: closestPoint, index: closestIdx, seriesIndex }
    })
  }, [crosshairX, data, plotData, getX, isSeriesVisible])

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
        className="h-full w-full flex-1 select-none"
        onMouseMove={handleSvgMouseMove}
        onMouseLeave={handleSvgMouseLeave}
        onMouseDown={zoom.handlers.onMouseDown}
        onMouseUp={zoom.handlers.onMouseUp}
        onDoubleClick={zoom.handlers.onDoubleClick}
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

          {/* Drag-to-zoom selection rectangle */}
          <ChartZoomSelectionRect
            range={zoom.dragRange}
            height={innerHeight}
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
              if (!isSeriesVisible(series.name)) return null
              const plotSeries = plotData[seriesIndex]
              const isHovered =
                hoveredSeries === null || hoveredSeries === series.name

              return (
                <path
                  key={`area-${series.name}`}
                  d={areaFn(plotSeries.data) ?? ""}
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
            if (!isSeriesVisible(series.name)) return null
            const plotSeries = plotData[seriesIndex]
            const seriesColor = getSeriesColor(series, seriesIndex)
            const isHovered =
              hoveredSeries === null || hoveredSeries === series.name

            return (
              <g key={series.name}>
                {/* Invisible hit area for better mouse interaction */}
                <path
                  d={lineFn(plotSeries.data) ?? ""}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                  className="cursor-pointer"
                  style={{ pointerEvents: "stroke" }}
                />
                {/* Visible Line */}
                <path
                  d={lineFn(plotSeries.data) ?? ""}
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
                  plotSeries.data.map((point, pointIndex) => (
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
                          point,
                          x: getX(point),
                          y: yScale(point.y),
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}

                {/* Data Labels */}
                {showDataLabels &&
                  plotSeries.data.map((point, pointIndex) => {
                    const x = getX(point)
                    const y = yScale(point.y)
                    // Position label above or below based on surrounding points
                    const prevY =
                      pointIndex > 0
                        ? yScale(plotSeries.data[pointIndex - 1].y)
                        : y
                    const nextY =
                      pointIndex < plotSeries.data.length - 1
                        ? yScale(plotSeries.data[pointIndex + 1].y)
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
                {showCrosshair && closestPoints?.[seriesIndex] && (
                  <circle
                    cx={getX(closestPoints[seriesIndex]!.point)}
                    cy={yScale(closestPoints[seriesIndex]!.point.y)}
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
            {(() => {
              const headPoint = closestPoints.find((cp) => cp !== null)?.point
              if (!headPoint) return null
              return (
                <div className="text-muted-foreground mb-1.5 font-medium">
                  {xType === "time"
                    ? formatDateAxis(new Date(headPoint.x as string | Date))
                    : String(headPoint.x)}
                </div>
              )
            })()}
            {closestPoints.map(
              (cp, idx) =>
                cp && (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: getSeriesColor(data[idx], idx),
                      }}
                    />
                    <span className="text-muted-foreground">
                      {data[idx].name}:
                    </span>
                    <span className="font-medium">
                      {formatYValue(cp.point.y)}
                    </span>
                  </div>
                )
            )}
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
              {String(hoveredPoint.point.x)}
            </div>
            <div className="font-medium">
              {formatYValue(hoveredPoint.point.y)}
            </div>
          </div>
        </div>
      )}

      {/* Legend — click an item to isolate that series, click again to
          restore all */}
      {showLegend && data.length > 1 && (
        <ChartLegend
          items={legendItems}
          onItemHover={setHoveredSeries}
          onItemClick={(name) =>
            setActiveSeries((prev) => (prev === name ? null : name))
          }
          isItemActive={isSeriesVisible}
        />
      )}

      <ChartZoomResetButton
        visible={isZoomed}
        onReset={() => setZoomDomain(null)}
      />
    </ChartContainer>
  )
}
