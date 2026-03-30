"use client"

import * as React from "react"
import { contourDensity } from "d3-contour"
import { geoPath } from "d3-geo"
import { scaleLinear, scaleSequential } from "d3-scale"
import { interpolateBlues } from "d3-scale-chromatic"

import { cn } from "@/lib/utils"

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
  const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null)

  const width = 500
  const height = 400
  const margin = { top: 20, right: 20, bottom: 50, left: 60 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // X Scale
  const xExtent = React.useMemo(() => {
    const xValues = data.map((d) => d.x)
    const min = Math.min(...xValues)
    const max = Math.max(...xValues)
    const padding = (max - min) * 0.1
    return [min - padding, max + padding]
  }, [data])

  const xScale = scaleLinear().domain(xExtent).range([0, innerWidth]).nice()

  // Y Scale
  const yExtent = React.useMemo(() => {
    const yValues = data.map((d) => d.y)
    const min = Math.min(...yValues)
    const max = Math.max(...yValues)
    const padding = (max - min) * 0.1
    return [min - padding, max + padding]
  }, [data])

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

    return densityGenerator(data)
  }, [
    data,
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

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
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
              stroke="hsl(var(--border))"
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
              stroke="hsl(var(--border))"
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
            data.map((d, i) => {
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

          {/* X Axis */}
          <g transform={`translate(0, ${innerHeight})`}>
            <line x1={0} x2={innerWidth} stroke="hsl(var(--border))" />
            {xTicks.map((tick) => (
              <g key={tick} transform={`translate(${xScale(tick)}, 0)`}>
                <line y2={5} stroke="hsl(var(--border))" />
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
            <line y1={0} y2={innerHeight} stroke="hsl(var(--border))" />
            {yTicks.map((tick) => (
              <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                <line x2={-5} stroke="hsl(var(--border))" />
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
      {hoveredPoint !== null && (
        <div className="mt-2 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
            <div className="text-muted-foreground">
              x: {data[hoveredPoint].x.toFixed(2)}, y:{" "}
              {data[hoveredPoint].y.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
