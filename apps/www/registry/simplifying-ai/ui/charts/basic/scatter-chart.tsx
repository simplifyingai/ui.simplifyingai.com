"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartGrid } from "../chart-grid"
import {
  ChartLegend,
  ChartLegendLayout,
  useSeriesHighlight,
  type LegendItem,
} from "../chart-legend"
import { ChartTooltipContent,
  ChartTooltipSurface,
} from "../chart-tooltip"
import {
  ChartZoomResetButton,
  ChartZoomSelectionRect,
  useChartZoom,
} from "../chart-zoom"

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
// Default colors using CSS variables
const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

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
  legendPosition = "right",
  xAxisLabel,
  yAxisLabel,
  sizeRange = [6, 20],
  symbol = "circle",
  size = 8,
  showTrendLine = false,
}: ScatterChartProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    seriesIndex: number
    pointIndex: number
    point: ScatterChartDataPoint
    x: number
    y: number
  } | null>(null)
  // Legend highlight: click a series to emphasize it (others fade but stay
  // drawn), hover to preview — Plotly-style. `focused` = hover ?? selection.
  const highlight = useSeriesHighlight()
  const [zoomDomain, setZoomDomain] = React.useState<[number, number] | null>(
    null
  )
  const isZoomed = zoomDomain !== null

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Apply the active zoom window (if any) by filtering each series down to
  // the selected x-range before it reaches the scales.
  const plotData = React.useMemo((): ScatterChartSeries[] => {
    if (!zoomDomain) return data
    const [lo, hi] = zoomDomain
    return data.map((series) => ({
      ...series,
      data: series.data.filter((d) => d.x >= lo && d.x <= hi),
    }))
  }, [data, zoomDomain])

  // Flatten currently-visible data points for scales
  const allPoints = plotData.flatMap((series) => series.data)

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

  // Drag-to-zoom: converts the pixel drag range into a data-domain range
  // and narrows the view to it. Re-zooming while already zoomed narrows
  // further (inverted against the current, already-zoomed scale).
  const zoom = useChartZoom({
    svgRef,
    marginLeft: margin.left,
    innerWidth,
    onZoom: ({ x0, x1 }) => {
      const lo = xScale.invert(x0)
      const hi = xScale.invert(x1)
      const hasPointsInRange = allPoints.some((d) => d.x >= lo && d.x <= hi)
      if (hasPointsInRange) setZoomDomain([lo, hi])
    },
    onReset: () => setZoomDomain(null),
  })

  // Legend items
  const legendItems: LegendItem[] = data.map((series, index) => ({
    name: series.name,
    color: series.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }))

  return (
    <ChartContainer
      config={config}
      className={cn("relative !aspect-auto", className)}
    >
      {/* Plot + legend layout — legend sits on `legendPosition` side, click
          a series to highlight it (others fade), click again to restore */}
      <ChartLegendLayout
        position={legendPosition}
        show={showLegend && data.length > 1}
        legend={
          <ChartLegend
            items={legendItems}
            position={legendPosition}
            onItemHover={highlight.setHovered}
            onItemClick={highlight.toggle}
            isItemActive={highlight.isActive}
          />
        }
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full overflow-visible select-none"
          onMouseDown={zoom.handlers.onMouseDown}
          onMouseMove={zoom.handlers.onMouseMove}
          onMouseUp={zoom.handlers.onMouseUp}
          onMouseLeave={zoom.handlers.onMouseLeave}
          onDoubleClick={zoom.handlers.onDoubleClick}
        >
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
              const seriesColor =
                series.color ??
                DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length]
              const seriesSymbol = series.symbol ?? symbol
              const isActive = highlight.isActive(series.name)
              const plotSeries = plotData[seriesIndex]

              return plotSeries.data.map((point, pointIndex) => {
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
                      !isActive && "opacity-30"
                    )}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        seriesIndex,
                        pointIndex,
                        point,
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
            <ChartTooltipSurface>
              <div className="mb-1 font-medium">
                {hoveredPoint.point.label ??
                  data[hoveredPoint.seriesIndex].name}
              </div>
              <div className="text-muted-foreground">
                x: {hoveredPoint.point.x.toLocaleString()}
              </div>
              <div className="text-muted-foreground">
                y: {hoveredPoint.point.y.toLocaleString()}
              </div>
            </ChartTooltipSurface>
          </div>
        )}

        <ChartZoomResetButton
          visible={isZoomed}
          onReset={() => setZoomDomain(null)}
        />
      </ChartLegendLayout>
    </ChartContainer>
  )
}
