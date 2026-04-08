"use client"

import * as React from "react"
import { interpolate } from "d3-interpolate"
import { arc, pie, type PieArcDatum } from "d3-shape"

import { cn } from "@/lib/utils"

import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"

export interface DonutChartDataPoint {
  label: string
  value: number
  color?: string
  [key: string]: unknown
}

export interface DonutChartProps extends BaseChartProps {
  data: DonutChartDataPoint[]
  /** Inner radius as ratio (0-1) of outer radius. 0.6 = 60% hollow */
  innerRadius?: number
  /** Padding angle between segments in radians */
  padAngle?: number
  /** Corner radius for rounded segments */
  cornerRadius?: number
  /** Starting angle in radians (0 = top) */
  startAngle?: number
  /** Ending angle in radians */
  endAngle?: number
  /** Sort segments by value */
  sortValues?: boolean
  /** Show percentage labels on segments */
  showLabels?: boolean
  /** Show label lines for small segments */
  showLabelLines?: boolean
  /** Minimum angle (radians) to show inline label */
  minLabelAngle?: number
  /** Center text (top line) */
  centerLabel?: React.ReactNode
  /** Center value (large text) */
  centerValue?: React.ReactNode
  /** Animate on mount */
  animate?: boolean
  /** Animation duration in ms */
  animationDuration?: number
  /** Active/selected segment index */
  activeIndex?: number
  /** Callback when segment is clicked */
  onSegmentClick?: (data: DonutChartDataPoint, index: number) => void
  /** Value formatter for tooltip and labels */
  valueFormatter?: (value: number, total: number) => string
  /** Show total in center when nothing hovered */
  showTotal?: boolean
  /** Variant style */
  variant?: "default" | "gradient" | "separated"
}

