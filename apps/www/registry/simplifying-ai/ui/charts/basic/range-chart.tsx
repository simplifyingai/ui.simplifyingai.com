"use client"

import * as React from "react"
import { scaleBand, scaleLinear, scalePoint } from "d3-scale"
import { area, curveLinear, curveMonotoneX, line } from "d3-shape"

import { cn } from "@/lib/utils"

export interface RangeDataPoint {
  category: string
  low: number
  high: number
  mid?: number
  forecast?: boolean
}

export interface RangeSeries {
  name: string
  data: RangeDataPoint[]
  color?: string
}

export interface RangeChartProps {
  /** Single series data (simple usage) */
  data?: RangeDataPoint[]
  /** Multiple series data (advanced usage) */
  series?: RangeSeries[]
  className?: string
  /** Visual style variant: area (shaded), bars (discrete rectangles), horizontal (horizontal bars) */
  variant?: "area" | "bars" | "horizontal"
  /** Use smooth curves or straight lines (only for area variant) */
  curve?: "smooth" | "linear"
  /** Show the mid-line through data points (only for area variant) */
  showMidLine?: boolean
  /** Show grid lines */
  showGrid?: boolean
  /** Show data point markers */
  showMarkers?: boolean
  /** Show error bar caps (I-bar style) for bars/horizontal variants */
  showErrorBars?: boolean
  /** Fill opacity for the range area (0-1) */
  fillOpacity?: number
  /** Default color when using single series */
  color?: string
  /** Array of colors for multiple series */
  colors?: string[]
  /** Label for low values in tooltip */
  lowLabel?: string
  /** Label for high values in tooltip */
  highLabel?: string
  /** Label for mid values in tooltip */
  midLabel?: string
  /** Custom value formatter */
  valueFormatter?: (value: number) => string
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
]

