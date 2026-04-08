"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface BulletChartData {
  label: string
  value: number
  target: number
  ranges: [number, number, number] // [poor, satisfactory, good]
  max?: number
}

export interface BulletChartProps {
  data: BulletChartData[]
  className?: string
  /** Visual style variant: standard (horizontal), compact (smaller), vertical */
  variant?: "standard" | "compact" | "vertical"
  /** Show labels */
  showLabels?: boolean
  /** Show values */
  showValues?: boolean
  /** Show legend for range meanings */
  showLegend?: boolean
  /** Labels for ranges [poor, satisfactory, good] */
  rangeLabels?: [string, string, string]
  /** Format value for display */
  valueFormatter?: (value: number) => string
  /** Primary color for value bar */
  color?: string
  /** Target marker color */
  targetColor?: string
}

const DEFAULT_COLOR = "var(--chart-1)"
const DEFAULT_TARGET_COLOR = "var(--foreground)"

// Parse hex color to RGB values
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// Get rgba color with opacity
function getRgba(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

export function BulletChart({
  data,
  className,
  variant = "standard",
  showLabels = true,
  showValues = true,
  showLegend = false,
  rangeLabels = ["Poor", "Satisfactory", "Good"],
  valueFormatter = (value) => value.toLocaleString(),
  color = DEFAULT_COLOR,
  targetColor = DEFAULT_TARGET_COLOR,
}: BulletChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })

  const isVertical = variant === "vertical"
  const barSize = variant === "compact" ? 18 : 24
  const barSpacing = variant === "compact" ? 40 : isVertical ? 80 : 60
  const labelWidth = showLabels && !isVertical ? 100 : 0
  const valueWidth = showValues && !isVertical ? 60 : 0

  // Dimensions
  const width = isVertical ? Math.max(300, data.length * barSpacing + 80) : 500
  const height = isVertical ? 300 : data.length * barSpacing + 40

  const margin = isVertical
    ? {
        top: showValues ? 30 : 20,
        right: 20,
        bottom: showLabels ? 50 : 30,
        left: 40,
      }
    : { top: 20, right: valueWidth + 20, bottom: 20, left: labelWidth }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Range colors with proper rgba
  const rangeColors = React.useMemo(() => {
    return [getRgba(color, 0.15), getRgba(color, 0.3), getRgba(color, 0.5)]
  }, [color])

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setHoveredIndex(index)
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex h-[200px] items-center justify-center",
          className
        )}
      >
        No data available
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Legend */}
      {showLegend && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {rangeLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: rangeColors[2 - i] }}
              />
              <span className="text-muted-foreground text-sm">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-1 rounded"
              style={{ backgroundColor: targetColor }}
            />
            <span className="text-muted-foreground text-sm">Target</span>
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {data.map((d, index) => {
            const max = d.max ?? Math.max(d.ranges[2], d.target, d.value) * 1.1
            const scale = scaleLinear()
              .domain([0, max])
              .range(isVertical ? [innerHeight, 0] : [0, innerWidth])

            const isHovered = hoveredIndex === index

            if (isVertical) {
              // Vertical rendering
              const x = index * barSpacing
              return (
                <g
                  key={d.label}
                  transform={`translate(${x}, 0)`}
                  className={cn(
                    "cursor-pointer transition-opacity duration-200",
                    hoveredIndex !== null && !isHovered && "opacity-40"
                  )}
                  onMouseMove={(e) => handleMouseMove(e, index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Range backgrounds - outer (good) */}
                  <rect
                    x={0}
                    y={scale(d.ranges[2])}
                    width={barSize}
                    height={innerHeight - scale(d.ranges[2])}
                    fill={rangeColors[0]}
                    rx={3}
                    className="dark:opacity-60"
                  />
                  {/* Range - middle (satisfactory) */}
                  <rect
                    x={barSize * 0.15}
                    y={scale(d.ranges[1])}
                    width={barSize * 0.7}
                    height={innerHeight - scale(d.ranges[1])}
                    fill={rangeColors[1]}
                    rx={2}
                    className="dark:opacity-70"
                  />
                  {/* Range - inner (poor) */}
                  <rect
                    x={barSize * 0.3}
                    y={scale(d.ranges[0])}
                    width={barSize * 0.4}
                    height={innerHeight - scale(d.ranges[0])}
                    fill={rangeColors[2]}
                    rx={2}
                    className="dark:opacity-80"
                  />

                  {/* Value bar */}
                  <rect
                    x={barSize * 0.35}
                    y={scale(d.value)}
                    width={barSize * 0.3}
                    height={innerHeight - scale(d.value)}
                    fill={color}
                    rx={2}
                    className={cn(
                      "transition-all duration-150",
                      isHovered && "brightness-110"
                    )}
                  />

                  {/* Target marker */}
                  <line
                    x1={barSize * 0.1}
                    x2={barSize * 0.9}
                    y1={scale(d.target)}
                    y2={scale(d.target)}
                    stroke={targetColor}
                    strokeWidth={3}
                    className="dark:stroke-zinc-300"
                  />

                  {/* Label */}
                  {showLabels && (
                    <text
                      x={barSize / 2}
                      y={innerHeight + 20}
                      textAnchor="middle"
                      className="fill-foreground text-xs font-medium"
                    >
                      {d.label}
                    </text>
                  )}

                  {/* Value */}
                  {showValues && (
                    <text
                      x={barSize / 2}
                      y={-10}
                      textAnchor="middle"
                      className="fill-muted-foreground text-xs"
                    >
                      {valueFormatter(d.value)}
                    </text>
                  )}
                </g>
              )
            }

            // Horizontal rendering
            const y = index * barSpacing
            return (
              <g
                key={d.label}
                transform={`translate(0, ${y})`}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hoveredIndex !== null && !isHovered && "opacity-40"
                )}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Range backgrounds - outer (good) */}
                <rect
                  x={0}
                  y={0}
                  width={scale(d.ranges[2])}
                  height={barSize}
                  fill={rangeColors[0]}
                  rx={3}
                  className="dark:opacity-60"
                />
                {/* Range - middle (satisfactory) */}
                <rect
                  x={0}
                  y={barSize * 0.15}
                  width={scale(d.ranges[1])}
                  height={barSize * 0.7}
                  fill={rangeColors[1]}
                  rx={2}
                  className="dark:opacity-70"
                />
                {/* Range - inner (poor) */}
                <rect
                  x={0}
                  y={barSize * 0.3}
                  width={scale(d.ranges[0])}
                  height={barSize * 0.4}
                  fill={rangeColors[2]}
                  rx={2}
                  className="dark:opacity-80"
                />

                {/* Value bar */}
                <rect
                  x={0}
                  y={barSize * 0.35}
                  width={scale(d.value)}
                  height={barSize * 0.3}
                  fill={color}
                  rx={2}
                  className={cn(
                    "transition-all duration-150",
                    isHovered && "brightness-110"
                  )}
                />

                {/* Target marker */}
                <line
                  x1={scale(d.target)}
                  x2={scale(d.target)}
                  y1={barSize * 0.1}
                  y2={barSize * 0.9}
                  stroke={targetColor}
                  strokeWidth={variant === "compact" ? 2 : 3}
                  className="dark:stroke-zinc-300"
                />

                {/* Label */}
                {showLabels && (
                  <text
                    x={-10}
                    y={barSize / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-foreground text-sm font-medium"
                  >
                    {d.label}
                  </text>
                )}

                {/* Value */}
                {showValues && (
                  <text
                    x={innerWidth + 10}
                    y={barSize / 2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-sm"
                  >
                    {valueFormatter(d.value)}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Mouse-following Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="bg-foreground text-background pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 10 }}
        >
          <div className="mb-1 font-semibold">{data[hoveredIndex].label}</div>
          <div className="space-y-0.5 opacity-90">
            <div>Value: {valueFormatter(data[hoveredIndex].value)}</div>
            <div>Target: {valueFormatter(data[hoveredIndex].target)}</div>
            <div>
              {data[hoveredIndex].value >= data[hoveredIndex].target
                ? "Above target"
                : "Below target"}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
