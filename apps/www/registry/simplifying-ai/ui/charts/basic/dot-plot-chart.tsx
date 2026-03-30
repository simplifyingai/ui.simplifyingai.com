"use client"

import * as React from "react"
import { bin, extent, max } from "d3-array"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface DotPlotDataPoint {
  value: number
  color?: string
}

export interface DotPlotChartProps {
  data: DotPlotDataPoint[] | number[]
  className?: string
  dotSize?: number
  dotSpacing?: number
  showGrid?: boolean
  showXAxis?: boolean
  xAxisLabel?: string
  binCount?: number
  color?: string
  valueFormatter?: (value: number) => string
}

export function DotPlotChart({
  data,
  className,
  dotSize = 8,
  dotSpacing = 2,
  showGrid = true,
  showXAxis = true,
  xAxisLabel,
  binCount = 20,
  color = "#2563eb",
  valueFormatter = (value) => value.toLocaleString(),
}: DotPlotChartProps) {
  const [hoveredBin, setHoveredBin] = React.useState<number | null>(null)

  // Normalize data to array of values
  const values = React.useMemo(() => {
    return data.map((d) => (typeof d === "number" ? d : d.value))
  }, [data])

  // Get colors if provided
  const colors = React.useMemo(() => {
    return data.map((d) => (typeof d === "number" ? color : d.color ?? color))
  }, [data, color])

  const width = 500
  const margin = { top: 20, right: 20, bottom: xAxisLabel ? 60 : 40, left: 20 }

  const innerWidth = width - margin.left - margin.right

  // Create bins
  const binnedData = React.useMemo(() => {
    const [minVal, maxVal] = extent(values) as [number, number]
    const binGenerator = bin()
      .domain([minVal, maxVal])
      .thresholds(binCount)

    const bins = binGenerator(values)

    // For each bin, track individual dots with their colors
    return bins.map((b) => {
      const dots: { value: number; color: string }[] = []
      b.forEach((val) => {
        // Find the actual index considering duplicates
        let foundCount = 0
        for (let i = 0; i < values.length; i++) {
          if (values[i] === val) {
            if (foundCount === dots.filter((d) => d.value === val).length) {
              dots.push({ value: val, color: colors[i] })
              break
            }
            foundCount++
          }
        }
      })
      return {
        x0: b.x0 ?? minVal,
        x1: b.x1 ?? maxVal,
        count: b.length,
        dots,
      }
    })
  }, [values, colors, binCount])

  // Calculate max stack height
  const maxCount = max(binnedData, (d) => d.count) ?? 0

  // Dynamic height based on max stack
  const dotTotalSize = dotSize + dotSpacing
  const innerHeight = Math.max(maxCount * dotTotalSize + 20, 100)
  const height = innerHeight + margin.top + margin.bottom

  // Scales
  const xScale = React.useMemo(() => {
    const [minVal, maxVal] = extent(values) as [number, number]
    const padding = (maxVal - minVal) * 0.05
    return scaleLinear()
      .domain([minVal - padding, maxVal + padding])
      .range([0, innerWidth])
      .nice()
  }, [values, innerWidth])

  const xTicks = xScale.ticks(7)

  // Calculate tooltip position as percentage
  const getTooltipPosition = (binIndex: number) => {
    const bin = binnedData[binIndex]
    const binCenter = (bin.x0 + bin.x1) / 2
    const xPos = margin.left + xScale(binCenter)
    const yPos = margin.top + innerHeight - bin.count * dotTotalSize - 8
    return {
      left: `${(xPos / width) * 100}%`,
      top: `${(yPos / height) * 100}%`,
    }
  }

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {showGrid &&
            xTicks.map((tick) => (
              <line
                key={tick}
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={innerHeight}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />
            ))}

          {/* Baseline */}
          <line
            x1={0}
            x2={innerWidth}
            y1={innerHeight}
            y2={innerHeight}
            stroke="hsl(var(--border))"
          />

          {/* Dots stacked from bottom */}
          {binnedData.map((binData, binIndex) => {
            const binCenter = (binData.x0 + binData.x1) / 2
            const cx = xScale(binCenter)
            const isHovered = hoveredBin === binIndex

            return (
              <g key={binIndex}>
                {binData.dots.map((dot, dotIndex) => {
                  const cy = innerHeight - (dotIndex + 0.5) * dotTotalSize

                  return (
                    <circle
                      key={dotIndex}
                      cx={cx}
                      cy={cy}
                      r={dotSize / 2}
                      fill={dot.color}
                      className={cn(
                        "cursor-pointer transition-opacity duration-200",
                        hoveredBin !== null && !isHovered && "opacity-40"
                      )}
                      onMouseEnter={() => setHoveredBin(binIndex)}
                      onMouseLeave={() => setHoveredBin(null)}
                    />
                  )
                })}
              </g>
            )
          })}

          {/* X-axis labels */}
          {showXAxis &&
            xTicks.map((tick) => (
              <text
                key={`tick-${tick}`}
                x={xScale(tick)}
                y={innerHeight + 20}
                textAnchor="middle"
                className="fill-muted-foreground text-xs"
              >
                {valueFormatter(tick)}
              </text>
            ))}

          {/* X-axis label */}
          {xAxisLabel && (
            <text
              x={innerWidth / 2}
              y={innerHeight + 45}
              textAnchor="middle"
              className="fill-foreground text-sm font-medium"
            >
              {xAxisLabel}
            </text>
          )}
        </g>
      </svg>

      {/* HTML Tooltip */}
      {hoveredBin !== null && binnedData[hoveredBin] && (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full"
          style={getTooltipPosition(hoveredBin)}
        >
          <div className="bg-foreground text-background rounded-md px-2 py-1 text-xs font-medium shadow-lg">
            {Math.round(binnedData[hoveredBin].x0)}-{Math.round(binnedData[hoveredBin].x1)}: {binnedData[hoveredBin].count}
          </div>
        </div>
      )}
    </div>
  )
}
