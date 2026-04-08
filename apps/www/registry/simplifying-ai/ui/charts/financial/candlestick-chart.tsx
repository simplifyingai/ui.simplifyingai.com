"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface CandlestickDataPoint {
  date: string | Date
  open: number
  high: number
  low: number
  close: number
}

export interface CandlestickChartProps {
  data: CandlestickDataPoint[]
  className?: string
  upColor?: string
  downColor?: string
  showGrid?: boolean
  showTooltip?: boolean
  hollowCandles?: boolean
  aspectRatio?: number
  valueFormatter?: (value: number) => string
  dateFormatter?: (date: Date) => string
}

export function CandlestickChart({
  data,
  className,
  upColor = "var(--chart-2)",
  downColor = "var(--chart-4)",
  showGrid = true,
  showTooltip = true,
  hollowCandles = false,
  aspectRatio = 2.5,
  valueFormatter = (value) => `$${value.toFixed(0)}`,
  dateFormatter = (date) =>
    date.toLocaleDateString("en-US", { month: "short" }),
}: CandlestickChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })

  // Responsive sizing
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

  // X Scale
  const xScale = React.useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => String(d.date)))
      .range([0, innerWidth])
      .padding(0.2)
  }, [data, innerWidth])

  // Y Scale (price)
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

  const candleWidth = xScale.bandwidth() * 0.8
  const ticks = yScale.ticks(5)

  // Get unique months for x-axis labels
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
          {/* Grid - dashed lines like area chart */}
          {showGrid && (
            <>
              {/* Horizontal grid lines */}
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
              {/* Vertical grid lines at month boundaries */}
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

          {/* Candlesticks */}
          {data.map((d, index) => {
            const isUp = d.close >= d.open
            const color = isUp ? upColor : downColor
            const bodyTop = isUp ? d.close : d.open
            const bodyBottom = isUp ? d.open : d.close
            const x = (xScale(String(d.date)) ?? 0) + xScale.bandwidth() / 2
            const isHovered = hoveredIndex === index

            // For hollow candles: up candles are hollow, down are filled
            const fill = hollowCandles ? (isUp ? "transparent" : color) : color

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
                {/* Wick (high to low) */}
                <line
                  x1={x}
                  x2={x}
                  y1={yScale(d.high)}
                  y2={yScale(d.low)}
                  stroke={color}
                  strokeWidth={1}
                />

                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={yScale(bodyTop)}
                  width={candleWidth}
                  height={Math.max(1, yScale(bodyBottom) - yScale(bodyTop))}
                  fill={fill}
                  stroke={color}
                  strokeWidth={1}
                  rx={1}
                />
              </g>
            )
          })}

          {/* X Axis - Month labels */}
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

      {/* Tooltip - auto-adjusts position based on available space */}
      {showTooltip &&
        hoveredIndex !== null &&
        (() => {
          const tooltipWidth = 140
          const tooltipHeight = 120
          const padding = 10

          // Determine horizontal position
          const spaceOnRight = width - tooltipPos.x
          const showOnLeft = spaceOnRight < tooltipWidth + padding * 2

          // Determine vertical position
          const spaceOnTop = tooltipPos.y
          const showBelow = spaceOnTop < tooltipHeight + padding

          return (
            <div
              className="pointer-events-none absolute z-50"
              style={{
                left: showOnLeft
                  ? tooltipPos.x - padding
                  : tooltipPos.x + padding,
                top: showBelow
                  ? tooltipPos.y + padding
                  : tooltipPos.y - padding,
                transform: `translate(${showOnLeft ? "-100%" : "0"}, ${showBelow ? "0" : "-100%"})`,
              }}
            >
              <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
                <p className="text-foreground mb-1 text-sm font-medium">
                  {new Date(data[hoveredIndex].date).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
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
          )
        })()}
    </div>
  )
}