// Default colors
const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function DonutChart({
  data,
  config,
  className,
  width = 400,
  height = 400,
  margin = { top: 40, right: 40, bottom: 40, left: 40 },
  showTooltip = true,
  showLegend = true,
  innerRadius: innerRadiusRatio = 0.6,
  padAngle = 0.02,
  cornerRadius = 4,
  startAngle = -Math.PI / 2,
  endAngle = Math.PI * 1.5,
  sortValues = false,
  showLabels = false,
  showLabelLines = true,
  minLabelAngle = 0.4,
  centerLabel,
  centerValue,
  animate = true,
  animationDuration = 750,
  activeIndex: controlledActiveIndex,
  onSegmentClick,
  valueFormatter = (value, total) => `${((value / total) * 100).toFixed(1)}%`,
  showTotal = true,
  variant = "default",
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [animationProgress, setAnimationProgress] = React.useState(
    animate ? 0 : 1
  )
  const [tooltipData, setTooltipData] = React.useState<{
    x: number
    y: number
    data: DonutChartDataPoint
    index: number
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

      if (progress < 1) {
        requestAnimationFrame(animateFrame)
      }
    }
    requestAnimationFrame(animateFrame)
  }, [animate, animationDuration])

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const outerRadius = Math.min(innerWidth, innerHeight) / 2
  const innerRadius = outerRadius * Math.max(0, Math.min(1, innerRadiusRatio))

  // Calculate total
  const total = data.reduce((sum, d) => sum + d.value, 0)

  // Active index (controlled or hovered)
  const activeIndex = controlledActiveIndex ?? hoveredIndex

  // Create pie generator
  const pieGenerator = React.useMemo(() => {
    const gen = pie<DonutChartDataPoint>()
      .value((d) => d.value)
      .padAngle(variant === "separated" ? 0.06 : padAngle)
      .startAngle(startAngle)
      .endAngle(interpolate(startAngle, endAngle)(animationProgress))

    if (sortValues) {
      return gen.sort((a, b) => b.value - a.value)
    }
    return gen.sort(null)
  }, [variant, padAngle, startAngle, endAngle, animationProgress, sortValues])

  // Arc datum type
  type ArcDatum = PieArcDatum<DonutChartDataPoint>

  // Create arc generators
  const arcGenerator = arc<ArcDatum>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(cornerRadius)

  // Hover arc (slightly larger)
  const hoverArcGenerator = arc<ArcDatum>()
    .innerRadius(innerRadius - 4)
    .outerRadius(outerRadius + 8)
    .cornerRadius(cornerRadius)

  // Label arc (for positioning)
  const labelArcGenerator = arc<ArcDatum>()
    .innerRadius(outerRadius + 15)
    .outerRadius(outerRadius + 15)

  const arcs = pieGenerator(data)

  // Get color for segment
  const getColor = (d: DonutChartDataPoint, index: number): string => {
    if (d.color) return d.color
    const configColor = config?.[d.label]?.color
    if (configColor) return configColor
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }

  // Handle mouse events
  const handleMouseMove = (
    e: React.MouseEvent,
    data: DonutChartDataPoint,
    index: number
  ) => {
    if (!showTooltip) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipData({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        data,
        index,
      })
    }
  }

  // Determine if label should be outside
  const shouldShowOutsideLabel = (
    arcData: ReturnType<typeof pieGenerator>[number]
  ) => {
    const angle = arcData.endAngle - arcData.startAngle
    return showLabels && showLabelLines && angle < minLabelAngle && angle > 0.1
  }

  // Center content
  const displayedCenterValue =
    activeIndex !== null
      ? valueFormatter(data[activeIndex].value, total)
      : (centerValue ?? (showTotal ? total.toLocaleString() : null))

  const displayedCenterLabel =
    activeIndex !== null
      ? data[activeIndex].label
      : (centerLabel ?? (showTotal ? "Total" : null))

  return (
    <ChartContainer
      config={config}
      className={cn("relative !aspect-auto flex-col", className)}
    >
      <div
        ref={containerRef}
        className="relative mx-auto aspect-square w-full max-w-[280px]"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
        >
          {/* Gradient definitions */}
          {variant === "gradient" && (
            <defs>
              {data.map((d, i) => {
                const color = getColor(d, i)
                return (
                  <linearGradient
                    key={i}
                    id={`gradient-${gradientId}-${i}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                  </linearGradient>
                )
              })}
            </defs>
          )}

          <g
            transform={`translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight / 2})`}
          >
            {/* Background ring */}
            <circle
              r={(outerRadius + innerRadius) / 2}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={outerRadius - innerRadius}
              strokeOpacity={0.15}
            />

            {/* Donut segments */}
            {arcs.map((arcData, index) => {
              const isActive = activeIndex === index
              const d = data[index]
              const color = getColor(d, index)
              const fill =
                variant === "gradient"
                  ? `url(#gradient-${gradientId}-${index})`
                  : color

              return (
                <g key={index}>
                  {/* Shadow for active segment */}
                  {isActive && (
                    <path
                      d={hoverArcGenerator(arcData) ?? ""}
                      fill="black"
                      fillOpacity={0.1}
                      filter="blur(8px)"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Main segment */}
                  <path
                    d={
                      (isActive ? hoverArcGenerator : arcGenerator)(arcData) ??
                      ""
                    }
                    fill={fill}
                    stroke={
                      variant === "separated"
                        ? "hsl(var(--background))"
                        : "none"
                    }
                    strokeWidth={variant === "separated" ? 3 : 0}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      activeIndex !== null && !isActive && "opacity-50"
                    )}
                    style={{
                      filter: isActive ? "brightness(1.1)" : undefined,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseMove={(e) => handleMouseMove(e, d, index)}
                    onMouseLeave={() => {
                      setHoveredIndex(null)
                      setTooltipData(null)
                    }}
                    onClick={() => onSegmentClick?.(d, index)}
                  />

                  {/* Inline labels for large segments */}
                  {showLabels &&
                    arcData.endAngle - arcData.startAngle >= minLabelAngle && (
                      <text
                        transform={`translate(${arcGenerator.centroid(arcData)})`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none text-[11px] font-semibold"
                        fill="white"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                      >
                        {valueFormatter(d.value, total)}
                      </text>
                    )}

                  {/* Outside labels with lines for small segments */}
                  {shouldShowOutsideLabel(arcData) && (
                    <g className="pointer-events-none">
                      <polyline
                        points={(() => {
                          const posA = arcGenerator.centroid(arcData)
                          const posB = labelArcGenerator.centroid(arcData)
                          const midAngle =
                            (arcData.startAngle + arcData.endAngle) / 2
                          const posC = [
                            posB[0] + (midAngle < Math.PI ? 10 : -10),
                            posB[1],
                          ]
                          return `${posA[0]},${posA[1]} ${posB[0]},${posB[1]} ${posC[0]},${posC[1]}`
                        })()}
                        fill="none"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={1}
                        strokeOpacity={0.5}
                      />
                      <text
                        transform={`translate(${labelArcGenerator.centroid(arcData)})`}
                        textAnchor={
                          (arcData.startAngle + arcData.endAngle) / 2 < Math.PI
                            ? "start"
                            : "end"
                        }
                        dx={
                          (arcData.startAngle + arcData.endAngle) / 2 < Math.PI
                            ? 15
                            : -15
                        }
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-[10px]"
                      >
                        {d.label}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* Center content */}
            <g className="pointer-events-none">
              {displayedCenterValue && (
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  y={displayedCenterLabel ? -6 : 0}
                  className="fill-foreground text-2xl font-bold"
                  style={{ fontSize: innerRadius * 0.35 }}
                >
                  {displayedCenterValue}
                </text>
              )}
              {displayedCenterLabel && (
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  y={displayedCenterValue ? innerRadius * 0.2 : 0}
                  className="fill-muted-foreground text-sm"
                  style={{ fontSize: innerRadius * 0.15 }}
                >
                  {displayedCenterLabel}
                </text>
              )}
            </g>
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
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: getColor(
                      tooltipData.data,
                      tooltipData.index
                    ),
                  }}
                />
                <span className="font-medium">{tooltipData.data.label}</span>
              </div>
              <div className="mt-1 text-sm">
                <span className="text-muted-foreground">Value: </span>
                <span className="font-semibold">
                  {tooltipData.data.value.toLocaleString()}
                </span>
                <span className="text-muted-foreground ml-2">
                  ({valueFormatter(tooltipData.data.value, total)})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        {showLegend && (
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {data.map((d, i) => (
              <button
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-all",
                  "hover:bg-muted/50",
                  activeIndex === i && "bg-muted"
                )}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSegmentClick?.(d, i)}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getColor(d, i) }}
                />
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium">
                  {valueFormatter(d.value, total)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </ChartContainer>
  )
}
