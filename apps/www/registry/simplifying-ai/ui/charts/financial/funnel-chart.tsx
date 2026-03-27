"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"
import { area, curveBasis } from "d3-shape"

import { cn } from "@/lib/utils"

import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"

export interface FunnelSeries {
  name: string
  values: number[] // Value at each stage
  color?: string
}

export interface FunnelChartProps extends BaseChartProps {
  /** Stage labels */
  stages: string[]
  /** Data series - each series flows through all stages */
  series: FunnelSeries[]
  /** Color scheme */
  colorScheme?: "orange" | "blue" | "purple" | "green" | "pink" | "custom"
  /** Show stage markers (vertical lines) */
  showStageMarkers?: boolean
  /** Show value pills at each stage */
  showValuePills?: boolean
  /** Position of value pills */
  pillPosition?: "top" | "bottom" | "both" | "center"
  /** Animate on mount */
  animate?: boolean
  /** Animation duration */
  animationDuration?: number
  /** Value formatter */
  valueFormatter?: (value: number) => string
  /** Minimum height for the flow (prevents collapse to zero) */
  minFlowHeight?: number
  /** How much of vertical space to use (0-1, default 0.85) */
  flowExpansion?: number
  /** Click handler */
  onSeriesClick?: (series: FunnelSeries, stageIndex: number) => void
}

// Legacy interface for backwards compatibility
export interface FunnelDataPoint {
  label: string
  value: number
  color?: string
}

// Color schemes matching the images - gradient from light to dark
const COLOR_SCHEMES = {
  orange: [
    "#FEF3C7", // lightest
    "#FDE68A",
    "#FCD34D",
    "#FBBF24",
    "#F59E0B",
    "#D97706",
    "#B45309",
    "#92400E", // darkest
  ],
  blue: [
    "#DBEAFE",
    "#BFDBFE",
    "#93C5FD",
    "#60A5FA",
    "#3B82F6",
    "#2563EB",
    "#1D4ED8",
    "#1E40AF",
  ],
  purple: [
    "#EDE9FE",
    "#DDD6FE",
    "#C4B5FD",
    "#A78BFA",
    "#8B5CF6",
    "#7C3AED",
    "#6D28D9",
    "#5B21B6",
  ],
  green: [
    "#D1FAE5",
    "#A7F3D0",
    "#6EE7B7",
    "#34D399",
    "#10B981",
    "#059669",
    "#047857",
    "#065F46",
  ],
  pink: [
    "#FCE7F3",
    "#FBCFE8",
    "#F9A8D4",
    "#F472B6",
    "#EC4899",
    "#DB2777",
    "#BE185D",
    "#9D174D",
  ],
  custom: [],
}

