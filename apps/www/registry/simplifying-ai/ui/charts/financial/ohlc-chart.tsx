"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface OHLCDataPoint {
  date: string | Date
  open: number
  high: number
  low: number
  close: number
}

export interface OHLCChartProps {
  data: OHLCDataPoint[]
  className?: string
  upColor?: string
  downColor?: string
  showGrid?: boolean
  showTooltip?: boolean
  aspectRatio?: number
  valueFormatter?: (value: number) => string
  dateFormatter?: (date: Date) => string
}

export function OHLCChart({
  data,
  className,
  upColor = "#22c55e",
  downColor = "#ef4444",
  showGrid = true,
  showTooltip = true,
  aspectRatio = 2.5,
  valueFormatter = (value) => `$${value.toFixed(0)}`,
  dateFormatter = (date) =>
    date.toLocaleDateString("en-US", { month: "short" }),
}: OHLCChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setDimensions({ width, height: width / aspectRatio })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [aspectRatio])

  const { width, height } = dimensions
  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = Math.max(0, width - margin.left - margin.right)
  const innerHeight = Math.max(0, height - margin.top - margin.bottom)

  const xScale = React.useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => String(d.date)))
      .range([0, innerWidth])
      .padding(0.3)
  }, [data, innerWidth])

  const yScale = React.useMemo(() => {
    const allPrices = data.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    const padding = (maxPrice - minPrice) * 0.1
    return scaleLinear()
      .domain([Math.max(0, minPrice - padding), maxPrice + padding])
      .range([innerHeight, 0])
      .nice()
  }, [data, innerHeight])

  const tickWidth = xScale.bandwidth() * 0.4
  const ticks = yScale.ticks(5)

  const monthLabels = React.useMemo(() => {
    const labels: { date: string; x: number }[] = []
    let lastMonth = -1
    data.forEach((d) => {
      const date = new Date(d.date)
      const month = date.getMonth()
      if (month !== lastMonth) {
        labels.push({
          date: String(d.date),
          x: (xScale(String(d.date)) ?? 0) + xScale.bandwidth() / 2,
        })
        lastMonth = month
      }
    })
    return labels
  }, [data, xScale])

  if (width === 0) {
    return <div ref={containerRef} className={cn("w-full", className)} />
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {showGrid && (
            <>
              {ticks.map((tick) => (
                <line
                  key={`h-${tick}`}
                  x1={0}
                  x2={innerWidth}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              ))}
              {monthLabels.map((label, i) => (
                <line
                  key={`v-${i}`}
                  x1={label.x}
                  x2={label.x}
                  y1={0}
                  y2={innerHeight}
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              ))}
            </>
          )}

          {/* OHLC bars */}
          {data.map((d, index) => {
            const isUp = d.close >= d.open
            const color = isUp ? upColor : downColor
            const x = (xScale(String(d.date)) ?? 0) + xScale.bandwidth() / 2
            const isHovered = hoveredIndex === index

            return (
              <g
                key={index}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hoveredIndex !== null && !isHovered && "opacity-40"
                )}
                onMouseEnter={(e) => {
                  setHoveredIndex(index)
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (rect) {
                    setTooltipPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    })
                  }
                }}
                onMouseMove={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (rect) {
                    setTooltipPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    })
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Vertical line (high to low) */}
                <line
                  x1={x}
                  x2={x}
                  y1={yScale(d.high)}
                  y2={yScale(d.low)}
                  stroke={color}
                  strokeWidth={2}
                />

                {/* Open tick (left) */}
                <line
                  x1={x - tickWidth}
                  x2={x}
                  y1={yScale(d.open)}
                  y2={yScale(d.open)}
                  stroke={color}
                  strokeWidth={2}
                />

                {/* Close tick (right) */}
                <line
                  x1={x}
                  x2={x + tickWidth}
                  y1={yScale(d.close)}
                  y2={yScale(d.close)}
                  stroke={color}
                  strokeWidth={2}
                />
              </g>
            )
          })}

          {/* X Axis */}
          <g transform={`translate(0, ${innerHeight})`}>
            {monthLabels.map((label, i) => {
              const date = new Date(label.date)
              return (
                <text
                  key={i}
                  x={label.x}
                  y={24}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs"
                >
                  {dateFormatter(date)}
                </text>
              )
            })}
          </g>

          {/* Y Axis */}
          <g>
            {ticks.map((tick) => (
              <text
                key={tick}
                x={-12}
                y={yScale(tick)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted-foreground text-xs"
              >
                {valueFormatter(tick)}
              </text>
            ))}
          </g>
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
            <p className="text-foreground mb-1 text-sm font-medium">
              {new Date(data[hoveredIndex].date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
              <span className="text-muted-foreground">Open</span>
              <span
                className="font-mono"
                style={{
                  color:
                    data[hoveredIndex].close >= data[hoveredIndex].open
                      ? upColor
                      : downColor,
                }}
              >
                {valueFormatter(data[hoveredIndex].open)}
              </span>
              <span className="text-muted-foreground">High</span>
              <span
                className="font-mono"
                style={{
                  color:
                    data[hoveredIndex].close >= data[hoveredIndex].open
                      ? upColor
                      : downColor,
                }}
              >
                {valueFormatter(data[hoveredIndex].high)}
              </span>
              <span className="text-muted-foreground">Low</span>
              <span
                className="font-mono"
                style={{
                  color:
                    data[hoveredIndex].close >= data[hoveredIndex].open
                      ? upColor
                      : downColor,
                }}
              >
                {valueFormatter(data[hoveredIndex].low)}
              </span>
              <span className="text-muted-foreground">Close</span>
              <span
                className="font-mono"
                style={{
                  color:
                    data[hoveredIndex].close >= data[hoveredIndex].open
                      ? upColor
                      : downColor,
                }}
              >
                {valueFormatter(data[hoveredIndex].close)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
