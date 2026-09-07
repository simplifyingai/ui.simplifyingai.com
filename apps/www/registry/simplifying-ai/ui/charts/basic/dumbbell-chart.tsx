"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { categoryAxisWidth } from "../chart-responsive"

import { ChartLegendLayout, useSeriesHighlight } from "../chart-legend"

export interface DumbbellDataPoint {
  category: string
  start: number
  end: number
}

export interface DumbbellChartProps {
  data: DumbbellDataPoint[]
  className?: string
  /** Show the legend */
  showLegend?: boolean
  /** Which side of the plot to place the legend on */
  legendPosition?: "top" | "bottom" | "left" | "right"
  dotSize?: number
  showGrid?: boolean
  valueFormatter?: (value: number) => string
  startColor?: string
  endColor?: string
  connectorColor?: string
  startLabel?: string
  endLabel?: string
}

export function DumbbellChart({
  data,
  className,
  showLegend = true,
  legendPosition = "right",
  dotSize = 8,
  showGrid = true,
  valueFormatter = (value) => value.toLocaleString(),
  startColor = "var(--chart-3)",
  endColor = "var(--chart-1)",
  connectorColor = "var(--muted)",
  startLabel = "Start",
  endLabel = "End",
}: DumbbellChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  // Legend highlight: clicking "Start" or "End" emphasizes that side of
  // every dumbbell and fades the other (Plotly-style), clicking the same
  // one again restores both; hovering a legend item previews it. There's no
  // categorical/band axis here worth a drag-to-zoom window — the two-series
  // legend is this chart's interactive feature.
  const highlight = useSeriesHighlight()

  const width = 500
  const height = data.length * 45 + 70
  // Categories run down the left edge — size the gutter to them.
  const margin = {
    top: 40,
    right: 40,
    bottom: 35,
    left: categoryAxisWidth(
      data.map((d) => d.category),
      width,
      { min: 90 }
    ),
  }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const categoryScale = React.useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.4)
  }, [data, innerHeight])

  const valueScale = React.useMemo(() => {
    const allValues = data.flatMap((d) => [d.start, d.end])
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const range = maxVal - minVal || 1
    const padding = range * 0.15
    return scaleLinear()
      .domain([Math.max(0, minVal - padding), maxVal + padding])
      .range([0, innerWidth])
      .nice()
  }, [data, innerWidth])

  const ticks = valueScale.ticks(5)

  // Legend — click a side to highlight it (the other fades), click again to
  // restore both; hover previews. Positioned on `legendPosition` via layout.
  const isVerticalLegend =
    legendPosition === "left" || legendPosition === "right"
  const legend = (
    <div
      className={cn(
        "flex gap-6",
        isVerticalLegend
          ? "flex-col items-start"
          : "flex-wrap items-center justify-center",
        legendPosition === "top" && "pb-3",
        legendPosition === "bottom" && "pt-3",
        legendPosition === "left" && "pr-3",
        legendPosition === "right" && "pl-3"
      )}
    >
      <button
        type="button"
        aria-pressed={!highlight.isActive("start")}
        onClick={() => highlight.toggle("start")}
        onMouseEnter={() => highlight.setHovered("start")}
        onMouseLeave={() => highlight.setHovered(null)}
        className={cn(
          "flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80",
          !highlight.isActive("start") && "opacity-40"
        )}
      >
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: startColor }}
        />
        <span className="text-muted-foreground text-sm">{startLabel}</span>
      </button>
      <button
        type="button"
        aria-pressed={!highlight.isActive("end")}
        onClick={() => highlight.toggle("end")}
        onMouseEnter={() => highlight.setHovered("end")}
        onMouseLeave={() => highlight.setHovered(null)}
        className={cn(
          "flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80",
          !highlight.isActive("end") && "opacity-40"
        )}
      >
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: endColor }}
        />
        <span className="text-muted-foreground text-sm">{endLabel}</span>
      </button>
    </div>
  )

  return (
    <div className={cn("relative w-full", className)}>
      {/* Plot + legend layout — legend on `legendPosition` side; click a side
          to highlight it, click again to restore both */}
      <ChartLegendLayout
        position={legendPosition}
        show={showLegend}
        legend={legend}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full overflow-visible"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {showGrid &&
              ticks.map((tick) => (
                <line
                  key={tick}
                  x1={valueScale(tick)}
                  x2={valueScale(tick)}
                  y1={0}
                  y2={innerHeight}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              ))}

            {/* Baseline */}
            <line
              x1={0}
              x2={innerWidth}
              y1={innerHeight}
              y2={innerHeight}
              stroke="#e5e7eb"
              strokeWidth={1}
            />

            {/* Dumbbells */}
            {data.map((d, index) => {
              const isHovered = hoveredIndex === index
              const categoryPos =
                (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2

              const x1 = valueScale(d.start)
              const x2 = valueScale(d.end)
              const y = categoryPos

              return (
                <g
                  key={d.category}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
                    transition: "opacity 150ms",
                  }}
                >
                  {/* Connector line — links the two endpoints; stays drawn but
                    dims while a single side is highlighted via the legend */}
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke={connectorColor}
                    strokeWidth={3}
                    strokeLinecap="round"
                    style={{
                      opacity: highlight.focused === null ? 1 : 0.3,
                      transition: "opacity 150ms",
                    }}
                  />

                  {/* Start dot — faded (never removed) when the other side is
                    highlighted */}
                  <circle
                    cx={x1}
                    cy={y}
                    r={isHovered ? dotSize + 2 : dotSize}
                    fill={startColor}
                    style={{
                      opacity: highlight.isDimmed("start") ? 0.3 : 1,
                      transition: "r 150ms, opacity 150ms",
                    }}
                  />

                  {/* End dot — faded (never removed) when the other side is
                    highlighted */}
                  <circle
                    cx={x2}
                    cy={y}
                    r={isHovered ? dotSize + 2 : dotSize}
                    fill={endColor}
                    style={{
                      opacity: highlight.isDimmed("end") ? 0.3 : 1,
                      transition: "r 150ms, opacity 150ms",
                    }}
                  />
                </g>
              )
            })}

            {/* Category labels */}
            {data.map((d) => {
              const pos =
                (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
              return (
                <text
                  key={`label-${d.category}`}
                  x={-12}
                  y={pos}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={12}
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
                x={valueScale(tick)}
                y={innerHeight + 20}
                textAnchor="middle"
                fontSize={11}
                className="fill-muted-foreground"
              >
                {valueFormatter(tick)}
              </text>
            ))}
          </g>
        </svg>

        {/* Tooltip — shows both sides; the highlighted side stays bright while
          the other dims (nothing is hidden) */}
        {hoveredIndex !== null && (
          <div className="bg-foreground text-background pointer-events-none absolute top-12 left-1/2 z-50 -translate-x-1/2 rounded-md px-3 py-1.5 text-xs font-medium shadow-lg">
            <span className="font-semibold">{data[hoveredIndex].category}</span>
            <span className="mx-2">·</span>
            <span style={{ opacity: highlight.isDimmed("start") ? 0.5 : 1 }}>
              {startLabel}: {valueFormatter(data[hoveredIndex].start)}
            </span>
            <span className="mx-1">→</span>
            <span style={{ opacity: highlight.isDimmed("end") ? 0.5 : 1 }}>
              {endLabel}: {valueFormatter(data[hoveredIndex].end)}
            </span>
            <span className="ml-2 opacity-70">
              ({data[hoveredIndex].end >= data[hoveredIndex].start ? "+" : ""}
              {valueFormatter(
                data[hoveredIndex].end - data[hoveredIndex].start
              )}
              )
            </span>
          </div>
        )}
      </ChartLegendLayout>
    </div>
  )
}