export function FunnelChart({
  stages,
  series,
  config,
  className,
  width = 900,
  height = 320,
  margin = { top: 45, right: 40, bottom: 45, left: 40 },
  showTooltip = true,
  colorScheme = "orange",
  showStageMarkers = true,
  showValuePills = true,
  pillPosition = "both",
  animate = true,
  animationDuration = 1000,
  valueFormatter = (v) => v.toLocaleString(),
  minFlowHeight = 12,
  flowExpansion = 0.98,
  onSeriesClick,
}: FunnelChartProps) {
  const [animationProgress, setAnimationProgress] = React.useState(
    animate ? 0 : 1
  )
  const [hoveredSeries, setHoveredSeries] = React.useState<number | null>(null)
  const [tooltipData, setTooltipData] = React.useState<{
    x: number
    y: number
    seriesIndex: number
    stageIndex: number
  } | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const gradientId = React.useId().replace(/:/g, "")

  // Animation
  React.useEffect(() => {
    if (!animate) return
    const startTime = Date.now()
    const animateFrame = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimationProgress(eased)
      if (progress < 1) requestAnimationFrame(animateFrame)
    }
    requestAnimationFrame(animateFrame)
  }, [animate, animationDuration])

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const centerY = innerHeight / 2

  const stageCount = stages.length
  const seriesCount = series.length

  // Get color for series - innermost is lightest, outermost is darkest
  const getColor = (index: number): string => {
    if (colorScheme === "custom" && series[index]?.color) {
      return series[index].color!
    }
    const scheme = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.orange
    // Map series index to color - distribute evenly across scheme
    const colorIndex = Math.floor(
      (index / Math.max(seriesCount - 1, 1)) * (scheme.length - 1)
    )
    return scheme[Math.min(colorIndex, scheme.length - 1)]
  }

  // Calculate max total at any stage for scaling
  const maxStageTotal = React.useMemo(() => {
    let max = 0
    for (let stageIndex = 0; stageIndex < stageCount; stageIndex++) {
      let total = 0
      for (const s of series) {
        total += s.values[stageIndex] || 0
      }
      max = Math.max(max, total)
    }
    return max || 1
  }, [series, stageCount])

  // Y scale - maps values to heights (half the inner height for symmetric expansion)
  // flowExpansion controls how much of the available vertical space is used
  const yScale = scaleLinear()
    .domain([0, maxStageTotal])
    .range([0, (innerHeight / 2) * flowExpansion])

  // Generate intermediate points for smoother curves
  const generateIntermediatePoints = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    segments: number = 3
  ): [number, number][] => {
    const points: [number, number][] = []
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      // Use ease-in-out for natural flow
      const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      points.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * easeT])
    }
    return points
  }

  // Generate flowing area paths for each series
  const areaPaths = React.useMemo(() => {
    const paths: {
      topPath: string
      bottomPath: string
      color: string
      seriesIndex: number
    }[] = []

    // Calculate heights at each stage for each series
    const seriesHeights: number[][] = []
    for (let stageIndex = 0; stageIndex < stageCount; stageIndex++) {
      const heights: number[] = []
      for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
        const value = series[seriesIndex].values[stageIndex] || 0
        const height = Math.max(
          yScale(value) * animationProgress,
          minFlowHeight * animationProgress
        )
        heights.push(height)
      }
      seriesHeights.push(heights)
    }

    // Calculate cumulative offsets at each stage
    const cumulativeOffsets: number[][] = []
    for (let stageIndex = 0; stageIndex < stageCount; stageIndex++) {
      const offsets: number[] = [0]
      let cumulative = 0
      for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
        cumulative += seriesHeights[stageIndex][seriesIndex]
        offsets.push(cumulative)
      }
      cumulativeOffsets.push(offsets)
    }

    // Create area path for each series (from innermost to outermost)
    for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
      // Build points with intermediate values for smooth curves
      const topPoints: [number, number][] = []
      const bottomPoints: [number, number][] = []

      for (let stageIndex = 0; stageIndex < stageCount; stageIndex++) {
        const stageX = (stageIndex / (stageCount - 1)) * innerWidth
        const offset = cumulativeOffsets[stageIndex][seriesIndex]
        const height = seriesHeights[stageIndex][seriesIndex]

        // Top edge (above center line)
        const topY = centerY - offset - height
        // Bottom edge (below center line)
        const bottomY = centerY + offset + height

        if (stageIndex > 0) {
          // Add intermediate points for smooth transitions
          const prevStageX = ((stageIndex - 1) / (stageCount - 1)) * innerWidth
          const prevOffset = cumulativeOffsets[stageIndex - 1][seriesIndex]
          const prevHeight = seriesHeights[stageIndex - 1][seriesIndex]
          const prevTopY = centerY - prevOffset - prevHeight
          const prevBottomY = centerY + prevOffset + prevHeight

          const intermediateTop = generateIntermediatePoints(
            prevStageX,
            prevTopY,
            stageX,
            topY,
            4
          )
          const intermediateBottom = generateIntermediatePoints(
            prevStageX,
            prevBottomY,
            stageX,
            bottomY,
            4
          )

          // Skip first point to avoid duplication
          topPoints.push(...intermediateTop.slice(1))
          bottomPoints.push(...intermediateBottom.slice(1))
        } else {
          topPoints.push([stageX, topY])
          bottomPoints.push([stageX, bottomY])
        }
      }

      // Create SVG path using D3 area
      const areaGenerator = area<[number, number]>()
        .x((d) => d[0])
        .y0((_, i) => bottomPoints[i]?.[1] ?? centerY)
        .y1((d) => d[1])
        .curve(curveBasis)

      const pathData = areaGenerator(topPoints)

      if (pathData) {
        paths.push({
          topPath: pathData,
          bottomPath: pathData, // Same path works due to y0/y1
          color: getColor(seriesIndex),
          seriesIndex,
        })
      }
    }

    // Reverse so innermost (first series) is rendered last (on top visually matches images)
    return paths.reverse()
  }, [
    series,
    seriesCount,
    stageCount,
    innerWidth,
    centerY,
    yScale,
    animationProgress,
    minFlowHeight,
    flowExpansion,
    colorScheme,
  ])

  // Calculate stage X positions
  const stagePositions = React.useMemo(() => {
    return stages.map((_, i) => (i / (stageCount - 1)) * innerWidth)
  }, [stages, stageCount, innerWidth])

  // Calculate values to display in pills (top and bottom at each stage)
  const pillData = React.useMemo(() => {
    return stages.map((_, stageIndex) => {
      // Get values sorted by their position (outer to inner for display)
      const stageValues = series.map((s, i) => ({
        value: s.values[stageIndex] || 0,
        seriesIndex: i,
      }))

      // Top half shows first half of series, bottom shows second half
      const midPoint = Math.ceil(seriesCount / 2)
      const topSeries = stageValues.slice(0, midPoint)
      const bottomSeries = stageValues.slice(midPoint)

      return {
        x: stagePositions[stageIndex],
        topValue: topSeries.reduce((sum, s) => sum + s.value, 0),
        bottomValue: bottomSeries.reduce((sum, s) => sum + s.value, 0),
        totalValue: stageValues.reduce((sum, s) => sum + s.value, 0),
      }
    })
  }, [series, seriesCount, stages, stagePositions])

  // Handle mouse move for tooltip
  const handleMouseMove = (e: React.MouseEvent, seriesIndex: number) => {
    if (!showTooltip) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      // Determine which stage we're over
      const relativeX = e.clientX - rect.left - margin.left
      const stageIndex = Math.round((relativeX / innerWidth) * (stageCount - 1))
      setTooltipData({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        seriesIndex,
        stageIndex: Math.max(0, Math.min(stageCount - 1, stageIndex)),
      })
    }
  }

  return (
    <ChartContainer
      config={config}
      className={cn("!aspect-auto flex-col", className)}
    >
      <div className="relative mx-auto w-full max-w-[400px]">
        <div
          ref={containerRef}
          className="relative w-full"
          style={{ aspectRatio: `${width}/${height}` }}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-full w-full overflow-visible"
          >
            {/* Gradient definitions for each series */}
            <defs>
              {series.map((_, i) => {
                const color = getColor(i)
                return (
                  <linearGradient
                    key={i}
                    id={`flow-gradient-${gradientId}-${i}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="50%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                )
              })}
              {/* Drop shadow filter */}
              <filter
                id={`pill-shadow-${gradientId}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="2"
                  floodOpacity="0.15"
                />
              </filter>
            </defs>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Background fade for depth effect */}
              <rect
                x={0}
                y={0}
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
              />

              {/* Flowing area paths - rendered from outermost to innermost */}
              {areaPaths.map(({ topPath, color, seriesIndex }, i) => (
                <path
                  key={i}
                  d={topPath}
                  fill={`url(#flow-gradient-${gradientId}-${seriesIndex})`}
                  className={cn(
                    "cursor-pointer transition-opacity duration-200",
                    hoveredSeries !== null &&
                      hoveredSeries !== seriesIndex &&
                      "opacity-30"
                  )}
                  onMouseEnter={() => setHoveredSeries(seriesIndex)}
                  onMouseMove={(e) => handleMouseMove(e, seriesIndex)}
                  onMouseLeave={() => {
                    setHoveredSeries(null)
                    setTooltipData(null)
                  }}
                  onClick={() => {
                    if (tooltipData) {
                      onSeriesClick?.(
                        series[seriesIndex],
                        tooltipData.stageIndex
                      )
                    }
                  }}
                />
              ))}

              {/* Stage markers (vertical lines) - only between stages, not at edges */}
              {showStageMarkers &&
                stagePositions
                  .slice(1, -1)
                  .map((x, i) => (
                    <line
                      key={i}
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={innerHeight}
                      stroke="white"
                      strokeWidth={3}
                      strokeOpacity={0.9}
                      className="pointer-events-none"
                    />
                  ))}

              {/* Value pills */}
              {showValuePills &&
                animationProgress > 0.6 &&
                pillData.map(({ x, topValue, bottomValue, totalValue }, i) => (
                  <g
                    key={i}
                    style={{
                      opacity: Math.min(1, (animationProgress - 0.6) * 2.5),
                    }}
                  >
                    {/* Top pill */}
                    {(pillPosition === "top" || pillPosition === "both") &&
                      topValue > 0 && (
                        <g transform={`translate(${x}, -25)`}>
                          <rect
                            x={-40}
                            y={-14}
                            width={80}
                            height={28}
                            rx={14}
                            fill="white"
                            filter={`url(#pill-shadow-${gradientId})`}
                          />
                          <text
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-sm font-semibold"
                            fill="#374151"
                          >
                            {valueFormatter(topValue)}
                          </text>
                        </g>
                      )}

                    {/* Bottom pill */}
                    {(pillPosition === "bottom" || pillPosition === "both") &&
                      bottomValue > 0 && (
                        <g transform={`translate(${x}, ${innerHeight + 25})`}>
                          <rect
                            x={-40}
                            y={-14}
                            width={80}
                            height={28}
                            rx={14}
                            fill="white"
                            filter={`url(#pill-shadow-${gradientId})`}
                          />
                          <text
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-sm font-semibold"
                            fill="#374151"
                          >
                            {valueFormatter(bottomValue)}
                          </text>
                        </g>
                      )}

                    {/* Center pill - shows total */}
                    {pillPosition === "center" && (
                      <g transform={`translate(${x}, ${centerY})`}>
                        <rect
                          x={-40}
                          y={-14}
                          width={80}
                          height={28}
                          rx={14}
                          fill="white"
                          filter={`url(#pill-shadow-${gradientId})`}
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-sm font-semibold"
                          fill="#374151"
                        >
                          {valueFormatter(totalValue)}
                        </text>
                      </g>
                    )}
                  </g>
                ))}
            </g>
          </svg>

          {/* Tooltip */}
          {showTooltip && tooltipData && (
            <div
              className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full"
              style={{
                left: tooltipData.x,
                top: tooltipData.y - 10,
              }}
            >
              <div className="bg-popover text-popover-foreground rounded-lg border px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor: getColor(tooltipData.seriesIndex),
                    }}
                  />
                  <span className="font-medium">
                    {series[tooltipData.seriesIndex]?.name}
                  </span>
                </div>
                <div className="mt-1 text-sm">
                  <span className="text-muted-foreground">Stage: </span>
                  <span className="font-medium">
                    {stages[tooltipData.stageIndex]}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Value: </span>
                  <span className="font-semibold">
                    {valueFormatter(
                      series[tooltipData.seriesIndex]?.values[
                        tooltipData.stageIndex
                      ] || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChartContainer>
  )
}
