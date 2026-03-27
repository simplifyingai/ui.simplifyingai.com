"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface SplomDataPoint {
  id: string
  values: Record<string, number>
  group?: string
  color?: string
}

export interface SplomChartProps {
  data: SplomDataPoint[]
  dimensions: string[]
  className?: string
  cellSize?: number
  pointRadius?: number
  showLabels?: boolean
  showHistograms?: boolean
  colorScheme?: string[]
}

export function SplomChart({
  data,
  dimensions,
  className,
  cellSize = 100,
  pointRadius = 2.5,
  showLabels = true,
  showHistograms = true,
  colorScheme = ["#1e40af", "#dc2626", "#059669", "#d97706", "#7c3aed"],
}: SplomChartProps) {
  const [hoveredPoint, setHoveredPoint] = React.useState<string | null>(null)

  const n = dimensions.length
  const padding = 20
  const labelSize = showLabels ? 30 : 0
  const width = n * cellSize + labelSize
  const height = n * cellSize + labelSize

  // Get unique groups
  const groups = React.useMemo(() => {
    return [...new Set(data.map((d) => d.group ?? "default"))]
  }, [data])

  const getGroupColor = (group?: string) => {
    const index = groups.indexOf(group ?? "default")
    return colorScheme[index % colorScheme.length]
  }

  // Create scales for each dimension
  const scales = React.useMemo(() => {
    const result: Record<string, ReturnType<typeof scaleLinear<number, number>>> = {}

    dimensions.forEach((dim) => {
      const values = data.map((d) => d.values[dim]).filter((v) => v !== undefined)
      const min = Math.min(...values)
      const max = Math.max(...values)
      const pad = (max - min) * 0.1 || 1

      result[dim] = scaleLinear()
        .domain([min - pad, max + pad])
        .range([padding, cellSize - padding])
    })

    return result
  }, [data, dimensions, cellSize])

  // Generate histogram data for diagonal cells
  const getHistogramBins = (dim: string, binCount = 10) => {
    const values = data.map((d) => d.values[dim]).filter((v) => v !== undefined)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binWidth = (max - min) / binCount

    const bins = Array(binCount).fill(0)
    values.forEach((v) => {
      const binIndex = Math.min(Math.floor((v - min) / binWidth), binCount - 1)
      bins[binIndex]++
    })

    const maxBinCount = Math.max(...bins)
    return { bins, min, max, binWidth, maxBinCount }
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Matrix cells */}
        {dimensions.map((yDim, row) => (
          dimensions.map((xDim, col) => {
            const x = col * cellSize + labelSize
            const y = row * cellSize

            // Diagonal: histogram
            if (row === col && showHistograms) {
              const { bins, binWidth, min, maxBinCount } = getHistogramBins(xDim)
              const barWidth = (cellSize - 2 * padding) / bins.length
              const heightScale = (cellSize - 2 * padding) / maxBinCount

              return (
                <g key={`${row}-${col}`} transform={`translate(${x}, ${y})`}>
                  {/* Cell background */}
                  <rect
                    x={0}
                    y={0}
                    width={cellSize}
                    height={cellSize}
                    fill="hsl(var(--muted))"
                    fillOpacity={0.3}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                  />
                  {/* Histogram bars */}
                  {bins.map((count, i) => (
                    <rect
                      key={i}
                      x={padding + i * barWidth}
                      y={cellSize - padding - count * heightScale}
                      width={barWidth - 1}
                      height={count * heightScale}
                      fill={colorScheme[0]}
                      fillOpacity={0.6}
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

            // Off-diagonal: scatter plot
            return (
              <g key={`${row}-${col}`} transform={`translate(${x}, ${y})`}>
                {/* Cell background */}
                <rect
                  x={0}
                  y={0}
                  width={cellSize}
                  height={cellSize}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                />
                {/* Points */}
                {data.map((d) => {
                  const xVal = d.values[xDim]
                  const yVal = d.values[yDim]
                  if (xVal === undefined || yVal === undefined) return null

                  const cx = scales[xDim](xVal)
                  const cy = cellSize - scales[yDim](yVal) + padding
                  const color = d.color ?? getGroupColor(d.group)
                  const isHovered = hoveredPoint === d.id

                  return (
                    <circle
                      key={d.id}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? pointRadius * 1.8 : pointRadius}
                      fill={color}
                      fillOpacity={hoveredPoint ? (isHovered ? 1 : 0.2) : 0.7}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredPoint(d.id)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  )
                })}
              </g>
            )
          })
        ))}

        {/* Row labels (left) */}
        {showLabels && dimensions.map((dim, i) => (
          <text
            key={`row-${i}`}
            x={labelSize - 5}
            y={i * cellSize + cellSize / 2}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {dim}
          </text>
        ))}

        {/* Column labels (bottom) */}
        {showLabels && dimensions.map((dim, i) => (
          <text
            key={`col-${i}`}
            x={i * cellSize + labelSize + cellSize / 2}
            y={n * cellSize + 15}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {dim}
          </text>
        ))}
      </svg>

      {/* Legend */}
      {groups.length > 1 && (
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {groups.map((group) => (
            <div key={group} className="flex items-center gap-1.5 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getGroupColor(group) }}
              />
              <span className="text-muted-foreground">{group}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {hoveredPoint && (
        <div className="mt-2 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
            <div className="font-medium">{hoveredPoint}</div>
            <div className="text-muted-foreground grid grid-cols-2 gap-x-3 text-xs">
              {dimensions.map((dim) => {
                const item = data.find((d) => d.id === hoveredPoint)
                return (
                  <React.Fragment key={dim}>
                    <span>{dim}:</span>
                    <span>{item?.values[dim]?.toFixed(2)}</span>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