export function RangeChart({
  data,
  series,
  className,
  variant = "area",
  curve = "smooth",
  showMidLine = true,
  showGrid = true,
  showMarkers = true,
  showErrorBars = false,
  fillOpacity = 0.25,
  color = "var(--chart-1)",
  colors = DEFAULT_COLORS,
  lowLabel = "Low",
  highLabel = "High",
  midLabel = "Value",
  valueFormatter = (v) => v.toLocaleString(),
}: RangeChartProps) {
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    seriesIndex: number
    pointIndex: number
  } | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })
  const svgRef = React.useRef<SVGSVGElement>(null)

  // Normalize data to series format
  const normalizedSeries: RangeSeries[] = React.useMemo(() => {
    if (series && series.length > 0) {
      return series.map((s, i) => ({
        ...s,
        color: s.color ?? colors[i % colors.length],
      }))
    }
    if (data && data.length > 0) {
      return [{ name: "Series", data, color }]
    }
    return []
  }, [data, series, color, colors])

  // Determine if horizontal orientation
  const isHorizontal = variant === "horizontal"
  const isBarsVariant = variant === "bars" || variant === "horizontal"

  // Calculate dimensions - horizontal variant has dynamic height based on categories
  const categoryCount = React.useMemo(() => {
    const allCategories = new Set<string>()
    normalizedSeries.forEach((s) =>
      s.data.forEach((d) => allCategories.add(d.category))
    )
    return allCategories.size
  }, [normalizedSeries])

  const width = 500
  const height = isHorizontal ? Math.max(250, categoryCount * 50 + 80) : 300
  const margin = isHorizontal
    ? { top: 20, right: 30, bottom: 40, left: 100 }
    : { top: 20, right: 30, bottom: 50, left: 55 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Get all unique categories from all series
  const categories = React.useMemo(() => {
    const allCategories = new Set<string>()
    normalizedSeries.forEach((s) => {
      s.data.forEach((d) => allCategories.add(d.category))
    })
    // Preserve order from first series
    if (normalizedSeries.length > 0) {
      return normalizedSeries[0].data.map((d) => d.category)
    }
    return Array.from(allCategories)
  }, [normalizedSeries])

  // Value extent calculation
  const valueExtent = React.useMemo(() => {
    const allValues: number[] = []
    normalizedSeries.forEach((s) => {
      s.data.forEach((d) => {
        allValues.push(d.low, d.high)
        if (d.mid !== undefined) allValues.push(d.mid)
      })
    })
    if (allValues.length === 0) return { min: 0, max: 100 }

    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.1 || 10
    return { min: Math.min(0, min - padding), max: max + padding }
  }, [normalizedSeries])

  // Band scale for bars/horizontal variants
  const bandScale = React.useMemo(() => {
    return scaleBand<string>()
      .domain(categories)
      .range(isHorizontal ? [0, innerHeight] : [0, innerWidth])
      .padding(0.3)
  }, [categories, innerWidth, innerHeight, isHorizontal])

  // Point scale for area variant
  const pointScale = React.useMemo(() => {
    return scalePoint<string>()
      .domain(categories)
      .range([0, innerWidth])
      .padding(0.1)
  }, [categories, innerWidth])

  // Value scale (linear)
  const valueScale = React.useMemo(() => {
    return scaleLinear()
      .domain([valueExtent.min, valueExtent.max])
      .range(isHorizontal ? [0, innerWidth] : [innerHeight, 0])
      .nice()
  }, [valueExtent, innerWidth, innerHeight, isHorizontal])

  const valueTicks = valueScale.ticks(6)
  const curveType = curve === "smooth" ? curveMonotoneX : curveLinear

  // Bar width calculation for multi-series
  const barWidth = React.useMemo(() => {
    if (!isBarsVariant) return 0
    const bandwidth = bandScale.bandwidth()
    return normalizedSeries.length > 1
      ? bandwidth / normalizedSeries.length - 2
      : bandwidth
  }, [bandScale, normalizedSeries.length, isBarsVariant])

  // Helper to get category position
  const getCategoryPos = (category: string): number => {
    if (isBarsVariant) {
      return bandScale(category) ?? 0
    }
    return pointScale(category) ?? 0
  }

  // Get bandwidth (0 for point scale)
  const getBandwidth = (): number => {
    return isBarsVariant ? bandScale.bandwidth() : 0
  }

  // Generate paths for each series (only for area variant)
  const seriesPaths = React.useMemo(() => {
    if (isBarsVariant) return []

    return normalizedSeries.map((s) => {
      // Split data into regular and forecast sections
      const regularData = s.data.filter((d) => !d.forecast)
      const forecastData = s.data.filter((d) => d.forecast)

      // Find the last regular point and first forecast point for connection
      const lastRegular =
        regularData.length > 0 ? regularData[regularData.length - 1] : null
      const firstForecast = forecastData.length > 0 ? forecastData[0] : null

      // Include connection point in forecast if there's data before it
      const forecastWithConnection =
        lastRegular && firstForecast
          ? [lastRegular, ...forecastData]
          : forecastData

      // Area generator for range band
      const areaGenerator = area<RangeDataPoint>()
        .x((d) => pointScale(d.category) ?? 0)
        .y0((d) => valueScale(d.low))
        .y1((d) => valueScale(d.high))
        .curve(curveType)

      // Line generator for mid-line
      const lineGenerator = line<RangeDataPoint>()
        .x((d) => pointScale(d.category) ?? 0)
        .y((d) => valueScale(d.mid ?? (d.low + d.high) / 2))
        .curve(curveType)

      return {
        regularArea:
          regularData.length > 0 ? (areaGenerator(regularData) ?? "") : "",
        forecastArea:
          forecastWithConnection.length > 1
            ? (areaGenerator(forecastWithConnection) ?? "")
            : "",
        regularLine:
          regularData.length > 0 ? (lineGenerator(regularData) ?? "") : "",
        forecastLine:
          forecastWithConnection.length > 1
            ? (lineGenerator(forecastWithConnection) ?? "")
            : "",
      }
    })
  }, [normalizedSeries, pointScale, valueScale, curveType, isBarsVariant])

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = width / rect.width
    const scaleY = height / rect.height
    const x = (e.clientX - rect.left) * scaleX - margin.left
    const y = (e.clientY - rect.top) * scaleY - margin.top

    // Find closest point
    let closestSeriesIndex = -1
    let closestPointIndex = -1
    let closestDist = Infinity

    normalizedSeries.forEach((s, si) => {
      s.data.forEach((d, pi) => {
        let px: number, py: number
        const catPos = getCategoryPos(d.category)
        const bandwidth = getBandwidth()

        if (isHorizontal) {
          px = valueScale(d.mid ?? (d.low + d.high) / 2)
          py =
            catPos +
            bandwidth / 2 +
            (normalizedSeries.length > 1 ? si * (barWidth + 2) : 0)
        } else if (isBarsVariant) {
          px =
            catPos +
            bandwidth / 2 +
            (normalizedSeries.length > 1 ? si * (barWidth + 2) : 0)
          py = valueScale(d.mid ?? (d.low + d.high) / 2)
        } else {
          px = catPos
          py = valueScale(d.mid ?? (d.low + d.high) / 2)
        }

        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2)
        if (dist < closestDist && dist < 50) {
          closestDist = dist
          closestSeriesIndex = si
          closestPointIndex = pi
        }
      })
    })

    if (closestSeriesIndex >= 0 && closestPointIndex >= 0) {
      const s = normalizedSeries[closestSeriesIndex]
      const d = s.data[closestPointIndex]
      let tooltipX: number, tooltipY: number
      const catPos = getCategoryPos(d.category)
      const bandwidth = getBandwidth()

      if (isHorizontal) {
        tooltipX = valueScale(d.high) + margin.left
        tooltipY = catPos + bandwidth / 2 + margin.top
      } else if (isBarsVariant) {
        tooltipX = catPos + bandwidth / 2 + margin.left
        tooltipY = valueScale(d.high) + margin.top
      } else {
        tooltipX = catPos + margin.left
        tooltipY = valueScale(d.mid ?? (d.low + d.high) / 2) + margin.top
      }

      setTooltipPos({ x: tooltipX, y: tooltipY })
      setHoveredPoint({
        seriesIndex: closestSeriesIndex,
        pointIndex: closestPointIndex,
      })
    } else {
      setHoveredPoint(null)
    }
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  // Error bar cap size
  const errorBarCapSize = 6

  if (normalizedSeries.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex h-[300px] items-center justify-center",
          className
        )}
      >
        No data available
      </div>
    )
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {normalizedSeries.map((s, i) => (
          <div key={s.name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground text-sm">{s.name}</span>
          </div>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Gradient definitions for each series */}
          {normalizedSeries.map((s, i) => (
            <linearGradient
              key={`gradient-${i}`}
              id={`range-gradient-${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={s.color}
                stopOpacity={fillOpacity * 1.5}
              />
              <stop
                offset="100%"
                stopColor={s.color}
                stopOpacity={fillOpacity * 0.5}
              />
            </linearGradient>
          ))}
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {showGrid && isHorizontal
            ? valueTicks.map((tick) => (
                <line
                  key={tick}
                  x1={valueScale(tick)}
                  x2={valueScale(tick)}
                  y1={0}
                  y2={innerHeight}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  className="dark:stroke-zinc-700"
                />
              ))
            : showGrid &&
              valueTicks.map((tick) => (
                <line
                  key={tick}
                  x1={0}
                  x2={innerWidth}
                  y1={valueScale(tick)}
                  y2={valueScale(tick)}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  className="dark:stroke-zinc-700"
                />
              ))}

          {/* Axis lines */}
          {isHorizontal ? (
            <line
              x1={0}
              x2={0}
              y1={0}
              y2={innerHeight}
              stroke="#d1d5db"
              strokeWidth={1}
              className="dark:stroke-zinc-600"
            />
          ) : (
            <line
              x1={0}
              x2={innerWidth}
              y1={innerHeight}
              y2={innerHeight}
              stroke="#d1d5db"
              strokeWidth={1}
              className="dark:stroke-zinc-600"
            />
          )}

          {/* Render each series */}
          {normalizedSeries.map((s, seriesIndex) => {
            const paths = seriesPaths[seriesIndex]
            const isSeriesHovered = hoveredPoint?.seriesIndex === seriesIndex
            const opacity = hoveredPoint !== null && !isSeriesHovered ? 0.3 : 1
            const bandwidth = getBandwidth()
            const seriesOffset =
              normalizedSeries.length > 1 ? seriesIndex * (barWidth + 2) : 0

            return (
              <g key={s.name} style={{ opacity, transition: "opacity 150ms" }}>
                {/* AREA VARIANT: Render area paths */}
                {!isBarsVariant && (
                  <>
                    {/* Regular area band */}
                    {paths?.regularArea && (
                      <path
                        d={paths.regularArea}
                        fill={`url(#range-gradient-${seriesIndex})`}
                        stroke="none"
                      />
                    )}

                    {/* Forecast area band (slightly more transparent) */}
                    {paths?.forecastArea && (
                      <path
                        d={paths.forecastArea}
                        fill={s.color}
                        fillOpacity={fillOpacity * 0.5}
                        stroke="none"
                      />
                    )}

                    {/* Regular mid-line */}
                    {showMidLine && paths?.regularLine && (
                      <path
                        d={paths.regularLine}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Forecast mid-line (dashed) */}
                    {showMidLine && paths?.forecastLine && (
                      <path
                        d={paths.forecastLine}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Data point markers for area */}
                    {showMarkers &&
                      s.data.map((d, pointIndex) => {
                        const x = pointScale(d.category) ?? 0
                        const y = valueScale(d.mid ?? (d.low + d.high) / 2)
                        const isPointHovered =
                          hoveredPoint?.seriesIndex === seriesIndex &&
                          hoveredPoint?.pointIndex === pointIndex

                        return (
                          <circle
                            key={d.category}
                            cx={x}
                            cy={y}
                            r={isPointHovered ? 6 : 4}
                            fill={s.color}
                            stroke="white"
                            strokeWidth={2}
                            style={{ transition: "r 100ms" }}
                            className="cursor-pointer"
                          />
                        )
                      })}
                  </>
                )}

                {/* BARS/HORIZONTAL VARIANT: Render discrete bars */}
                {isBarsVariant &&
                  s.data.map((d, pointIndex) => {
                    const catPos = getCategoryPos(d.category)
                    const isPointHovered =
                      hoveredPoint?.seriesIndex === seriesIndex &&
                      hoveredPoint?.pointIndex === pointIndex

                    if (isHorizontal) {
                      // Horizontal bars
                      const x = valueScale(d.low)
                      const y = catPos + seriesOffset
                      const barLength = valueScale(d.high) - valueScale(d.low)
                      const midX = valueScale(d.mid ?? (d.low + d.high) / 2)

                      return (
                        <g key={d.category}>
                          {/* Range bar */}
                          <rect
                            x={x}
                            y={y}
                            width={barLength}
                            height={barWidth}
                            fill={s.color}
                            fillOpacity={fillOpacity + 0.2}
                            rx={3}
                            className="cursor-pointer"
                          />

                          {/* Mid marker */}
                          {showMarkers && (
                            <circle
                              cx={midX}
                              cy={y + barWidth / 2}
                              r={isPointHovered ? 5 : 4}
                              fill={s.color}
                              stroke="white"
                              strokeWidth={2}
                            />
                          )}

                          {/* Error bars (I-bar caps) */}
                          {showErrorBars && (
                            <>
                              <line
                                x1={x}
                                x2={x}
                                y1={y + barWidth / 2 - errorBarCapSize}
                                y2={y + barWidth / 2 + errorBarCapSize}
                                stroke={s.color}
                                strokeWidth={2}
                              />
                              <line
                                x1={x + barLength}
                                x2={x + barLength}
                                y1={y + barWidth / 2 - errorBarCapSize}
                                y2={y + barWidth / 2 + errorBarCapSize}
                                stroke={s.color}
                                strokeWidth={2}
                              />
                            </>
                          )}
                        </g>
                      )
                    } else {
                      // Vertical bars
                      const x = catPos + seriesOffset
                      const yHigh = valueScale(d.high)
                      const yLow = valueScale(d.low)
                      const barHeight = yLow - yHigh
                      const midY = valueScale(d.mid ?? (d.low + d.high) / 2)

                      return (
                        <g key={d.category}>
                          {/* Range bar */}
                          <rect
                            x={x}
                            y={yHigh}
                            width={barWidth}
                            height={barHeight}
                            fill={s.color}
                            fillOpacity={fillOpacity + 0.2}
                            rx={3}
                            className="cursor-pointer"
                          />

                          {/* Mid marker */}
                          {showMarkers && (
                            <circle
                              cx={x + barWidth / 2}
                              cy={midY}
                              r={isPointHovered ? 5 : 4}
                              fill={s.color}
                              stroke="white"
                              strokeWidth={2}
                            />
                          )}

                          {/* Error bars (I-bar caps) */}
                          {showErrorBars && (
                            <>
                              <line
                                x1={x + barWidth / 2 - errorBarCapSize}
                                x2={x + barWidth / 2 + errorBarCapSize}
                                y1={yHigh}
                                y2={yHigh}
                                stroke={s.color}
                                strokeWidth={2}
                              />
                              <line
                                x1={x + barWidth / 2 - errorBarCapSize}
                                x2={x + barWidth / 2 + errorBarCapSize}
                                y1={yLow}
                                y2={yLow}
                                stroke={s.color}
                                strokeWidth={2}
                              />
                            </>
                          )}
                        </g>
                      )
                    }
                  })}
              </g>
            )
          })}

          {/* Axis labels */}
          {isHorizontal ? (
            <>
              {/* Y axis category labels (left side for horizontal) */}
              {categories.map((cat) => {
                const catPos = getCategoryPos(cat)
                const bandwidth = getBandwidth()
                return (
                  <text
                    key={cat}
                    x={-12}
                    y={catPos + bandwidth / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={12}
                    className="fill-foreground"
                  >
                    {cat}
                  </text>
                )
              })}

              {/* X axis value labels (bottom for horizontal) */}
              {valueTicks.map((tick) => (
                <text
                  key={tick}
                  x={valueScale(tick)}
                  y={innerHeight + 25}
                  textAnchor="middle"
                  fontSize={11}
                  className="fill-muted-foreground"
                >
                  {valueFormatter(tick)}
                </text>
              ))}
            </>
          ) : (
            <>
              {/* X axis category labels (bottom for vertical) */}
              {categories.map((cat) => {
                const catPos = getCategoryPos(cat)
                const bandwidth = getBandwidth()
                return (
                  <text
                    key={cat}
                    x={isBarsVariant ? catPos + bandwidth / 2 : catPos}
                    y={innerHeight + 25}
                    textAnchor="middle"
                    fontSize={12}
                    className="fill-foreground"
                  >
                    {cat}
                  </text>
                )
              })}

              {/* Y axis value labels (left for vertical) */}
              {valueTicks.map((tick) => (
                <text
                  key={tick}
                  x={-12}
                  y={valueScale(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  className="fill-muted-foreground"
                >
                  {valueFormatter(tick)}
                </text>
              ))}
            </>
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPoint !== null && (
        <div
          className="bg-foreground text-background pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 12,
          }}
        >
          {(() => {
            const s = normalizedSeries[hoveredPoint.seriesIndex]
            const d = s.data[hoveredPoint.pointIndex]
            const mid = d.mid ?? (d.low + d.high) / 2
            return (
              <>
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name} - {d.category}
                  {d.forecast && (
                    <span className="text-[10px] opacity-70">(Forecast)</span>
                  )}
                </div>
                <div className="space-y-0.5 opacity-90">
                  <div>
                    {highLabel}: {valueFormatter(d.high)}
                  </div>
                  <div>
                    {midLabel}: {valueFormatter(mid)}
                  </div>
                  <div>
                    {lowLabel}: {valueFormatter(d.low)}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
