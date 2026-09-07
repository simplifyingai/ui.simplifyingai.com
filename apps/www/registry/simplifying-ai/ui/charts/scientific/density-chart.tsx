"use client"

import * as React from "react"
import { contourDensity } from "d3-contour"
import { geoPath } from "d3-geo"
import { scaleLinear, scaleSequential } from "d3-scale"
import { interpolateBlues } from "d3-scale-chromatic"

import { cn } from "@/lib/utils"

import {
  ChartZoomResetButton,
  ChartZoomSelectionRect,
  useChartZoom,
} from "../chart-zoom"

export interface DensityDataPoint {
  x: number
  y: number
}

export interface DensityChartProps {
  data: DensityDataPoint[]
  className?: string
  showPoints?: boolean
  showContours?: boolean
  bandwidth?: number
  thresholds?: number
  pointRadius?: number
  pointColor?: string
  colorScale?: (t: number) => string
  xAxisLabel?: string
  yAxisLabel?: string
}

export function DensityChart({
  data,
  className,
  showPoints = true,
  showContours = true,
  bandwidth = 20,
  thresholds = 10,
  pointRadius = 3,
  pointColor = "#1e40af",
  colorScale = interpolateBlues,
  xAxisLabel,
  yAxisLabel,
}: DensityChartProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null)
  const [zoomDomain, setZoomDomain] = React.useState<[number, number] | null>(
    null
  )
  const isZoomed = zoomDomain !== null

  const width = 500
  const height = 400
  const margin = { top: 20, right: 20, bottom: 50, left: 60 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Apply the active zoom window (if any) by filtering the point cloud
  // down to the selected x-range before it reaches the scales/density
  // generator.
  const plotData = React.useMemo(() => {
    if (!zoomDomain) return data
    const [lo, hi] = zoomDomain
    return data.filter((d) => d.x >= lo && d.x <= hi)
  }, [data, zoomDomain])

  // X Scale
  const xExtent = React.useMemo(() => {
    const xValues = plotData.map((d) => d.x)
    const min = Math.min(...xValues)
    const max = Math.max(...xValues)
    const padding = (max - min) * 0.1
    return [min - padding, max + padding]
  }, [plotData])

  const xScale = scaleLinear().domain(xExtent).range([0, innerWidth]).nice()

  // Y Scale
  const yExtent = React.useMemo(() => {
    const yValues = plotData.map((d) => d.y)
    const min = Math.min(...yValues)
    const max = Math.max(...yValues)
    const padding = (max - min) * 0.1
    return [min - padding, max + padding]
  }, [plotData])

  const yScale = scaleLinear().domain(yExtent).range([innerHeight, 0]).nice()

  // Contour density
  const contours = React.useMemo(() => {
    if (!showContours) return []

    const densityGenerator = contourDensity<DensityDataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .size([innerWidth, innerHeight])
      .bandwidth(bandwidth)
      .thresholds(thresholds)

    return densityGenerator(plotData)
  }, [
    plotData,
    xScale,
    yScale,
    innerWidth,
    innerHeight,
    bandwidth,
    thresholds,
    showContours,
  ])

  // Color scale for contours
  const densityColorScale = scaleSequential(colorScale).domain([
    0,
    Math.max(...contours.map((c) => c.value)),
  ])

  // Path generator
  const pathGenerator = geoPath()

  // Axis ticks
  const xTicks = xScale.ticks(6)
  const yTicks = yScale.ticks(6)

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
      const hasPointsInRange = plotData.some((d) => d.x >= lo && d.x <= hi)
      if (hasPointsInRange) setZoomDomain([lo, hi])
    },
    onReset: () => setZoomDomain(null),
  })

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible select-none"
        onMouseDown={zoom.handlers.onMouseDown}
        onMouseMove={zoom.handlers.onMouseMove}
        onMouseUp={zoom.handlers.onMouseUp}
        onMouseLeave={zoom.handlers.onMouseLeave}
        onDoubleClick={zoom.handlers.onDoubleClick}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {xTicks.map((tick) => (
            <line
              key={`x-grid-${tick}`}
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={0}
              y2={innerHeight}
              stroke="var(--border)"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}
          {yTicks.map((tick) => (
            <line
              key={`y-grid-${tick}`}
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="var(--border)"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}

          {/* Contours */}
          {showContours &&
            contours.map((contour, i) => (
              <path
                key={`contour-${i}`}
                d={pathGenerator(contour) ?? ""}
                fill={densityColorScale(contour.value)}
                fillOpacity={0.6}
                stroke={densityColorScale(contour.value)}
                strokeWidth={0.5}
              />
            ))}

          {/* Points */}
          {showPoints &&
            plotData.map((d, i) => {
              const isHovered = hoveredPoint === i
              return (
                <circle
                  key={`point-${i}`}
                  cx={xScale(d.x)}
                  cy={yScale(d.y)}
                  r={isHovered ? pointRadius * 1.5 : pointRadius}
                  fill={pointColor}
                  fillOpacity={showContours ? 0.7 : 1}
                  stroke="#fff"
                  strokeWidth={1}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              )
            })}

          {/* Drag-to-zoom selection rectangle — drawn above the contours
              and points so the selection stays visible while dragging. */}
          <ChartZoomSelectionRect range={zoom.dragRange} height={innerHeight} />

          {/* X Axis */}
          <g transform={`translate(0, ${innerHeight})`}>
            <line x1={0} x2={innerWidth} stroke="var(--border)" />
            {xTicks.map((tick) => (
              <g key={tick} transform={`translate(${xScale(tick)}, 0)`}>
                <line y2={5} stroke="var(--border)" />
                <text
                  y={18}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs"
                >
                  {tick}
                </text>
              </g>
            ))}
            {xAxisLabel && (
              <text
                x={innerWidth / 2}
                y={40}
                textAnchor="middle"
                className="fill-foreground text-xs font-medium"
              >
                {xAxisLabel}
              </text>
            )}
          </g>

          {/* Y Axis */}
          <g>
            <line y1={0} y2={innerHeight} stroke="var(--border)" />
            {yTicks.map((tick) => (
              <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                <line x2={-5} stroke="var(--border)" />
                <text
                  x={-10}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-xs"
                >
                  {tick}
                </text>
              </g>
            ))}
            {yAxisLabel && (
              <text
                transform={`translate(-45, ${innerHeight / 2}) rotate(-90)`}
                textAnchor="middle"
                className="fill-foreground text-xs font-medium"
              >
                {yAxisLabel}
              </text>
            )}
          </g>
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPoint !== null && plotData[hoveredPoint] && (
        <div className="mt-2 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
            <div className="text-muted-foreground">
              x: {plotData[hoveredPoint].x.toFixed(2)}, y:{" "}
              {plotData[hoveredPoint].y.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <ChartZoomResetButton
        visible={isZoomed}
        onReset={() => setZoomDomain(null)}
      />
    </div>
  )
}
