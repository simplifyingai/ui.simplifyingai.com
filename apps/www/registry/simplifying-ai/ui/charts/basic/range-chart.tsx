"use client"

import * as React from "react"
import { scaleLinear, scaleTime, scaleBand } from "d3-scale"
import { area, line, curveMonotoneX } from "d3-shape"

import { cn } from "@/lib/utils"

export interface RangeDataPoint {
  x: number | Date | string
  low: number
  high: number
  mid?: number
  label?: string
}

export interface RangeChartProps {
  data: RangeDataPoint[]
  className?: string
  variant?: "area" | "bars" | "errorBars"
  xAxisType?: "linear" | "time" | "category"
  showMidLine?: boolean
  showPoints?: boolean
  fillColor?: string
  strokeColor?: string
  midLineColor?: string
  xAxisLabel?: string
  yAxisLabel?: string
  valueFormatter?: (value: number) => string
}

export function RangeChart({
  data,
  className,
  variant = "area",
  xAxisType = "category",
  showMidLine = true,
  showPoints = false,
  fillColor = "#3b82f6",
  strokeColor = "#1e40af",
  midLineColor = "#1e40af",
  xAxisLabel,
  yAxisLabel,
  valueFormatter = (v) => v.toLocaleString(),
}: RangeChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const width = 500
  const height = 350
  const margin = { top: 20, right: 30, bottom: 50, left: 60 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // X Scale
  const xScale = React.useMemo(() => {
    if (xAxisType === "time") {
      const dates = data.map((d) => d.x as Date)
      return scaleTime()
        .domain([Math.min(...dates.map(d => d.getTime())), Math.max(...dates.map(d => d.getTime()))])
        .range([0, innerWidth])
    } else if (xAxisType === "linear") {
      const values = data.map((d) => d.x as number)
      return scaleLinear()
        .domain([Math.min(...values), Math.max(...values)])
        .range([0, innerWidth])
        .nice()
    } else {
      return scaleBand<string>()
        .domain(data.map((d) => String(d.x)))
        .range([0, innerWidth])
        .padding(0.2)
    }
  }, [data, xAxisType, innerWidth])

  // Y Scale
  const yScale = React.useMemo(() => {
    const allValues = data.flatMap((d) => [d.low, d.high, d.mid ?? 0])
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.1

    return scaleLinear()
      .domain([min - padding, max + padding])
      .range([innerHeight, 0])
      .nice()
  }, [data, innerHeight])

  // Get X position
  const getX = (d: RangeDataPoint, i: number) => {
    if (xAxisType === "category") {
      const scale = xScale as ReturnType<typeof scaleBand<string>>
      return (scale(String(d.x)) ?? 0) + scale.bandwidth() / 2
    }
    return (xScale as ReturnType<typeof scaleLinear>)(d.x as number)
  }

  // Area generator
  const areaGenerator = area<RangeDataPoint>()
    .x((d, i) => getX(d, i))
    .y0((d) => yScale(d.low))
    .y1((d) => yScale(d.high))
    .curve(curveMonotoneX)

  // Mid line generator
  const midLineGenerator = line<RangeDataPoint>()
    .x((d, i) => getX(d, i))
    .y((d) => yScale(d.mid ?? (d.low + d.high) / 2))
    .curve(curveMonotoneX)

  // Axis ticks
  const xTicks = xAxisType === "category"
    ? data.map((d) => String(d.x))
    : (xScale as ReturnType<typeof scaleLinear>).ticks(6)
  const yTicks = yScale.ticks(6)

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {yTicks.map((tick) => (
            <line
              key={`grid-${tick}`}
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}

          {/* Range visualization */}
          {variant === "area" && (
            <>
              <path
                d={areaGenerator(data) ?? ""}
                fill={fillColor}
                fillOpacity={0.3}
                stroke={strokeColor}
                strokeWidth={1}
              />
              {showMidLine && (
                <path
                  d={midLineGenerator(data) ?? ""}
                  fill="none"
                  stroke={midLineColor}
                  strokeWidth={2}
                />
              )}
            </>
          )}

          {variant === "bars" && data.map((d, i) => {
            const x = getX(d, i)
            const barWidth = xAxisType === "category"
              ? (xScale as ReturnType<typeof scaleBand<string>>).bandwidth()
              : 20

            return (
              <g key={i}>
                <rect
                  x={x - barWidth / 2}
                  y={yScale(d.high)}
                  width={barWidth}
                  height={yScale(d.low) - yScale(d.high)}
                  fill={fillColor}
                  fillOpacity={hoveredIndex === i ? 0.6 : 0.4}
                  stroke={strokeColor}
                  strokeWidth={1}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {showMidLine && d.mid !== undefined && (
                  <line
                    x1={x - barWidth / 2}
                    x2={x + barWidth / 2}
                    y1={yScale(d.mid)}
                    y2={yScale(d.mid)}
                    stroke={midLineColor}
                    strokeWidth={2}
                  />
                )}
              </g>
            )
          })}

          {variant === "errorBars" && data.map((d, i) => {
            const x = getX(d, i)
            const mid = d.mid ?? (d.low + d.high) / 2
            const capWidth = 8

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Vertical line */}
                <line
                  x1={x}
                  x2={x}
                  y1={yScale(d.low)}
                  y2={yScale(d.high)}
                  stroke={strokeColor}
                  strokeWidth={hoveredIndex === i ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />
                {/* Top cap */}
                <line
                  x1={x - capWidth}
                  x2={x + capWidth}
                  y1={yScale(d.high)}
                  y2={yScale(d.high)}
                  stroke={strokeColor}
                  strokeWidth={hoveredIndex === i ? 2.5 : 1.5}
                />
                {/* Bottom cap */}
                <line
                  x1={x - capWidth}
                  x2={x + capWidth}
                  y1={yScale(d.low)}
                  y2={yScale(d.low)}
                  stroke={strokeColor}
                  strokeWidth={hoveredIndex === i ? 2.5 : 1.5}
                />
                {/* Mid point */}
                <circle
                  cx={x}
                  cy={yScale(mid)}
                  r={hoveredIndex === i ? 5 : 4}
                  fill={midLineColor}
                  stroke="#fff"
                  strokeWidth={1.5}
                  className="transition-all duration-150"
                />
              </g>
            )
          })}

          {/* Points for area variant */}
          {variant === "area" && showPoints && data.map((d, i) => {
            const x = getX(d, i)
            const mid = d.mid ?? (d.low + d.high) / 2

            return (
              <circle
                key={i}
                cx={x}
                cy={yScale(mid)}
                r={hoveredIndex === i ? 5 : 4}
                fill={midLineColor}
                stroke="#fff"
                strokeWidth={1.5}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}

          {/* X Axis */}
          <g transform={`translate(0, ${innerHeight})`}>
            <line x1={0} x2={innerWidth} stroke="hsl(var(--border))" />
            {xTicks.map((tick, i) => {
              const x = xAxisType === "category"
                ? ((xScale as ReturnType<typeof scaleBand<string>>)(String(tick)) ?? 0) +
                  (xScale as ReturnType<typeof scaleBand<string>>).bandwidth() / 2
                : (xScale as ReturnType<typeof scaleLinear>)(tick as number)

              return (
                <g key={i} transform={`translate(${x}, 0)`}>
                  <line y2={5} stroke="hsl(var(--border))" />
                  <text
                    y={18}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {xAxisType === "time"
                      ? new Date(tick as number).toLocaleDateString()
                      : String(tick)}
                  </text>
                </g>
              )
            })}
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
                  className="fill-muted-foreground text-[10px]"
                >
                  {valueFormatter(tick)}
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
      {hoveredIndex !== null && (
        <div className="mt-2 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
            <div className="font-medium">
              {data[hoveredIndex].label ?? String(data[hoveredIndex].x)}
            </div>
            <div className="text-muted-foreground text-xs">
              <div>High: {valueFormatter(data[hoveredIndex].high)}</div>
              {data[hoveredIndex].mid !== undefined && (
                <div>Mid: {valueFormatter(data[hoveredIndex].mid!)}</div>
              )}
              <div>Low: {valueFormatter(data[hoveredIndex].low)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
