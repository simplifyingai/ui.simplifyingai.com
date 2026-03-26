"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

interface CandlestickDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
}

// Large dataset - 100+ trading days
const chartData: CandlestickDataPoint[] = [
  { date: "2024-01-02", open: 45, high: 52, low: 42, close: 50 },
  { date: "2024-01-03", open: 50, high: 55, low: 48, close: 48 },
  { date: "2024-01-04", open: 48, high: 50, low: 40, close: 42 },
  { date: "2024-01-05", open: 42, high: 48, low: 38, close: 46 },
  { date: "2024-01-08", open: 46, high: 52, low: 44, close: 50 },
  { date: "2024-01-09", open: 50, high: 58, low: 48, close: 56 },
  { date: "2024-01-10", open: 56, high: 62, low: 54, close: 58 },
  { date: "2024-01-11", open: 58, high: 60, low: 50, close: 52 },
  { date: "2024-01-12", open: 52, high: 56, low: 48, close: 54 },
  { date: "2024-01-16", open: 54, high: 60, low: 52, close: 58 },
  { date: "2024-01-17", open: 58, high: 65, low: 56, close: 62 },
  { date: "2024-01-18", open: 62, high: 68, low: 60, close: 55 },
  { date: "2024-01-19", open: 55, high: 58, low: 50, close: 52 },
  { date: "2024-01-22", open: 52, high: 55, low: 45, close: 48 },
  { date: "2024-01-23", open: 48, high: 52, low: 42, close: 50 },
  { date: "2024-01-24", open: 50, high: 58, low: 48, close: 56 },
  { date: "2024-01-25", open: 56, high: 62, low: 54, close: 60 },
  { date: "2024-01-26", open: 60, high: 68, low: 58, close: 65 },
  { date: "2024-01-29", open: 65, high: 72, low: 62, close: 70 },
  { date: "2024-01-30", open: 70, high: 75, low: 65, close: 68 },
  { date: "2024-01-31", open: 68, high: 72, low: 60, close: 62 },
  { date: "2024-02-01", open: 62, high: 65, low: 55, close: 58 },
  { date: "2024-02-02", open: 58, high: 62, low: 52, close: 60 },
  { date: "2024-02-05", open: 60, high: 68, low: 58, close: 65 },
  { date: "2024-02-06", open: 65, high: 72, low: 62, close: 70 },
  { date: "2024-02-07", open: 70, high: 78, low: 68, close: 75 },
  { date: "2024-02-08", open: 75, high: 80, low: 70, close: 72 },
  { date: "2024-02-09", open: 72, high: 75, low: 65, close: 68 },
  { date: "2024-02-12", open: 68, high: 72, low: 62, close: 70 },
  { date: "2024-02-13", open: 70, high: 78, low: 68, close: 76 },
  { date: "2024-02-14", open: 76, high: 82, low: 74, close: 80 },
  { date: "2024-02-15", open: 80, high: 85, low: 75, close: 78 },
  { date: "2024-02-16", open: 78, high: 82, low: 72, close: 75 },
  { date: "2024-02-20", open: 75, high: 80, low: 70, close: 78 },
  { date: "2024-02-21", open: 78, high: 85, low: 76, close: 82 },
  { date: "2024-02-22", open: 82, high: 88, low: 80, close: 72 },
  { date: "2024-02-23", open: 72, high: 75, low: 65, close: 68 },
  { date: "2024-02-26", open: 68, high: 72, low: 60, close: 65 },
  { date: "2024-02-27", open: 65, high: 70, low: 58, close: 62 },
  { date: "2024-02-28", open: 62, high: 68, low: 55, close: 58 },
  { date: "2024-02-29", open: 58, high: 62, low: 50, close: 55 },
  { date: "2024-03-01", open: 55, high: 60, low: 48, close: 52 },
  { date: "2024-03-04", open: 52, high: 58, low: 45, close: 56 },
  { date: "2024-03-05", open: 56, high: 65, low: 54, close: 62 },
  { date: "2024-03-06", open: 62, high: 70, low: 60, close: 68 },
  { date: "2024-03-07", open: 68, high: 75, low: 65, close: 72 },
  { date: "2024-03-08", open: 72, high: 78, low: 68, close: 65 },
  { date: "2024-03-11", open: 65, high: 70, low: 58, close: 60 },
  { date: "2024-03-12", open: 60, high: 65, low: 52, close: 58 },
  { date: "2024-03-13", open: 58, high: 65, low: 55, close: 62 },
  { date: "2024-03-14", open: 62, high: 70, low: 60, close: 68 },
  { date: "2024-03-15", open: 68, high: 75, low: 65, close: 55 },
  { date: "2024-03-18", open: 55, high: 58, low: 48, close: 50 },
  { date: "2024-03-19", open: 50, high: 55, low: 42, close: 52 },
  { date: "2024-03-20", open: 52, high: 60, low: 50, close: 58 },
  { date: "2024-03-21", open: 58, high: 65, low: 55, close: 62 },
  { date: "2024-03-22", open: 62, high: 68, low: 58, close: 65 },
  { date: "2024-03-25", open: 65, high: 72, low: 62, close: 70 },
  { date: "2024-03-26", open: 70, high: 78, low: 68, close: 75 },
  { date: "2024-03-27", open: 75, high: 82, low: 72, close: 80 },
  { date: "2024-03-28", open: 80, high: 85, low: 75, close: 78 },
  { date: "2024-04-01", open: 78, high: 82, low: 70, close: 72 },
  { date: "2024-04-02", open: 72, high: 75, low: 65, close: 68 },
  { date: "2024-04-03", open: 68, high: 72, low: 60, close: 70 },
  { date: "2024-04-04", open: 70, high: 78, low: 68, close: 76 },
  { date: "2024-04-05", open: 76, high: 82, low: 74, close: 80 },
  { date: "2024-04-08", open: 80, high: 88, low: 78, close: 85 },
  { date: "2024-04-09", open: 85, high: 92, low: 82, close: 88 },
  { date: "2024-04-10", open: 88, high: 95, low: 85, close: 78 },
  { date: "2024-04-11", open: 78, high: 82, low: 72, close: 75 },
  { date: "2024-04-12", open: 75, high: 80, low: 68, close: 72 },
  { date: "2024-04-15", open: 72, high: 78, low: 65, close: 76 },
  { date: "2024-04-16", open: 76, high: 85, low: 74, close: 82 },
  { date: "2024-04-17", open: 82, high: 90, low: 80, close: 88 },
  { date: "2024-04-18", open: 88, high: 95, low: 85, close: 92 },
  { date: "2024-04-19", open: 92, high: 98, low: 88, close: 85 },
  { date: "2024-04-22", open: 85, high: 88, low: 78, close: 80 },
  { date: "2024-04-23", open: 80, high: 85, low: 72, close: 82 },
  { date: "2024-04-24", open: 82, high: 90, low: 80, close: 88 },
  { date: "2024-04-25", open: 88, high: 95, low: 85, close: 92 },
  { date: "2024-04-26", open: 92, high: 100, low: 90, close: 98 },
]

