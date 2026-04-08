"use client"

import * as React from "react"
import { scaleLinear, scalePoint } from "d3-scale"
import { curveLinear, curveMonotoneX, line } from "d3-shape"

import { cn } from "@/lib/utils"

export interface SlopeDataPoint {
  category: string
  start: number
  end: number
  color?: string
}

export interface MultiPeriodSlopeDataPoint {
  category: string
  values: number[]
  color?: string
}

export interface SlopeChartProps {
  data: SlopeDataPoint[] | MultiPeriodSlopeDataPoint[]
  className?: string
  variant?: "lines" | "bumps" | "parallel"
  labels?: string[]
  showGrid?: boolean
  showValues?: boolean
  showRankChange?: boolean
  increaseColor?: string
  decreaseColor?: string
  neutralColor?: string
  valueFormatter?: (value: number) => string
}

// Type guard for multi-period data
function isMultiPeriod(
  data: SlopeDataPoint[] | MultiPeriodSlopeDataPoint[]
): data is MultiPeriodSlopeDataPoint[] {
  return data.length > 0 && "values" in data[0]
}

// Convert simple data to multi-period format
function normalizeData(
  data: SlopeDataPoint[] | MultiPeriodSlopeDataPoint[]
): MultiPeriodSlopeDataPoint[] {
  if (isMultiPeriod(data)) {
    return data
  }
  return data.map((d) => ({
    category: d.category,
    values: [d.start, d.end],
    color: d.color,
  }))
}

