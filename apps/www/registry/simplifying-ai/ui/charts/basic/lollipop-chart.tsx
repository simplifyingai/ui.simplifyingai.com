"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { categoryAxisWidth } from "../chart-responsive"

export interface LollipopDataPoint {
  category: string
  value: number
  color?: string
  group?: string
}

export interface LollipopChartProps {
  data: LollipopDataPoint[]
  className?: string
  orientation?: "horizontal" | "vertical"
  dotSize?: number
  showGrid?: boolean
  showLegend?: boolean
  valueFormatter?: (value: number) => string
  color?: string
  stemColor?: string
  yAxisLabel?: string
}

export function LollipopChart({
  data,
  className,
  orientation = "vertical",
  dotSize = 10,
  showGrid = true,
  showLegend = true,
  valueFormatter = (value) => value.toFixed(1),
  color = "var(--chart-1)",
  stemColor = "var(--muted)",
  yAxisLabel,
}: LollipopChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  // Legend click-to-isolate: clicking a group in the legend shows only
  // that group's lollipops (fully hidden, not just dimmed, for the
  // others), clicking the same group again restores all. Points without
  // a `group` are unaffected by isolation. Drag-to-zoom is intentionally
  // skipped for this chart — see note near the categoryScale below.
  const [activeGroup, setActiveGroup] = React.useState<string | null>(null)
  const isGroupVisible = React.useCallback(
    (group?: string) => !group || activeGroup === null || activeGroup === group,
    [activeGroup]
  )

  const isHorizontal = orientation === "horizontal"

  // Calculate dimensions - ensure enough space for each item
  const minItemSpace = dotSize * 3 // Minimum space per item (3x dot diameter)
  const calculatedWidth = Math.max(600, data.length * minItemSpace + 100)

  const width = isHorizontal ? 500 : calculatedWidth
  const height = isHorizontal ? Math.max(400, data.length * 30) : 320

  // Horizontal lollipops hang the CATEGORY names off the left edge, where a
  // constant gutter clips anything longer than it. Size it to the labels.
  const margin = isHorizontal
    ? {
        top: 20,
        right: 30,
        bottom: 30,
        left: categoryAxisWidth(
          data.map((d) => d.category),
          width,
          { min: 130 }
        ),
      }
    : { top: 20, right: 30, bottom: 40, left: 45 }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Get unique groups for legend
  const groups = React.useMemo(() => {
    const groupMap = new Map<string, string>()
    data.forEach((d) => {
      if (d.group && d.color && !groupMap.has(d.group)) {
        groupMap.set(d.group, d.color)
      }
    })
    return Array.from(groupMap.entries())
  }, [data])

  // Note on drag-to-zoom: the band/categorical scale lives on the Y-axis
  // in "horizontal" orientation and on the X-axis in "vertical" (default)
  // orientation — but the shared `useChartZoom` primitive only tracks
  // horizontal (X) drags (it's hard-wired to `marginLeft`/`innerWidth`
  // pixel math, with no vertical counterpart), and this component can't
  // modify that primitive. Wiring zoom for one orientation only would
  // make the same chart draggable in one mode and inert in the other —
  // an inconsistent, surprising fit. On top of that, both the width
  // (vertical) and height (horizontal) here already auto-grow with
  // `data.length` and scroll via `overflow-x-auto` rather than cramming
  // items into a fixed plot area, so zoom wouldn't relieve any crowding
  // the way it does for fixed-size charts like the candlestick. Zoom is
  // intentionally skipped; legend click-to-isolate (below) is applied
  // instead since this chart already renders a real per-group legend.
  const categoryScale = React.useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => d.category))
      .range(isHorizontal ? [0, innerHeight] : [0, innerWidth])
      .padding(0.4)
  }, [data, innerWidth, innerHeight, isHorizontal])

  const valueScale = React.useMemo(() => {
    const values = data.map((d) => d.value)
    const minVal = Math.min(...values, 0)
    const maxVal = Math.max(...values, 0)
    const range = maxVal - minVal || 1
    const padding = range * 0.2

    return scaleLinear()
      .domain([minVal - padding, maxVal + padding])
      .range(isHorizontal ? [0, innerWidth] : [innerHeight, 0])
      .nice()
  }, [data, innerWidth, innerHeight, isHorizontal])

  const ticks = valueScale.ticks(5)
  const zeroPos = valueScale(0)

  return (
    <div className={cn("relative w-full", className)}>
      {/* Legend — click a group to isolate it, click again to restore all */}
      {showLegend && groups.length > 0 && (
        <div className="mb-4 flex items-center justify-center gap-6">
          <span className="text-muted-foreground text-sm">cyl</span>
          {groups.map(([group, groupColor]) => (
            <button
              key={group}
              type="button"
              aria-pressed={!isGroupVisible(group)}
              onClick={() =>
                setActiveGroup((prev) => (prev === group ? null : group))
              }
              className={cn(
                "flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80",
                !isGroupVisible(group) && "opacity-40"
              )}
            >
              <div
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: groupColor }}
              />
              <span className="text-foreground text-sm">
                {group.replace(" cyl", "")}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <svg width={width} height={height} className="overflow-visible">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {showGrid &&
              ticks.map((tick) => (
                <line
                  key={tick}
                  x1={isHorizontal ? valueScale(tick) : 0}
                  x2={isHorizontal ? valueScale(tick) : innerWidth}
                  y1={isHorizontal ? 0 : valueScale(tick)}
                  y2={isHorizontal ? innerHeight : valueScale(tick)}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              ))}

            {/* Lollipops — fully skipped (not just dimmed) when a legend
                group is isolated and this point belongs to another group */}
            {data.map((d, index) => {
              if (!isGroupVisible(d.group)) return null
              const isHovered = hoveredIndex === index
              const dotColor = d.color ?? color
              const categoryPos =
                (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2

              const x1 = isHorizontal ? zeroPos : categoryPos
              const y1 = isHorizontal ? categoryPos : zeroPos
              const x2 = isHorizontal ? valueScale(d.value) : categoryPos
              const y2 = isHorizontal ? categoryPos : valueScale(d.value)

              return (
                <g
                  key={`${d.category}-${index}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                    transition: "opacity 150ms",
                  }}
                >
                  {/* Stem */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={stemColor}
                    strokeWidth={2}
                  />

                  {/* Dot */}
                  <circle
                    cx={x2}
                    cy={y2}
                    r={isHovered ? dotSize + 2 : dotSize}
                    fill={dotColor}
                    style={{ transition: "r 150ms" }}
                  />
                </g>
              )
            })}

            {/* Category labels */}
            {data.map((d, index) => {
              if (!isGroupVisible(d.group)) return null
              const pos =
                (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2

              if (isHorizontal) {
                return (
                  <text
                    key={`label-${index}`}
                    x={-10}
                    y={pos}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    className="fill-foreground"
                  >
                    {d.category}
                  </text>
                )
              }

              return (
                <text
                  key={`label-${index}`}
                  x={pos}
                  y={innerHeight + 18}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-foreground"
                >
                  {d.category}
                </text>
              )
            })}

            {/* Value axis labels */}
            {ticks.map((tick) => (
              <text
                key={`tick-${tick}`}
                x={isHorizontal ? valueScale(tick) : -10}
                y={isHorizontal ? innerHeight + 16 : valueScale(tick)}
                textAnchor={isHorizontal ? "middle" : "end"}
                dominantBaseline={isHorizontal ? "auto" : "middle"}
                fontSize={12}
                className="fill-muted-foreground"
              >
                {tick}
              </text>
            ))}

            {/* Y-axis label */}
            {yAxisLabel && !isHorizontal && (
              <text
                x={0}
                y={0}
                textAnchor="middle"
                fontSize={12}
                className="fill-muted-foreground"
                transform={`translate(${-margin.left + 14}, ${innerHeight / 2}) rotate(-90)`}
              >
                {yAxisLabel}
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="bg-foreground text-background pointer-events-none fixed z-[100] rounded-md px-2.5 py-1.5 text-xs font-medium shadow-lg"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <span className="font-semibold">{data[hoveredIndex].category}</span>
          <span className="ml-1.5">
            {valueFormatter(data[hoveredIndex].value)}
          </span>
        </div>
      )}
    </div>
  )
}
