"use client"

import * as React from "react"
import { max, median, min, quantile } from "d3-array"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface BoxPlotDataPoint {
  label: string
  values: number[]
  color?: string
}

export interface BoxPlotStats {
  label: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: number[]
  color?: string
}

export interface BoxPlotChartProps {
  data: BoxPlotDataPoint[] | BoxPlotStats[]
  className?: string
  color?: string
  showGrid?: boolean
  showTooltip?: boolean
  orientation?: "vertical" | "horizontal"
  boxWidth?: number
  showOutliers?: boolean
  whiskerType?: "minmax" | "iqr"
  aspectRatio?: number
  valueFormatter?: (value: number) => string
}

function isStats(
  data: BoxPlotDataPoint[] | BoxPlotStats[]
): data is BoxPlotStats[] {
  return data.length > 0 && "median" in data[0]
}

function calculateStats(
  values: number[],
  whiskerType: "minmax" | "iqr"
): Omit<BoxPlotStats, "label" | "color"> {
  const sorted = [...values].sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25) ?? 0
  const med = median(sorted) ?? 0
  const q3 = quantile(sorted, 0.75) ?? 0
  const iqr = q3 - q1

  let minVal: number, maxVal: number
  let outliers: number[] = []

  if (whiskerType === "iqr") {
    const lowerFence = q1 - 1.5 * iqr
    const upperFence = q3 + 1.5 * iqr
    minVal = min(sorted.filter((v) => v >= lowerFence)) ?? sorted[0]
    maxVal =
      max(sorted.filter((v) => v <= upperFence)) ?? sorted[sorted.length - 1]
    outliers = sorted.filter((v) => v < lowerFence || v > upperFence)
  } else {
    minVal = min(sorted) ?? 0
    maxVal = max(sorted) ?? 0
  }

  return { min: minVal, q1, median: med, q3, max: maxVal, outliers }
}