export function SlopeChart({
  data,
  className,
  variant = "lines",
  labels,
  showGrid = true,
  showValues = true,
  showRankChange = false,
  increaseColor = "var(--chart-2)",
  decreaseColor = "var(--chart-4)",
  neutralColor = "var(--chart-3)",
  valueFormatter = (value) => value.toLocaleString(),
}: SlopeChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  // Normalize data to multi-period format
  const normalizedData = React.useMemo(() => normalizeData(data), [data])
  const periodCount = normalizedData[0]?.values.length ?? 2

  // Default labels
  const periodLabels =
    labels ??
    (periodCount === 2
      ? ["Start", "End"]
      : Array.from({ length: periodCount }, (_, i) => `Period ${i + 1}`))

  const width = 500
  const height = Math.max(300, normalizedData.length * 40 + 80)
  const margin = { top: 50, right: 90, bottom: 30, left: 90 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // X scale for periods
  const xScale = React.useMemo(() => {
    return scalePoint<number>()
      .domain(Array.from({ length: periodCount }, (_, i) => i))
      .range([0, innerWidth])
  }, [periodCount, innerWidth])

  // Y scale based on all values
  const yScale = React.useMemo(() => {
    const allValues = normalizedData.flatMap((d) => d.values)
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const padding = (maxVal - minVal) * 0.15 || 10
    return scaleLinear()
      .domain([Math.min(0, minVal - padding), maxVal + padding])
      .range([innerHeight, 0])
      .nice()
  }, [normalizedData, innerHeight])

  const yTicks = yScale.ticks(5)

  // Get line color based on direction
  const getLineColor = (d: MultiPeriodSlopeDataPoint) => {
    if (d.color) return d.color
    const first = d.values[0]
    const last = d.values[d.values.length - 1]
    if (last > first) return increaseColor
    if (last < first) return decreaseColor
    return neutralColor
  }

  // Calculate overall change
  const getChange = (d: MultiPeriodSlopeDataPoint) => {
    const first = d.values[0]
    const last = d.values[d.values.length - 1]
    if (first === 0) return last > 0 ? 100 : 0
    return ((last - first) / Math.abs(first)) * 100
  }

  // Get rank at each period (for bumps chart)
  const getRanks = React.useMemo(() => {
    if (variant !== "bumps") return null

    const ranks: Map<string, number[]> = new Map()

    for (let period = 0; period < periodCount; period++) {
      const sorted = [...normalizedData]
        .map((d, i) => ({
          index: i,
          category: d.category,
          value: d.values[period],
        }))
        .sort((a, b) => b.value - a.value)

      sorted.forEach((item, rank) => {
        if (!ranks.has(item.category)) {
          ranks.set(item.category, [])
        }
        ranks.get(item.category)![period] = rank
      })
    }

    return ranks
  }, [normalizedData, periodCount, variant])

  // Y scale for ranks (bumps chart)
  const rankYScale = React.useMemo(() => {
    if (variant !== "bumps") return null
    return scaleLinear()
      .domain([0, normalizedData.length - 1])
      .range([20, innerHeight - 20])
  }, [variant, normalizedData.length, innerHeight])

  // Line generator
  const lineGenerator = React.useMemo(() => {
    return line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(variant === "parallel" ? curveLinear : curveMonotoneX)
  }, [variant])

  // Generate path for each data series
  const getPath = (d: MultiPeriodSlopeDataPoint, index: number) => {
    if (variant === "bumps" && getRanks && rankYScale) {
      const ranks = getRanks.get(d.category)
      if (!ranks) return ""
      const points = ranks.map((rank, period) => ({
        x: xScale(period) ?? 0,
        y: rankYScale(rank),
      }))
      return lineGenerator(points) ?? ""
    }

    const points = d.values.map((value, period) => ({
      x: xScale(period) ?? 0,
      y: yScale(value),
    }))
    return lineGenerator(points) ?? ""
  }

  // Get Y position for endpoint
  const getEndY = (
    d: MultiPeriodSlopeDataPoint,
    index: number,
    periodIndex: number
  ) => {
    if (variant === "bumps" && getRanks && rankYScale) {
      const ranks = getRanks.get(d.category)
      return ranks ? rankYScale(ranks[periodIndex]) : 0
    }
    return yScale(d.values[periodIndex])
  }

  // Get rank change display
  const getRankChangeDisplay = (d: MultiPeriodSlopeDataPoint) => {
    if (!getRanks) return null
    const ranks = getRanks.get(d.category)
    if (!ranks) return null
    const change = ranks[0] - ranks[ranks.length - 1]
    if (change > 0) return `+${change}`
    if (change < 0) return `${change}`
    return "="
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Legend */}
      <div className="mb-3 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="h-0.5 w-5"
            style={{ backgroundColor: increaseColor }}
          />
          <span className="text-muted-foreground text-sm">Increase</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-0.5 w-5"
            style={{ backgroundColor: decreaseColor }}
          />
          <span className="text-muted-foreground text-sm">Decrease</span>
        </div>
        {variant !== "bumps" && (
          <div className="flex items-center gap-2">
            <div
              className="h-0.5 w-5"
              style={{ backgroundColor: neutralColor }}
            />
            <span className="text-muted-foreground text-sm">No change</span>
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
            variant !== "bumps" &&
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

          {/* Period headers */}
          {periodLabels.map((label, i) => (
            <text
              key={`header-${i}`}
              x={xScale(i) ?? 0}
              y={-25}
              textAnchor="middle"
              fontSize={12}
              fontWeight={500}
              className="fill-foreground"
            >
              {label}
            </text>
          ))}

          {/* Vertical axis lines */}
          {Array.from({ length: periodCount }).map((_, i) => (
            <line
              key={`axis-${i}`}
              x1={xScale(i) ?? 0}
              x2={xScale(i) ?? 0}
              y1={-10}
              y2={innerHeight + 10}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}

          {/* Slope lines */}
          {normalizedData.map((d, index) => {
            const isHovered = hoveredIndex === index
            const color = getLineColor(d)
            const path = getPath(d, index)

            return (
              <g
                key={d.category}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  opacity: hoveredIndex !== null && !isHovered ? 0.2 : 1,
                  transition: "opacity 150ms",
                }}
              >
                {/* Line path */}
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "stroke-width 150ms" }}
                />

                {/* Dots at each period */}
                {d.values.map((_, periodIndex) => (
                  <circle
                    key={periodIndex}
                    cx={xScale(periodIndex) ?? 0}
                    cy={getEndY(d, index, periodIndex)}
                    r={isHovered ? 5 : 4}
                    fill={color}
                    stroke="white"
                    strokeWidth={2}
                    style={{ transition: "r 150ms" }}
                  />
                ))}

                {/* Start label - category name */}
                <text
                  x={-12}
                  y={getEndY(d, index, 0)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  className="fill-foreground"
                  style={{ fontWeight: isHovered ? 600 : 400 }}
                >
                  {d.category}
                </text>

                {/* End value */}
                {showValues && (
                  <text
                    x={innerWidth + 12}
                    y={getEndY(d, index, periodCount - 1)}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize={11}
                    className="fill-foreground"
                  >
                    {variant === "bumps" && showRankChange ? (
                      <>{getRankChangeDisplay(d)}</>
                    ) : (
                      <>
                        {valueFormatter(d.values[d.values.length - 1])}
                        <tspan fill={color} fontSize={10} fontWeight={500}>
                          {" "}
                          {getChange(d) >= 0 ? "+" : ""}
                          {getChange(d).toFixed(0)}%
                        </tspan>
                      </>
                    )}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="bg-foreground text-background pointer-events-none absolute top-16 left-1/2 z-50 -translate-x-1/2 rounded-md px-3 py-2 text-xs font-medium shadow-lg">
          <div className="mb-1 font-semibold">
            {normalizedData[hoveredIndex].category}
          </div>
          <div className="flex flex-wrap items-center gap-2 opacity-90">
            {normalizedData[hoveredIndex].values.map((value, i) => (
              <React.Fragment key={i}>
                <span>
                  {periodLabels[i]}: {valueFormatter(value)}
                </span>
                {i < normalizedData[hoveredIndex].values.length - 1 && (
                  <span className="opacity-50">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
          {variant !== "bumps" && (
            <div
              className="mt-1.5 text-center font-semibold"
              style={{ color: getLineColor(normalizedData[hoveredIndex]) }}
            >
              {getChange(normalizedData[hoveredIndex]) >= 0 ? "+" : ""}
              {valueFormatter(
                normalizedData[hoveredIndex].values[
                  normalizedData[hoveredIndex].values.length - 1
                ] - normalizedData[hoveredIndex].values[0]
              )}{" "}
              ({getChange(normalizedData[hoveredIndex]) >= 0 ? "+" : ""}
              {getChange(normalizedData[hoveredIndex]).toFixed(1)}%)
            </div>
          )}
          {variant === "bumps" && getRanks && (
            <div
              className="mt-1.5 text-center font-semibold"
              style={{ color: getLineColor(normalizedData[hoveredIndex]) }}
            >
              Rank change: {getRankChangeDisplay(normalizedData[hoveredIndex])}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
