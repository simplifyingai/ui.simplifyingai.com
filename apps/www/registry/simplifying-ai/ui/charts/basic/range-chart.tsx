"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"
import { area, curveMonotoneX, line } from "d3-shape"

import { cn } from "@/lib/utils"

export interface RangeDataPoint {
  category: string
  low: number
  high: number
  mid?: number
}

export interface RangeChartProps {
  data: RangeDataPoint[]
  className?: string
  variant?: "area" | "bars"
  showMidLine?: boolean
  showGrid?: boolean
  fillColor?: string
  strokeColor?: string
  midLineColor?: string
  lowLabel?: string
  highLabel?: string
  midLabel?: string
  valueFormatter?: (value: number) => string
}

export function RangeChart({
  data,
  className,
  variant = "area",
  showMidLine = true,
  showGrid = true,
  fillColor = "#3b82f6",
  strokeColor = "#1d4ed8",
  midLineColor = "#1e40af",
  lowLabel = "Low",
  highLabel = "High",
  midLabel = "Average",
  valueFormatter = (v) => v.toLocaleString(),
}: RangeChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const width = 500
  const height = 280
  const margin = { top: 20, right: 30, bottom: 40, left: 50 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // X Scale - category based
  const xScale = React.useMemo(() => {
    return scaleBand<string>()
      .domain(data.map((d) => d.category))
      .range([0, innerWidth])
      .padding(variant === "bars" ? 0.3 : 0.1)
  }, [data, innerWidth, variant])

  // Y Scale
  const yScale = React.useMemo(() => {
    const allValues = data.flatMap((d) => [d.low, d.high])
    if (showMidLine) {
      data.forEach((d) => {
        if (d.mid !== undefined) allValues.push(d.mid)
      })
    }
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.15

    return scaleLinear()
      .domain([Math.min(0, min - padding), max + padding])
      .range([innerHeight, 0])
      .nice()
  }, [data, innerHeight, showMidLine])

  const yTicks = yScale.ticks(5)

  // Area generator for the band
  const areaPath = React.useMemo(() => {
    if (variant !== "area") return ""

    const areaGenerator = area<RangeDataPoint>()
      .x((d) => (xScale(d.category) ?? 0) + xScale.bandwidth() / 2)
      .y0((d) => yScale(d.low))
      .y1((d) => yScale(d.high))
      .curve(curveMonotoneX)

    return areaGenerator(data) ?? ""
  }, [data, xScale, yScale, variant])

  // Mid line generator
  const midLinePath = React.useMemo(() => {
    if (!showMidLine || variant !== "area") return ""

    const lineGenerator = line<RangeDataPoint>()
      .x((d) => (xScale(d.category) ?? 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.mid ?? (d.low + d.high) / 2))
      .curve(curveMonotoneX)

    return lineGenerator(data) ?? ""
  }, [data, xScale, yScale, showMidLine, variant])

  // Get tooltip position
  const getTooltipStyle = (index: number): React.CSSProperties => {
    const d = data[index]
    const x = (xScale(d.category) ?? 0) + xScale.bandwidth() / 2
    const y = yScale(d.mid ?? (d.low + d.high) / 2)

    return {
      left: `${((margin.left + x) / width) * 100}%`,
      top: `${((margin.top + y) / height) * 100}%`,
    }
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Legend */}
      <div className="mb-3 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-6 rounded-sm opacity-40"
            style={{ backgroundColor: fillColor }}
          />
          <span className="text-muted-foreground text-sm">
            {lowLabel} - {highLabel}
          </span>
        </div>
        {showMidLine && (
          <div className="flex items-center gap-2">
            <div
              className="h-0.5 w-6"
              style={{ backgroundColor: midLineColor }}
            />
            <span className="text-muted-foreground text-sm">{midLabel}</span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {showGrid &&
            yTicks.map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={innerWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
            ))}

          {/* Baseline */}
          <line
            x1={0}
            x2={innerWidth}
            y1={innerHeight}
            y2={innerHeight}
            stroke="#e5e7eb"
          />

          {/* Area band variant */}
          {variant === "area" && (
            <>
              <path
                d={areaPath}
                fill={fillColor}
                fillOpacity={0.3}
                stroke={strokeColor}
                strokeWidth={1.5}
              />
              {showMidLine && (
                <path
                  d={midLinePath}
                  fill="none"
                  stroke={midLineColor}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              )}
              {/* Hover points */}
              {data.map((d, i) => {
                const x = (xScale(d.category) ?? 0) + xScale.bandwidth() / 2
                const midY = yScale(d.mid ?? (d.low + d.high) / 2)
                const isHovered = hoveredIndex === i

                return (
                  <g
                    key={d.category}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Invisible hit area */}
                    <rect
                      x={x - xScale.bandwidth() / 2}
                      y={yScale(d.high)}
                      width={xScale.bandwidth()}
                      height={yScale(d.low) - yScale(d.high)}
                      fill="transparent"
                    />
                    {/* Mid point dot */}
                    {showMidLine && (
                      <circle
                        cx={x}
                        cy={midY}
                        r={isHovered ? 5 : 4}
                        fill={midLineColor}
                        stroke="white"
                        strokeWidth={2}
                        style={{ transition: "r 150ms" }}
                      />
                    )}
                    {/* High/Low markers on hover */}
                    {isHovered && (
                      <>
                        <circle
                          cx={x}
                          cy={yScale(d.high)}
                          r={3}
                          fill={strokeColor}
                        />
                        <circle
                          cx={x}
                          cy={yScale(d.low)}
                          r={3}
                          fill={strokeColor}
                        />
                      </>
                    )}
                  </g>
                )
              })}
            </>
          )}

          {/* Bars variant */}
          {variant === "bars" &&
            data.map((d, i) => {
              const x = xScale(d.category) ?? 0
              const barWidth = xScale.bandwidth()
              const isHovered = hoveredIndex === i
              const mid = d.mid ?? (d.low + d.high) / 2

              return (
                <g
                  key={d.category}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
                    transition: "opacity 150ms",
                  }}
                >
                  <rect
                    x={x}
                    y={yScale(d.high)}
                    width={barWidth}
                    height={yScale(d.low) - yScale(d.high)}
                    fill={fillColor}
                    fillOpacity={isHovered ? 0.5 : 0.35}
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    rx={2}
                    style={{ transition: "fill-opacity 150ms" }}
                  />
                  {/* Mid line marker */}
                  {showMidLine && (
                    <line
                      x1={x}
                      x2={x + barWidth}
                      y1={yScale(mid)}
                      y2={yScale(mid)}
                      stroke={midLineColor}
                      strokeWidth={2}
                    />
                  )}
                </g>
              )
            })}

          {/* X-axis labels */}
          {data.map((d) => {
            const x = (xScale(d.category) ?? 0) + xScale.bandwidth() / 2
            return (
              <text
                key={`label-${d.category}`}
                x={x}
                y={innerHeight + 20}
                textAnchor="middle"
                fontSize={11}
                className="fill-foreground"
              >
                {d.category}
              </text>
            )
          })}

          {/* Y-axis labels */}
          {yTicks.map((tick) => (
            <text
              key={`tick-${tick}`}
              x={-10}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              className="fill-muted-foreground"
            >
              {valueFormatter(tick)}
            </text>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full"
          style={getTooltipStyle(hoveredIndex)}
        >
          <div className="bg-foreground text-background mb-2 rounded-md px-3 py-2 text-xs font-medium shadow-lg">
            <div className="mb-1 font-semibold">
              {data[hoveredIndex].category}
            </div>
            <div className="space-y-0.5 opacity-90">
              <div>
                {highLabel}: {valueFormatter(data[hoveredIndex].high)}
              </div>
              {data[hoveredIndex].mid !== undefined && (
                <div>
                  {midLabel}: {valueFormatter(data[hoveredIndex].mid!)}
                </div>
              )}
              <div>
                {lowLabel}: {valueFormatter(data[hoveredIndex].low)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
