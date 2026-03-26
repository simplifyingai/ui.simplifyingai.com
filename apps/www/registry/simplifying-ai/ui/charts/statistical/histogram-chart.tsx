"use client"

import * as React from "react"
import { bin } from "d3-array"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartHorizontalGrid } from "../chart-grid"
import { ChartTooltipContent } from "../chart-tooltip"

export interface HistogramChartProps extends BaseChartProps {
  data: number[]
  bins?: number
  xAxisLabel?: string
  yAxisLabel?: string
  color?: string
  barPadding?: number
  showDensity?: boolean
  normalized?: boolean
}

export function HistogramChart({
  data,
  config,
  className,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 40, left: 50 },
  showGrid = true,
  showTooltip = true,
  bins = 20,
  xAxisLabel,
  yAxisLabel,
  color,
  barPadding = 1,
  showDensity = false,
  normalized = false,
}: HistogramChartProps) {
  const [hoveredBin, setHoveredBin] = React.useState<number | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Create histogram bins
  const histogram = React.useMemo(() => {
    const [minVal, maxVal] = [Math.min(...data), Math.max(...data)]
    const binGenerator = bin().domain([minVal, maxVal]).thresholds(bins)
    return binGenerator(data)
  }, [data, bins])

  // Calculate density if needed
  const binData = React.useMemo(() => {
    const total = data.length
    return histogram.map((b) => ({
      x0: b.x0!,
      x1: b.x1!,
      count: b.length,
      density: b.length / total / (b.x1! - b.x0!),
      percent: (b.length / total) * 100,
    }))
  }, [histogram, data.length])

  // Scales
  const xScale = React.useMemo(() => {
    return scaleLinear()
      .domain([binData[0]?.x0 ?? 0, binData[binData.length - 1]?.x1 ?? 1])
      .range([0, innerWidth])
  }, [binData, innerWidth])

  const yScale = React.useMemo(() => {
    const maxY = showDensity
      ? Math.max(...binData.map((b) => b.density))
      : normalized
        ? Math.max(...binData.map((b) => b.percent))
        : Math.max(...binData.map((b) => b.count))
    return scaleLinear()
      .domain([0, maxY * 1.1])
      .range([innerHeight, 0])
      .nice()
  }, [binData, innerHeight, showDensity, normalized])

  const barColor = color ?? config?.histogram?.color ?? "var(--chart-1)"

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {showGrid && (
            <ChartHorizontalGrid scale={yScale} width={innerWidth} />
          )}

          {/* Bars */}
          {binData.map((b, index) => {
            const barX = xScale(b.x0)
            const barWidth = xScale(b.x1) - xScale(b.x0) - barPadding
            const yValue = showDensity
              ? b.density
              : normalized
                ? b.percent
                : b.count
            const barY = yScale(yValue)
            const barHeight = innerHeight - barY

            return (
              <rect
                key={index}
                x={barX}
                y={barY}
                width={Math.max(0, barWidth)}
                height={Math.max(0, barHeight)}
                fill={barColor}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hoveredBin !== null && hoveredBin !== index && "opacity-50"
                )}
                onMouseEnter={() => setHoveredBin(index)}
                onMouseLeave={() => setHoveredBin(null)}
              />
            )
          })}

          {/* X Axis */}
          <ChartAxis
            scale={xScale}
            orientation="bottom"
            transform={`translate(0, ${innerHeight})`}
            label={xAxisLabel}
          />

          {/* Y Axis */}
          <ChartAxis
            scale={yScale}
            orientation="left"
            label={
              yAxisLabel ??
              (showDensity ? "Density" : normalized ? "Percentage" : "Count")
            }
          />
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredBin !== null && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left:
              margin.left +
              xScale((binData[hoveredBin].x0 + binData[hoveredBin].x1) / 2),
            top:
              margin.top +
              yScale(
                showDensity
                  ? binData[hoveredBin].density
                  : normalized
                    ? binData[hoveredBin].percent
                    : binData[hoveredBin].count
              ) -
              10,
          }}
        >
          <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            <div className="font-medium">
              {binData[hoveredBin].x0.toFixed(2)} -{" "}
              {binData[hoveredBin].x1.toFixed(2)}
            </div>
            <div className="text-muted-foreground">
              Count: {binData[hoveredBin].count}
            </div>
            <div className="text-muted-foreground">
              {binData[hoveredBin].percent.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  )
}
