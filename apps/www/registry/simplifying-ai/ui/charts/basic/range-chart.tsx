"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"
import { area, curveLinear, curveMonotoneX, line } from "d3-shape"

import { cn } from "@/lib/utils"

export interface RangeDataPoint {
  category: string
  low: number
  high: number
  mid?: number
  color?: string
}

export interface RangeChartProps {
  data: RangeDataPoint[]
  className?: string
  variant?: "area" | "bars" | "errorBars" | "floating"
  orientation?: "vertical" | "horizontal"
  showMidLine?: boolean
  showGrid?: boolean
  showValues?: boolean
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
  orientation = "vertical",
  showMidLine = true,
  showGrid = true,
  showValues = false,
  fillColor = "#3b82f6",
  strokeColor = "#1d4ed8",
  midLineColor = "#1e40af",
  lowLabel = "Low",
  highLabel = "High",
  midLabel = "Average",
  valueFormatter = (v) => v.toLocaleString(),
}: RangeChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const isHorizontal = orientation === "horizontal"

  const width = isHorizontal ? 500 : 500
  const height = isHorizontal ? Math.max(280, data.length * 45 + 60) : 300
  const margin = isHorizontal
    ? { top: 30, right: 40, bottom: 30, left: 80 }
    : { top: 30, right: 30, bottom: 45, left: 55 }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Category Scale
  const categoryScale = React.useMemo(() => {
    const padding =
      variant === "area" ? 0.1 : variant === "errorBars" ? 0.5 : 0.25
    return scaleBand<string>()
      .domain(data.map((d) => d.category))
      .range(isHorizontal ? [0, innerHeight] : [0, innerWidth])
      .padding(padding)
  }, [data, innerWidth, innerHeight, variant, isHorizontal])

  // Value Scale
  const valueScale = React.useMemo(() => {
    const allValues = data.flatMap((d) => [d.low, d.high])
    if (showMidLine) {
      data.forEach((d) => {
        if (d.mid !== undefined) allValues.push(d.mid)
      })
    }
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.15 || 10

    return scaleLinear()
      .domain([Math.min(0, min - padding), max + padding])
      .range(isHorizontal ? [0, innerWidth] : [innerHeight, 0])
      .nice()
  }, [data, innerWidth, innerHeight, showMidLine, isHorizontal])

  const valueTicks = valueScale.ticks(5)

  // Area path generator
  const areaPath = React.useMemo(() => {
    if (variant !== "area") return ""

    const areaGenerator = area<RangeDataPoint>()
      .x(
        (d) => (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
      )
      .y0((d) => valueScale(d.low))
      .y1((d) => valueScale(d.high))
      .curve(curveMonotoneX)

    return areaGenerator(data) ?? ""
  }, [data, categoryScale, valueScale, variant])

  // Mid line path generator
  const midLinePath = React.useMemo(() => {
    if (!showMidLine || variant !== "area") return ""

    const lineGenerator = line<RangeDataPoint>()
      .x(
        (d) => (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
      )
      .y((d) => valueScale(d.mid ?? (d.low + d.high) / 2))
      .curve(curveMonotoneX)

    return lineGenerator(data) ?? ""
  }, [data, categoryScale, valueScale, showMidLine, variant])

  // Get position helpers
  const getX = (
    d: RangeDataPoint,
    position: "low" | "high" | "mid" | "center"
  ) => {
    if (isHorizontal) {
      if (position === "low") return valueScale(d.low)
      if (position === "high") return valueScale(d.high)
      if (position === "mid") return valueScale(d.mid ?? (d.low + d.high) / 2)
      return (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
    }
    return (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
  }

  const getY = (
    d: RangeDataPoint,
    position: "low" | "high" | "mid" | "center"
  ) => {
    if (isHorizontal) {
      return (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
    }
    if (position === "low") return valueScale(d.low)
    if (position === "high") return valueScale(d.high)
    if (position === "mid") return valueScale(d.mid ?? (d.low + d.high) / 2)
    return (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
  }

  // Get range display
  const getRangeDisplay = (d: RangeDataPoint) => {
    const range = d.high - d.low
    return `±${valueFormatter(range / 2)}`
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
            valueTicks.map((tick) => (
              <line
                key={tick}
                x1={isHorizontal ? valueScale(tick) : 0}
                x2={isHorizontal ? valueScale(tick) : innerWidth}
                y1={isHorizontal ? 0 : valueScale(tick)}
                y2={isHorizontal ? innerHeight : valueScale(tick)}
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
            ))}

          {/* Baseline */}
          <line
            x1={0}
            x2={isHorizontal ? 0 : innerWidth}
            y1={isHorizontal ? 0 : innerHeight}
            y2={isHorizontal ? innerHeight : innerHeight}
            stroke="#e5e7eb"
          />

          {/* Area variant */}
          {variant === "area" && !isHorizontal && (
            <>
              <path
                d={areaPath}
                fill={fillColor}
                fillOpacity={0.25}
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
                const x = getX(d, "center")
                const midY = getY(d, "mid")
                const isHovered = hoveredIndex === i

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
                    {/* Invisible hit area */}
                    <rect
                      x={x - categoryScale.bandwidth() / 2}
                      y={getY(d, "high")}
                      width={categoryScale.bandwidth()}
                      height={getY(d, "low") - getY(d, "high")}
                      fill="transparent"
                    />
                    {/* Mid point dot */}
                    {showMidLine && (
                      <circle
                        cx={x}
                        cy={midY}
                        r={isHovered ? 6 : 4}
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
                          cy={getY(d, "high")}
                          r={3}
                          fill={strokeColor}
                        />
                        <circle
                          cx={x}
                          cy={getY(d, "low")}
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
              const isHovered = hoveredIndex === i
              const barColor = d.color ?? fillColor
              const mid = d.mid ?? (d.low + d.high) / 2

              if (isHorizontal) {
                const y = categoryScale(d.category) ?? 0
                const barHeight = categoryScale.bandwidth()
                const x1 = valueScale(d.low)
                const x2 = valueScale(d.high)

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
                      x={x1}
                      y={y}
                      width={x2 - x1}
                      height={barHeight}
                      fill={barColor}
                      fillOpacity={isHovered ? 0.5 : 0.35}
                      stroke={strokeColor}
                      strokeWidth={1.5}
                      rx={3}
                      style={{ transition: "fill-opacity 150ms" }}
                    />
                    {showMidLine && (
                      <line
                        x1={valueScale(mid)}
                        x2={valueScale(mid)}
                        y1={y}
                        y2={y + barHeight}
                        stroke={midLineColor}
                        strokeWidth={2}
                      />
                    )}
                  </g>
                )
              }

              const x = categoryScale(d.category) ?? 0
              const barWidth = categoryScale.bandwidth()

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
                    y={valueScale(d.high)}
                    width={barWidth}
                    height={valueScale(d.low) - valueScale(d.high)}
                    fill={barColor}
                    fillOpacity={isHovered ? 0.5 : 0.35}
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    rx={3}
                    style={{ transition: "fill-opacity 150ms" }}
                  />
                  {showMidLine && (
                    <line
                      x1={x}
                      x2={x + barWidth}
                      y1={valueScale(mid)}
                      y2={valueScale(mid)}
                      stroke={midLineColor}
                      strokeWidth={2}
                    />
                  )}
                </g>
              )
            })}

          {/* Error bars variant */}
          {variant === "errorBars" &&
            data.map((d, i) => {
              const isHovered = hoveredIndex === i
              const barColor = d.color ?? fillColor
              const mid = d.mid ?? (d.low + d.high) / 2
              const capSize = isHorizontal ? 6 : categoryScale.bandwidth() * 0.4

              if (isHorizontal) {
                const y =
                  (categoryScale(d.category) ?? 0) +
                  categoryScale.bandwidth() / 2
                const x1 = valueScale(d.low)
                const x2 = valueScale(d.high)
                const xMid = valueScale(mid)

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
                    {/* Main line */}
                    <line
                      x1={x1}
                      x2={x2}
                      y1={y}
                      y2={y}
                      stroke={barColor}
                      strokeWidth={isHovered ? 3 : 2}
                      style={{ transition: "stroke-width 150ms" }}
                    />
                    {/* Low cap */}
                    <line
                      x1={x1}
                      x2={x1}
                      y1={y - capSize}
                      y2={y + capSize}
                      stroke={barColor}
                      strokeWidth={2}
                    />
                    {/* High cap */}
                    <line
                      x1={x2}
                      x2={x2}
                      y1={y - capSize}
                      y2={y + capSize}
                      stroke={barColor}
                      strokeWidth={2}
                    />
                    {/* Mid point */}
                    {showMidLine && (
                      <circle
                        cx={xMid}
                        cy={y}
                        r={isHovered ? 6 : 5}
                        fill={midLineColor}
                        stroke="white"
                        strokeWidth={2}
                        style={{ transition: "r 150ms" }}
                      />
                    )}
                  </g>
                )
              }

              const x =
                (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
              const y1 = valueScale(d.high)
              const y2 = valueScale(d.low)
              const yMid = valueScale(mid)

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
                  {/* Main line */}
                  <line
                    x1={x}
                    x2={x}
                    y1={y1}
                    y2={y2}
                    stroke={barColor}
                    strokeWidth={isHovered ? 3 : 2}
                    style={{ transition: "stroke-width 150ms" }}
                  />
                  {/* High cap */}
                  <line
                    x1={x - capSize}
                    x2={x + capSize}
                    y1={y1}
                    y2={y1}
                    stroke={barColor}
                    strokeWidth={2}
                  />
                  {/* Low cap */}
                  <line
                    x1={x - capSize}
                    x2={x + capSize}
                    y1={y2}
                    y2={y2}
                    stroke={barColor}
                    strokeWidth={2}
                  />
                  {/* Mid point */}
                  {showMidLine && (
                    <circle
                      cx={x}
                      cy={yMid}
                      r={isHovered ? 6 : 5}
                      fill={midLineColor}
                      stroke="white"
                      strokeWidth={2}
                      style={{ transition: "r 150ms" }}
                    />
                  )}
                </g>
              )
            })}

          {/* Floating bars variant */}
          {variant === "floating" &&
            data.map((d, i) => {
              const isHovered = hoveredIndex === i
              const barColor = d.color ?? fillColor
              const mid = d.mid ?? (d.low + d.high) / 2

              if (isHorizontal) {
                const y = categoryScale(d.category) ?? 0
                const barHeight = categoryScale.bandwidth()
                const x1 = valueScale(d.low)
                const x2 = valueScale(d.high)

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
                      x={x1}
                      y={y}
                      width={x2 - x1}
                      height={barHeight}
                      fill={barColor}
                      fillOpacity={isHovered ? 0.8 : 0.6}
                      rx={4}
                      style={{ transition: "fill-opacity 150ms" }}
                    />
                    {showMidLine && (
                      <circle
                        cx={valueScale(mid)}
                        cy={y + barHeight / 2}
                        r={isHovered ? 5 : 4}
                        fill="white"
                        stroke={midLineColor}
                        strokeWidth={2}
                        style={{ transition: "r 150ms" }}
                      />
                    )}
                  </g>
                )
              }

              const x = categoryScale(d.category) ?? 0
              const barWidth = categoryScale.bandwidth()

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
                    y={valueScale(d.high)}
                    width={barWidth}
                    height={valueScale(d.low) - valueScale(d.high)}
                    fill={barColor}
                    fillOpacity={isHovered ? 0.8 : 0.6}
                    rx={4}
                    style={{ transition: "fill-opacity 150ms" }}
                  />
                  {showMidLine && (
                    <circle
                      cx={x + barWidth / 2}
                      cy={valueScale(mid)}
                      r={isHovered ? 5 : 4}
                      fill="white"
                      stroke={midLineColor}
                      strokeWidth={2}
                      style={{ transition: "r 150ms" }}
                    />
                  )}
                </g>
              )
            })}

          {/* Category labels */}
          {data.map((d) => {
            if (isHorizontal) {
              const y =
                (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
              return (
                <text
                  key={`label-${d.category}`}
                  x={-12}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  className="fill-foreground"
                >
                  {d.category}
                </text>
              )
            }

            const x =
              (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
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

          {/* Value axis labels */}
          {valueTicks.map((tick) => (
            <text
              key={`tick-${tick}`}
              x={isHorizontal ? valueScale(tick) : -10}
              y={isHorizontal ? innerHeight + 18 : valueScale(tick)}
              textAnchor={isHorizontal ? "middle" : "end"}
              dominantBaseline={isHorizontal ? "auto" : "middle"}
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
        <div className="bg-foreground text-background pointer-events-none absolute top-12 left-1/2 z-50 -translate-x-1/2 rounded-md px-3 py-2 text-xs font-medium shadow-lg">
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
          <div className="mt-1.5 border-t border-white/20 pt-1.5 text-center opacity-70">
            Range: {getRangeDisplay(data[hoveredIndex])}
          </div>
        </div>
      )}
    </div>
  )
}
