"use client"

import * as React from "react"
import { bin, max, median, quantile } from "d3-array"
import { scaleBand, scaleLinear } from "d3-scale"
import { area, curveCardinal } from "d3-shape"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartHorizontalGrid } from "../chart-grid"

export interface ViolinChartData {
  label: string
  values: number[]
  color?: string
}

export interface ViolinChartProps extends BaseChartProps {
  data: ViolinChartData[]
  orientation?: "vertical" | "horizontal"
  bandwidth?: number
  showBoxPlot?: boolean
  showMedian?: boolean
  resolution?: number
  xAxisLabel?: string
  yAxisLabel?: string
}

// Kernel density estimation
function kde(
  values: number[],
  domain: [number, number],
  bandwidth: number,
  resolution: number
): Array<{ x: number; y: number }> {
  const [minVal, maxVal] = domain
  const step = (maxVal - minVal) / resolution
  const points: Array<{ x: number; y: number }> = []

  for (let x = minVal; x <= maxVal; x += step) {
    let density = 0
    for (const v of values) {
      const u = (x - v) / bandwidth
      // Gaussian kernel
      density += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
    }
    density /= values.length * bandwidth
    points.push({ x, y: density })
  }

  return points
}

export function ViolinChart({
  data,
  config,
  className,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 40, left: 50 },
  showGrid = true,
  showTooltip = true,
  orientation = "vertical",
  bandwidth: bandwidthProp,
  showBoxPlot = true,
  showMedian = true,
  resolution = 50,
  xAxisLabel,
  yAxisLabel,
}: ViolinChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const isVertical = orientation === "vertical"

  // Calculate all stats and KDE
  const processedData = React.useMemo(() => {
    const allValues = data.flatMap((d) => d.values)
    const globalMin = Math.min(...allValues)
    const globalMax = Math.max(...allValues)
    const domain: [number, number] = [globalMin, globalMax]

    return data.map((d) => {
      const sorted = [...d.values].sort((a, b) => a - b)
      const q1 = quantile(sorted, 0.25) ?? 0
      const med = median(sorted) ?? 0
      const q3 = quantile(sorted, 0.75) ?? 0
      const iqr = q3 - q1

      // Silverman's rule of thumb for bandwidth
      const std = Math.sqrt(
        d.values.reduce((acc, v) => acc + Math.pow(v - med, 2), 0) /
          d.values.length
      )
      const bw =
        bandwidthProp ??
        0.9 * Math.min(std, iqr / 1.34) * Math.pow(d.values.length, -0.2)

      const density = kde(d.values, domain, bw, resolution)
      const maxDensity = max(density, (p) => p.y) ?? 1

      return {
        label: d.label,
        color: d.color,
        values: d.values,
        density,
        maxDensity,
        q1,
        median: med,
        q3,
        min: Math.min(...sorted),
        max: Math.max(...sorted),
      }
    })
  }, [data, bandwidthProp, resolution])

  // Category scale
  const categoryScale = React.useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => d.label))
      .range(isVertical ? [0, innerWidth] : [0, innerHeight])
      .padding(0.2)
  }, [data, innerWidth, innerHeight, isVertical])

  // Value scale
  const valueScale = React.useMemo(() => {
    const allValues = data.flatMap((d) => d.values)
    const minV = Math.min(...allValues)
    const maxV = Math.max(...allValues)
    const padding = (maxV - minV) * 0.1
    return scaleLinear()
      .domain([minV - padding, maxV + padding])
      .range(isVertical ? [innerHeight, 0] : [0, innerWidth])
      .nice()
  }, [data, innerWidth, innerHeight, isVertical])

  // Density scale (for violin width)
  const maxMaxDensity = Math.max(...processedData.map((d) => d.maxDensity))
  const densityScale = scaleLinear()
    .domain([0, maxMaxDensity])
    .range([0, categoryScale.bandwidth() / 2])

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {showGrid && (
            <ChartHorizontalGrid
              scale={
                isVertical
                  ? valueScale
                  : scaleLinear()
                      .domain(valueScale.domain())
                      .range([innerHeight, 0])
              }
              width={innerWidth}
            />
          )}

          {/* Violins */}
          {processedData.map((d, index) => {
            const color =
              d.color ??
              config?.[d.label]?.color ??
              `var(--chart-${(index % 5) + 1})`
            const center =
              (categoryScale(d.label) ?? 0) + categoryScale.bandwidth() / 2
            const isHovered = hoveredIndex === index

            // Create violin path
            const violinArea = area<{ x: number; y: number }>().curve(
              curveCardinal
            )

            if (isVertical) {
              violinArea
                .x0((p) => center - densityScale(p.y))
                .x1((p) => center + densityScale(p.y))
                .y((p) => valueScale(p.x))
            } else {
              violinArea
                .y0((p) => center - densityScale(p.y))
                .y1((p) => center + densityScale(p.y))
                .x((p) => valueScale(p.x))
            }

            return (
              <g
                key={d.label}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hoveredIndex !== null && !isHovered && "opacity-50"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Violin shape */}
                <path
                  d={violinArea(d.density) ?? ""}
                  fill={color}
                  fillOpacity={0.3}
                  stroke={color}
                  strokeWidth={1.5}
                />

                {/* Box plot overlay */}
                {showBoxPlot && (
                  <>
                    {isVertical ? (
                      <>
                        {/* Box */}
                        <rect
                          x={center - 4}
                          y={valueScale(d.q3)}
                          width={8}
                          height={valueScale(d.q1) - valueScale(d.q3)}
                          fill={color}
                          fillOpacity={0.6}
                          rx={1}
                        />
                        {/* Whiskers */}
                        <line
                          x1={center}
                          x2={center}
                          y1={valueScale(d.min)}
                          y2={valueScale(d.q1)}
                          stroke={color}
                          strokeWidth={1}
                        />
                        <line
                          x1={center}
                          x2={center}
                          y1={valueScale(d.q3)}
                          y2={valueScale(d.max)}
                          stroke={color}
                          strokeWidth={1}
                        />
                      </>
                    ) : (
                      <>
                        {/* Box */}
                        <rect
                          y={center - 4}
                          x={valueScale(d.q1)}
                          height={8}
                          width={valueScale(d.q3) - valueScale(d.q1)}
                          fill={color}
                          fillOpacity={0.6}
                          rx={1}
                        />
                        {/* Whiskers */}
                        <line
                          y1={center}
                          y2={center}
                          x1={valueScale(d.min)}
                          x2={valueScale(d.q1)}
                          stroke={color}
                          strokeWidth={1}
                        />
                        <line
                          y1={center}
                          y2={center}
                          x1={valueScale(d.q3)}
                          x2={valueScale(d.max)}
                          stroke={color}
                          strokeWidth={1}
                        />
                      </>
                    )}
                  </>
                )}

                {/* Median point */}
                {showMedian && (
                  <circle
                    cx={isVertical ? center : valueScale(d.median)}
                    cy={isVertical ? valueScale(d.median) : center}
                    r={4}
                    fill="white"
                    stroke={color}
                    strokeWidth={2}
                  />
                )}
              </g>
            )
          })}

          {/* Axes */}
          <ChartAxis
            scale={isVertical ? categoryScale : valueScale}
            orientation="bottom"
            transform={`translate(0, ${innerHeight})`}
            label={xAxisLabel}
          />
          <ChartAxis
            scale={isVertical ? valueScale : categoryScale}
            orientation="left"
            label={yAxisLabel}
          />
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left:
              margin.left +
              (isVertical
                ? (categoryScale(processedData[hoveredIndex].label) ?? 0) +
                  categoryScale.bandwidth() / 2
                : valueScale(processedData[hoveredIndex].median)),
            top: margin.top + 10,
          }}
        >
          <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            <div className="font-medium">
              {processedData[hoveredIndex].label}
            </div>
            <div className="text-muted-foreground">
              n: {processedData[hoveredIndex].values.length}
            </div>
            <div className="text-muted-foreground">
              Median: {processedData[hoveredIndex].median.toFixed(2)}
            </div>
            <div className="text-muted-foreground">
              Q1-Q3: {processedData[hoveredIndex].q1.toFixed(2)} -{" "}
              {processedData[hoveredIndex].q3.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  )
}
