"use client"

import * as React from "react"
import { interpolateRgb } from "d3-interpolate"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"

export interface HeatmapDataPoint {
  x: string | number
  y: string | number
  value: number
}

export interface HeatmapChartProps extends BaseChartProps {
  data: HeatmapDataPoint[]
  xLabels?: string[]
  yLabels?: string[]
  colorScale?: [string, string] | [string, string, string]
  showValues?: boolean
  cellRadius?: number
  cellPadding?: number
  xAxisLabel?: string
  yAxisLabel?: string
  valueFormat?: (value: number) => string
}

export function HeatmapChart({
  data,
  config,
  className,
  width = 600,
  height = 400,
  margin = { top: 20, right: 80, bottom: 50, left: 60 },
  showTooltip = true,
  colorScale = ["#f0f9ff", "#0ea5e9"],
  showValues = false,
  cellRadius = 2,
  cellPadding = 1,
  xAxisLabel,
  yAxisLabel,
  valueFormat = (v) => v.toFixed(1),
}: HeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = React.useState<{
    x: string | number
    y: string | number
  } | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Extract unique labels
  const xLabelsUnique = React.useMemo(() => {
    const labels = [...new Set(data.map((d) => String(d.x)))]
    return labels.sort()
  }, [data])

  const yLabelsUnique = React.useMemo(() => {
    const labels = [...new Set(data.map((d) => String(d.y)))]
    return labels.sort()
  }, [data])

  // Scales
  const xScale = scaleBand()
    .domain(xLabelsUnique)
    .range([0, innerWidth])
    .padding(cellPadding / 100)

  const yScale = scaleBand()
    .domain(yLabelsUnique)
    .range([0, innerHeight])
    .padding(cellPadding / 100)

  // Value scale for colors
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  const valueScale = scaleLinear()
    .domain(
      colorScale.length === 3
        ? [minValue, (minValue + maxValue) / 2, maxValue]
        : [minValue, maxValue]
    )
    .range([0, 1])

  // Color interpolator
  const getColor = React.useCallback(
    (value: number) => {
      const t = valueScale(value)
      if (colorScale.length === 3) {
        if (t < 0.5) {
          return interpolateRgb(colorScale[0], colorScale[1])(t * 2)
        }
        return interpolateRgb(colorScale[1], colorScale[2])((t - 0.5) * 2)
      }
      return interpolateRgb(colorScale[0], colorScale[1])(t)
    },
    [colorScale, valueScale]
  )

  // Create data matrix for quick lookup
  const dataMatrix = React.useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {}
    data.forEach((d) => {
      const xKey = String(d.x)
      const yKey = String(d.y)
      if (!matrix[yKey]) matrix[yKey] = {}
      matrix[yKey][xKey] = d.value
    })
    return matrix
  }, [data])

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Cells */}
          {yLabelsUnique.map((yLabel) =>
            xLabelsUnique.map((xLabel) => {
              const value = dataMatrix[yLabel]?.[xLabel]
              if (value === undefined) return null

              const x = xScale(xLabel) ?? 0
              const y = yScale(yLabel) ?? 0
              const cellWidth = xScale.bandwidth()
              const cellHeight = yScale.bandwidth()
              const isHovered =
                hoveredCell?.x === xLabel && hoveredCell?.y === yLabel

              return (
                <g key={`${xLabel}-${yLabel}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellWidth}
                    height={cellHeight}
                    fill={getColor(value)}
                    rx={cellRadius}
                    ry={cellRadius}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      isHovered && "stroke-foreground stroke-2"
                    )}
                    onMouseEnter={() =>
                      setHoveredCell({ x: xLabel, y: yLabel })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                  />

                  {/* Value label */}
                  {showValues && cellWidth > 30 && cellHeight > 20 && (
                    <text
                      x={x + cellWidth / 2}
                      y={y + cellHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        "pointer-events-none text-[10px] font-medium",
                        valueScale(value) > 0.5
                          ? "fill-white"
                          : "fill-foreground"
                      )}
                    >
                      {valueFormat(value)}
                    </text>
                  )}
                </g>
              )
            })
          )}

          {/* X Axis */}
          <ChartAxis
            scale={xScale}
            orientation="bottom"
            transform={`translate(0, ${innerHeight})`}
            label={xAxisLabel}
          />

          {/* Y Axis */}
          <ChartAxis scale={yScale} orientation="left" label={yAxisLabel} />
        </g>

        {/* Color legend */}
        <g transform={`translate(${width - margin.right + 15}, ${margin.top})`}>
          <defs>
            <linearGradient id="heatmap-gradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={colorScale[0]} />
              {colorScale.length === 3 && (
                <stop offset="50%" stopColor={colorScale[1]} />
              )}
              <stop
                offset="100%"
                stopColor={colorScale[colorScale.length - 1]}
              />
            </linearGradient>
          </defs>
          <rect
            width={15}
            height={innerHeight}
            fill="url(#heatmap-gradient)"
            rx={2}
          />
          <text
            x={20}
            y={0}
            dominantBaseline="hanging"
            className="fill-muted-foreground text-[10px]"
          >
            {maxValue.toFixed(1)}
          </text>
          <text
            x={20}
            y={innerHeight}
            dominantBaseline="auto"
            className="fill-muted-foreground text-[10px]"
          >
            {minValue.toFixed(1)}
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredCell && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left:
              margin.left +
              (xScale(String(hoveredCell.x)) ?? 0) +
              xScale.bandwidth() / 2,
            top: margin.top + (yScale(String(hoveredCell.y)) ?? 0),
          }}
        >
          <div className="border-border/50 bg-background -mt-2 -translate-x-1/2 -translate-y-full rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            <div className="font-medium">
              {String(hoveredCell.x)} × {String(hoveredCell.y)}
            </div>
            <div className="text-muted-foreground">
              Value:{" "}
              {valueFormat(
                dataMatrix[String(hoveredCell.y)]?.[String(hoveredCell.x)] ?? 0
              )}
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  )
}
