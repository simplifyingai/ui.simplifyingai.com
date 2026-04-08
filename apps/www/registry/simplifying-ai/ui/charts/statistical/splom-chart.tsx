"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface SplomDataPoint {
  id: string
  values: Record<string, number>
  group?: string
}

export interface SplomChartProps {
  data: SplomDataPoint[]
  dimensions: string[]
  className?: string
  /** Visual style variant: standard (full matrix), upper (triangle), compact (smaller cells) */
  variant?: "standard" | "upper" | "compact"
  /** Size of each cell in pixels (auto-adjusted for compact variant) */
  cellSize?: number
  /** Radius of scatter points */
  pointRadius?: number
  /** Show dimension labels on axes */
  showLabels?: boolean
  /** Show histograms on diagonal (standard/upper variants only) */
  showHistograms?: boolean
  /** Number of histogram bins */
  histogramBins?: number
  /** Single color for all points */
  color?: string
  /** Color scheme for groups (when using group property) */
  colorScheme?: string[]
  /** Custom value formatter */
  valueFormatter?: (value: number) => string
}

const DEFAULT_COLOR = "var(--chart-1)"

const DEFAULT_COLOR_SCHEME = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function SplomChart({
  data,
  dimensions,
  className,
  variant = "standard",
  cellSize: propCellSize,
  pointRadius: propPointRadius,
  showLabels = true,
  showHistograms: propShowHistograms,
  histogramBins = 10,
  color,
  colorScheme = DEFAULT_COLOR_SCHEME,
  valueFormatter = (v) => v.toFixed(1),
}: SplomChartProps) {
  const [hoveredPoint, setHoveredPoint] = React.useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Variant-specific defaults
  const getVariantDefaults = () => {
    switch (variant) {
      case "compact":
        return { cellSize: 60, pointRadius: 2, showHistograms: false }
      case "upper":
        return { cellSize: 100, pointRadius: 3, showHistograms: true }
      case "standard":
      default:
        return { cellSize: 100, pointRadius: 3, showHistograms: true }
    }
  }

  const defaults = getVariantDefaults()
  const cellSize = propCellSize ?? defaults.cellSize
  const pointRadius = propPointRadius ?? defaults.pointRadius
  const showHistograms = propShowHistograms ?? defaults.showHistograms

  const n = dimensions.length
  const cellPadding = variant === "compact" ? 8 : 15
  const margin = { top: 20, right: 20, bottom: 30, left: 50 }
  const matrixSize = n * cellSize
  const width = matrixSize + margin.left + margin.right
  const height = matrixSize + margin.top + margin.bottom

  // Get unique groups
  const groups = React.useMemo(() => {
    return [...new Set(data.map((d) => d.group ?? "default"))]
  }, [data])

  const getColor = (group?: string) => {
    if (color) return color
    if (groups.length === 1) return DEFAULT_COLOR
    const index = groups.indexOf(group ?? "default")
    return colorScheme[index % colorScheme.length]
  }

  // Create scales for each dimension
  const scales = React.useMemo(() => {
    const result: Record<
      string,
      ReturnType<typeof scaleLinear<number, number>>
    > = {}

    dimensions.forEach((dim) => {
      const values = data
        .map((d) => d.values[dim])
        .filter((v) => v !== undefined)
      const min = Math.min(...values)
      const max = Math.max(...values)
      const pad = (max - min) * 0.1 || 1

      result[dim] = scaleLinear()
        .domain([min - pad, max + pad])
        .range([cellPadding, cellSize - cellPadding])
    })

    return result
  }, [data, dimensions, cellSize])

  // Generate histogram data for diagonal cells
  const getHistogramData = (dim: string) => {
    const values = data.map((d) => d.values[dim]).filter((v) => v !== undefined)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binWidth = (max - min) / histogramBins

    const bins = Array(histogramBins).fill(0) as number[]
    values.forEach((v) => {
      const binIndex = Math.min(
        Math.floor((v - min) / binWidth),
        histogramBins - 1
      )
      bins[binIndex]++
    })

    const maxBinCount = Math.max(...bins)
    return { bins, min, max, binWidth, maxBinCount }
  }

  // Determine if cell should be rendered based on variant
  const shouldRenderCell = (row: number, col: number): boolean => {
    if (variant === "upper") return col > row
    return true // standard and compact render all cells
  }

  // Determine if diagonal should be rendered
  const shouldRenderDiagonal = (): boolean => {
    return true // All variants render diagonal
  }

  const handleMouseMove = (e: React.MouseEvent, pointId: string) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setHoveredPoint(pointId)
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex h-[400px] items-center justify-center",
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
      {groups.length > 1 && !color && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {groups.map((group) => (
            <div key={group} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getColor(group) }}
              />
              <span className="text-muted-foreground text-sm">{group}</span>
            </div>
          ))}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Matrix cells */}
          {dimensions.map((yDim, row) =>
            dimensions.map((xDim, col) => {
              const x = col * cellSize
              const y = row * cellSize

              // Skip cells based on variant
              if (!shouldRenderCell(row, col) && row !== col) return null

              // Diagonal: histogram or label
              if (row === col) {
                if (!shouldRenderDiagonal()) return null

                if (showHistograms) {
                  const { bins, maxBinCount } = getHistogramData(xDim)
                  const barWidth = (cellSize - 2 * cellPadding) / bins.length
                  const heightScale =
                    maxBinCount > 0
                      ? (cellSize - 2 * cellPadding) / maxBinCount
                      : 0

                  return (
                    <g
                      key={`${row}-${col}`}
                      transform={`translate(${x}, ${y})`}
                    >
                      {/* Cell background */}
                      <rect
                        x={0}
                        y={0}
                        width={cellSize}
                        height={cellSize}
                        fill="#f8fafc"
                        stroke="#e2e8f0"
                        strokeWidth={1}
                        className="dark:fill-zinc-900 dark:stroke-zinc-700"
                      />
                      {/* Histogram bars */}
                      {bins.map((count, i) => (
                        <rect
                          key={i}
                          x={cellPadding + i * barWidth + 1}
                          y={cellSize - cellPadding - count * heightScale}
                          width={Math.max(0, barWidth - 2)}
                          height={count * heightScale}
                          fill={color ?? DEFAULT_COLOR}
                          fillOpacity={0.5}
                        />
                      ))}
                      {/* Dimension label */}
                      <text
                        x={cellSize / 2}
                        y={cellSize / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-[10px] font-medium"
                      >
                        {xDim}
                      </text>
                    </g>
                  )
                }

                // Just label without histogram
                return (
                  <g key={`${row}-${col}`} transform={`translate(${x}, ${y})`}>
                    <rect
                      x={0}
                      y={0}
                      width={cellSize}
                      height={cellSize}
                      fill="#f8fafc"
                      stroke="#e2e8f0"
                      strokeWidth={1}
                      className="dark:fill-zinc-900 dark:stroke-zinc-700"
                    />
                    <text
                      x={cellSize / 2}
                      y={cellSize / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-xs font-medium"
                    >
                      {xDim}
                    </text>
                  </g>
                )
              }

              // Skip off-diagonal cells for upper/lower variants
              if (!shouldRenderCell(row, col)) return null

              // Off-diagonal: scatter plot
              return (
                <g key={`${row}-${col}`} transform={`translate(${x}, ${y})`}>
                  {/* Cell background */}
                  <rect
                    x={0}
                    y={0}
                    width={cellSize}
                    height={cellSize}
                    fill="white"
                    stroke="#e2e8f0"
                    strokeWidth={1}
                    className="dark:fill-zinc-950 dark:stroke-zinc-700"
                  />
                  {/* Points */}
                  {data.map((d) => {
                    const xVal = d.values[xDim]
                    const yVal = d.values[yDim]
                    if (xVal === undefined || yVal === undefined) return null

                    const cx = scales[xDim](xVal)
                    const cy = cellSize - scales[yDim](yVal) + cellPadding
                    const pointColor = getColor(d.group)
                    const isHovered = hoveredPoint === d.id

                    return (
                      <circle
                        key={d.id}
                        cx={cx}
                        cy={cy}
                        r={isHovered ? pointRadius * 1.5 : pointRadius}
                        fill={pointColor}
                        fillOpacity={
                          hoveredPoint === null ? 0.7 : isHovered ? 1 : 0.15
                        }
                        className="cursor-pointer transition-all duration-150"
                        onMouseMove={(e) => handleMouseMove(e, d.id)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    )
                  })}
                </g>
              )
            })
          )}

          {/* Row labels (left) */}
          {showLabels &&
            dimensions.map((dim, i) => (
              <text
                key={`row-${i}`}
                x={-12}
                y={i * cellSize + cellSize / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {dim}
              </text>
            ))}

          {/* Column labels (bottom) */}
          {showLabels &&
            dimensions.map((dim, i) => (
              <text
                key={`col-${i}`}
                x={i * cellSize + cellSize / 2}
                y={matrixSize + 20}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {dim}
              </text>
            ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="bg-foreground text-background pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 10 }}
        >
          <div className="mb-1 font-semibold">{hoveredPoint}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 opacity-90">
            {dimensions.map((dim) => {
              const item = data.find((d) => d.id === hoveredPoint)
              return (
                <React.Fragment key={dim}>
                  <span>{dim}:</span>
                  <span>{valueFormatter(item?.values[dim] ?? 0)}</span>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