export function BoxPlotChart({
  data,
  className,
  color = "var(--chart-1)",
  showGrid = true,
  showTooltip = true,
  orientation = "vertical",
  boxWidth = 0.6,
  showOutliers = true,
  whiskerType = "iqr",
  aspectRatio = 2,
  valueFormatter = (value) => value.toFixed(0),
}: BoxPlotChartProps) {
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
  const isVertical = orientation === "vertical"

  // Calculate stats if raw values provided
  const statsData: BoxPlotStats[] = React.useMemo(() => {
    if (isStats(data)) return data
    return data.map((d) => ({
      label: d.label,
      color: d.color,
      ...calculateStats(d.values, whiskerType),
    }))
  }, [data, whiskerType])

  // Category scale
  const categoryScale = React.useMemo(() => {
    return scaleBand()
      .domain(statsData.map((d) => d.label))
      .range(isVertical ? [0, innerWidth] : [0, innerHeight])
      .padding(0.3)
  }, [statsData, innerWidth, innerHeight, isVertical])

  // Value scale
  const valueScale = React.useMemo(() => {
    const allValues = statsData.flatMap((d) => [d.min, d.max, ...d.outliers])
    const minV = Math.min(...allValues)
    const maxV = Math.max(...allValues)
    const padding = (maxV - minV) * 0.1
    return scaleLinear()
      .domain([Math.floor(minV - padding), Math.ceil(maxV + padding)])
      .range(isVertical ? [innerHeight, 0] : [0, innerWidth])
      .nice()
  }, [statsData, innerWidth, innerHeight, isVertical])

  const actualBoxWidth = categoryScale.bandwidth() * boxWidth
  const ticks = valueScale.ticks(5)

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
          {/* Grid */}
          {showGrid && (
            <>
              {/* Horizontal grid lines */}
              {ticks.map((tick) => (
                <line
                  key={`h-${tick}`}
                  x1={0}
                  x2={innerWidth}
                  y1={isVertical ? valueScale(tick) : 0}
                  y2={isVertical ? valueScale(tick) : innerHeight}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                />
              ))}
              {/* Vertical grid lines */}
              {statsData.map((d) => {
                const x =
                  (categoryScale(d.label) ?? 0) + categoryScale.bandwidth() / 2
                return (
                  <line
                    key={`v-${d.label}`}
                    x1={x}
                    x2={x}
                    y1={0}
                    y2={innerHeight}
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.5}
                    strokeDasharray="3 3"
                  />
                )
              })}
            </>
          )}

          {/* Box plots */}
          {statsData.map((d, index) => {
            const boxColor = d.color ?? color
            const center =
              (categoryScale(d.label) ?? 0) + categoryScale.bandwidth() / 2
            const boxOffset = actualBoxWidth / 2
            const isHovered = hoveredIndex === index

            if (isVertical) {
              return (
                <g
                  key={d.label}
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
                  {/* Whisker line */}
                  <line
                    x1={center}
                    x2={center}
                    y1={valueScale(d.min)}
                    y2={valueScale(d.max)}
                    stroke={boxColor}
                    strokeWidth={1.5}
                  />

                  {/* Min whisker */}
                  <line
                    x1={center - boxOffset * 0.5}
                    x2={center + boxOffset * 0.5}
                    y1={valueScale(d.min)}
                    y2={valueScale(d.min)}
                    stroke={boxColor}
                    strokeWidth={2}
                  />

                  {/* Max whisker */}
                  <line
                    x1={center - boxOffset * 0.5}
                    x2={center + boxOffset * 0.5}
                    y1={valueScale(d.max)}
                    y2={valueScale(d.max)}
                    stroke={boxColor}
                    strokeWidth={2}
                  />

                  {/* Box */}
                  <rect
                    x={center - boxOffset}
                    y={valueScale(d.q3)}
                    width={actualBoxWidth}
                    height={Math.max(0, valueScale(d.q1) - valueScale(d.q3))}
                    fill={boxColor}
                    fillOpacity={0.2}
                    stroke={boxColor}
                    strokeWidth={2}
                    rx={4}
                  />

                  {/* Median line */}
                  <line
                    x1={center - boxOffset}
                    x2={center + boxOffset}
                    y1={valueScale(d.median)}
                    y2={valueScale(d.median)}
                    stroke={boxColor}
                    strokeWidth={3}
                  />

                  {/* Outliers */}
                  {showOutliers &&
                    d.outliers.map((outlier, i) => (
                      <circle
                        key={i}
                        cx={center}
                        cy={valueScale(outlier)}
                        r={4}
                        fill={boxColor}
                        fillOpacity={0.5}
                        stroke={boxColor}
                        strokeWidth={1.5}
                      />
                    ))}
                </g>
              )
            } else {
              // Horizontal orientation
              return (
                <g
                  key={d.label}
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
                  {/* Whisker line */}
                  <line
                    y1={center}
                    y2={center}
                    x1={valueScale(d.min)}
                    x2={valueScale(d.max)}
                    stroke={boxColor}
                    strokeWidth={1.5}
                  />

                  {/* Min whisker */}
                  <line
                    y1={center - boxOffset * 0.5}
                    y2={center + boxOffset * 0.5}
                    x1={valueScale(d.min)}
                    x2={valueScale(d.min)}
                    stroke={boxColor}
                    strokeWidth={2}
                  />

                  {/* Max whisker */}
                  <line
                    y1={center - boxOffset * 0.5}
                    y2={center + boxOffset * 0.5}
                    x1={valueScale(d.max)}
                    x2={valueScale(d.max)}
                    stroke={boxColor}
                    strokeWidth={2}
                  />

                  {/* Box */}
                  <rect
                    y={center - boxOffset}
                    x={valueScale(d.q1)}
                    height={actualBoxWidth}
                    width={Math.max(0, valueScale(d.q3) - valueScale(d.q1))}
                    fill={boxColor}
                    fillOpacity={0.2}
                    stroke={boxColor}
                    strokeWidth={2}
                    rx={4}
                  />

                  {/* Median line */}
                  <line
                    y1={center - boxOffset}
                    y2={center + boxOffset}
                    x1={valueScale(d.median)}
                    x2={valueScale(d.median)}
                    stroke={boxColor}
                    strokeWidth={3}
                  />

                  {/* Outliers */}
                  {showOutliers &&
                    d.outliers.map((outlier, i) => (
                      <circle
                        key={i}
                        cy={center}
                        cx={valueScale(outlier)}
                        r={4}
                        fill={boxColor}
                        fillOpacity={0.5}
                        stroke={boxColor}
                        strokeWidth={1.5}
                      />
                    ))}
                </g>
              )
            }
          })}

          {/* X Axis */}
          <g transform={`translate(0, ${innerHeight})`}>
            {statsData.map((d) => {
              const x =
                (categoryScale(d.label) ?? 0) + categoryScale.bandwidth() / 2
              return (
                <text
                  key={d.label}
                  x={x}
                  y={24}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs"
                >
                  {d.label}
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
                y={valueScale(tick)}
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
              {statsData[hoveredIndex].label}
            </p>
            <div className="space-y-0.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Max</span>
                <span style={{ color: statsData[hoveredIndex].color ?? color }}>
                  {valueFormatter(statsData[hoveredIndex].max)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Q3</span>
                <span style={{ color: statsData[hoveredIndex].color ?? color }}>
                  {valueFormatter(statsData[hoveredIndex].q3)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Median</span>
                <span style={{ color: statsData[hoveredIndex].color ?? color }}>
                  {valueFormatter(statsData[hoveredIndex].median)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Q1</span>
                <span style={{ color: statsData[hoveredIndex].color ?? color }}>
                  {valueFormatter(statsData[hoveredIndex].q1)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Min</span>
                <span style={{ color: statsData[hoveredIndex].color ?? color }}>
                  {valueFormatter(statsData[hoveredIndex].min)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