const upColor = "#22c55e"
const downColor = "#ef4444"

export default function CandlestickChartScrollableDemo() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })

  // Fixed dimensions
  const height = 320
  const margin = { top: 20, right: 20, bottom: 40, left: 0 }
  const yAxisWidth = 50
  const candleWidth = 12
  const candleGap = 4
  const chartWidth = chartData.length * (candleWidth + candleGap)
  const innerHeight = height - margin.top - margin.bottom

  // Y Scale (price) - fixed based on all data
  const yScale = React.useMemo(() => {
    const allPrices = chartData.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    const padding = (maxPrice - minPrice) * 0.1
    return scaleLinear()
      .domain([Math.max(0, minPrice - padding), maxPrice + padding])
      .range([innerHeight, 0])
      .nice()
  }, [innerHeight])

  // X Scale
  const xScale = React.useMemo(() => {
    return scaleBand()
      .domain(chartData.map((d) => d.date))
      .range([0, chartWidth])
      .padding(0.3)
  }, [chartWidth])

  const ticks = yScale.ticks(6)

  // Get month labels
  const monthLabels = React.useMemo(() => {
    const labels: { date: string; x: number }[] = []
    let lastMonth = -1
    chartData.forEach((d) => {
      const date = new Date(d.date)
      const month = date.getMonth()
      if (month !== lastMonth) {
        labels.push({
          date: d.date,
          x: (xScale(d.date) ?? 0) + xScale.bandwidth() / 2,
        })
        lastMonth = month
      }
    })
    return labels
  }, [xScale])

  // Scroll to end on mount (show latest data)
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

  return (
    <div className="w-full">
      <div className="flex">
        {/* Fixed Y-Axis */}
        <div className="flex-shrink-0" style={{ width: yAxisWidth }}>
          <svg width={yAxisWidth} height={height}>
            <g transform={`translate(0, ${margin.top})`}>
              {ticks.map((tick) => (
                <g key={tick}>
                  <text
                    x={yAxisWidth - 8}
                    y={yScale(tick)}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-muted-foreground text-xs"
                  >
                    ${tick}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Scrollable Chart Area */}
        <div
          ref={scrollRef}
          className="scrollbar-none flex-1 overflow-x-auto overflow-y-hidden"
          style={{
            height,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div
            className="relative"
            style={{ width: chartWidth + margin.right, height }}
          >
            <svg
              width={chartWidth + margin.right}
              height={height}
              className="relative block"
            >
              <g transform={`translate(0, ${margin.top})`}>
                {/* Horizontal Grid Lines */}
                {ticks.map((tick) => (
                  <line
                    key={`grid-${tick}`}
                    x1={0}
                    x2={chartWidth}
                    y1={yScale(tick)}
                    y2={yScale(tick)}
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                ))}

                {/* Vertical Grid Lines */}
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

                {/* Candlesticks */}
                {chartData.map((d, index) => {
                  const isUp = d.close >= d.open
                  const color = isUp ? upColor : downColor
                  const bodyTop = isUp ? d.close : d.open
                  const bodyBottom = isUp ? d.open : d.close
                  const x = (xScale(d.date) ?? 0) + xScale.bandwidth() / 2
                  const isHovered = hoveredIndex === index

                  return (
                    <g
                      key={index}
                      className={cn(
                        "cursor-pointer transition-opacity duration-150",
                        hoveredIndex !== null && !isHovered && "opacity-40"
                      )}
                      onMouseEnter={(e) => {
                        setHoveredIndex(index)
                        setTooltipPos({ x: e.clientX, y: e.clientY })
                      }}
                      onMouseMove={(e) => {
                        setTooltipPos({ x: e.clientX, y: e.clientY })
                      }}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Wick */}
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
                        height={Math.max(
                          1,
                          yScale(bodyBottom) - yScale(bodyTop)
                        )}
                        fill={color}
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
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </text>
                    )
                  })}
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <p className="text-muted-foreground mt-2 text-center text-xs">
        ← Scroll horizontally to see more data →
      </p>

      {/* Tooltip - Auto-adjusts position based on available space */}
      {hoveredIndex !== null &&
        (() => {
          const tooltipWidth = 140
          const tooltipHeight = 120
          const padding = 15

          // Check viewport bounds
          const viewportWidth =
            typeof window !== "undefined" ? window.innerWidth : 1000
          const viewportHeight =
            typeof window !== "undefined" ? window.innerHeight : 800

          const showOnLeft =
            tooltipPos.x + tooltipWidth + padding > viewportWidth
          const showBelow = tooltipPos.y - tooltipHeight - padding < 0

          return (
            <div
              className="pointer-events-none fixed z-50"
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
                  {new Date(chartData[hoveredIndex].date).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  )}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
                  <span className="text-muted-foreground">Open</span>
                  <span
                    className="font-mono"
                    style={{
                      color:
                        chartData[hoveredIndex].close >=
                        chartData[hoveredIndex].open
                          ? upColor
                          : downColor,
                    }}
                  >
                    ${chartData[hoveredIndex].open}
                  </span>
                  <span className="text-muted-foreground">High</span>
                  <span
                    className="font-mono"
                    style={{
                      color:
                        chartData[hoveredIndex].close >=
                        chartData[hoveredIndex].open
                          ? upColor
                          : downColor,
                    }}
                  >
                    ${chartData[hoveredIndex].high}
                  </span>
                  <span className="text-muted-foreground">Low</span>
                  <span
                    className="font-mono"
                    style={{
                      color:
                        chartData[hoveredIndex].close >=
                        chartData[hoveredIndex].open
                          ? upColor
                          : downColor,
                    }}
                  >
                    ${chartData[hoveredIndex].low}
                  </span>
                  <span className="text-muted-foreground">Close</span>
                  <span
                    className="font-mono"
                    style={{
                      color:
                        chartData[hoveredIndex].close >=
                        chartData[hoveredIndex].open
                          ? upColor
                          : downColor,
                    }}
                  >
                    ${chartData[hoveredIndex].close}
                  </span>
                </div>
              </div>
            </div>
          )
        })()}

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
