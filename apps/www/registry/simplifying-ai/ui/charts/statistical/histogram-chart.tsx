"use client"

import * as React from "react"
import { bin } from "d3-array"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartHorizontalGrid } from "../chart-grid"

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface HistogramDataset {
  data: number[]
  label?: string
  color?: string
}

export interface HistogramChartProps extends BaseChartProps {
  /** Single dataset or multiple datasets for overlay */
  data: number[] | HistogramDataset[]
  /** Number of bins */
  bins?: number
  /** X-axis label */
  xAxisLabel?: string
  /** Y-axis label */
  yAxisLabel?: string
  /** Bar color (for single dataset) */
  color?: string
  /** Bar padding between bins */
  barPadding?: number
  /** Show density instead of count */
  showDensity?: boolean
  /** Normalize to percentages */
  normalized?: boolean
  /** Variant style */
  variant?: "default" | "overlay" | "gradient" | "stepped"
  /** Show bar border/stroke */
  showBorder?: boolean
  /** Border color */
  borderColor?: string
  /** Bar corner radius */
  cornerRadius?: number
  /** Opacity for overlay/stepped variants */
  fillOpacity?: number
  /** Color scale for gradient variant */
  colorScale?: "viridis" | "plasma" | "warm" | "cool" | "rainbow"
  /** Show legend for multiple datasets */
  showLegend?: boolean
}

// ============================================================================
// Color Scales
// ============================================================================

const COLOR_SCALES = {
  // Blue-purple gradient (default) - professional blue tones
  viridis: (t: number) => {
    const colors = [
      "#1e3a5f",
      "#2563eb",
      "#3b82f6",
      "#60a5fa",
      "#93c5fd",
      "#bfdbfe",
    ]
    const idx = Math.min(Math.floor(t * (colors.length - 1)), colors.length - 2)
    const localT = t * (colors.length - 1) - idx
    return interpolateColor(colors[idx], colors[idx + 1], localT)
  },
  // Plasma: deep purple -> magenta -> orange
  plasma: (t: number) => {
    const colors = [
      "#0d0887",
      "#6a00a8",
      "#b12a90",
      "#e16462",
      "#fca636",
      "#f0f921",
    ]
    const idx = Math.min(Math.floor(t * (colors.length - 1)), colors.length - 2)
    const localT = t * (colors.length - 1) - idx
    return interpolateColor(colors[idx], colors[idx + 1], localT)
  },
  // Warm: purple -> pink -> orange -> gold
  warm: (t: number) => {
    const colors = ["#6e40aa", "#be3caf", "#fe4b83", "#ff7847", "#e2b72f"]
    const idx = Math.min(Math.floor(t * (colors.length - 1)), colors.length - 2)
    const localT = t * (colors.length - 1) - idx
    return interpolateColor(colors[idx], colors[idx + 1], localT)
  },
  // Cool: indigo -> blue -> cyan
  cool: (t: number) => {
    const colors = [
      "#312e81",
      "#4338ca",
      "#6366f1",
      "#818cf8",
      "#a5b4fc",
      "#c7d2fe",
    ]
    const idx = Math.min(Math.floor(t * (colors.length - 1)), colors.length - 2)
    const localT = t * (colors.length - 1) - idx
    return interpolateColor(colors[idx], colors[idx + 1], localT)
  },
  // Rainbow with blue emphasis
  rainbow: (t: number) => {
    const h = 220 + t * 140 // Start from blue, cycle through purple to cyan
    return `hsl(${h % 360}, 70%, 55%)`
  },
}

function interpolateColor(c1: string, c2: string, t: number): string {
  const hex2rgb = (hex: string) => {
    const h = hex.replace("#", "")
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ]
  }
  const rgb2hex = (r: number, g: number, b: number) =>
    "#" +
    [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")

  const [r1, g1, b1] = hex2rgb(c1)
  const [r2, g2, b2] = hex2rgb(c2)
  return rgb2hex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

// Default colors for multiple datasets (overlay variant)
const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#ec4899", // pink
  "#10b981", // emerald
]

// ============================================================================
// Component
// ============================================================================

export function HistogramChart({
  data,
  config,
  className,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 40, left: 50 },
  showGrid = true,
  showTooltip = true,
  bins = 30,
  xAxisLabel,
  yAxisLabel,
  color,
  barPadding = 1,
  showDensity = false,
  normalized = false,
  variant = "default",
  showBorder = true,
  borderColor,
  cornerRadius = 0,
  fillOpacity,
  colorScale = "viridis",
  showLegend = true,
}: HistogramChartProps) {
  const [hoveredBin, setHoveredBin] = React.useState<{
    datasetIdx: number
    binIdx: number
  } | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Normalize data to array of datasets
  const datasets: HistogramDataset[] = React.useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0] === "number") {
        return [
          {
            data: data as number[],
            label: "Data",
            color: color || DEFAULT_COLORS[0],
          },
        ]
      }
      return (data as HistogramDataset[]).map((d, i) => ({
        ...d,
        color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      }))
    }
    return []
  }, [data, color])

  // Calculate global domain
  const globalDomain = React.useMemo(() => {
    const allData = datasets.flatMap((d) => d.data)
    if (allData.length === 0) return [0, 1]
    return [Math.min(...allData), Math.max(...allData)]
  }, [datasets])

  // Create histogram bins for each dataset
  const histograms = React.useMemo(() => {
    const binGenerator = bin()
      .domain(globalDomain as [number, number])
      .thresholds(bins)

    return datasets.map((dataset) => {
      const hist = binGenerator(dataset.data)
      const total = dataset.data.length
      return hist.map((b) => ({
        x0: b.x0!,
        x1: b.x1!,
        count: b.length,
        density: b.length / total / (b.x1! - b.x0!),
        percent: (b.length / total) * 100,
      }))
    })
  }, [datasets, globalDomain, bins])

  // Scales
  const xScale = React.useMemo(() => {
    return scaleLinear().domain(globalDomain).range([0, innerWidth])
  }, [globalDomain, innerWidth])

  const yScale = React.useMemo(() => {
    let maxY = 0
    histograms.forEach((binData) => {
      binData.forEach((b) => {
        const val = showDensity ? b.density : normalized ? b.percent : b.count
        if (val > maxY) maxY = val
      })
    })
    return scaleLinear()
      .domain([0, maxY * 1.1])
      .range([innerHeight, 0])
      .nice()
  }, [histograms, innerHeight, showDensity, normalized])

  // Get color function for gradient variant
  const getGradientColor = React.useCallback(
    (binIdx: number, totalBins: number) => {
      const t = binIdx / (totalBins - 1)
      return COLOR_SCALES[colorScale](t)
    },
    [colorScale]
  )

  // Determine fill opacity based on variant
  const getFillOpacity = () => {
    if (fillOpacity !== undefined) return fillOpacity
    switch (variant) {
      case "overlay":
        return 0.6
      case "stepped":
        return 0.4
      default:
        return 1
    }
  }

  // Generate stepped path for a dataset
  const generateSteppedPath = (binData: (typeof histograms)[0]) => {
    if (binData.length === 0) return ""

    const points: string[] = []
    points.push(`M ${xScale(binData[0].x0)} ${innerHeight}`)

    binData.forEach((b) => {
      const yValue = showDensity ? b.density : normalized ? b.percent : b.count
      const y = yScale(yValue)
      points.push(`L ${xScale(b.x0)} ${y}`)
      points.push(`L ${xScale(b.x1)} ${y}`)
    })

    points.push(`L ${xScale(binData[binData.length - 1].x1)} ${innerHeight}`)
    points.push("Z")

    return points.join(" ")
  }

  // Render bars for a single dataset
  const renderBars = (
    binData: (typeof histograms)[0],
    datasetIdx: number,
    datasetColor: string
  ) => {
    return binData.map((b, binIdx) => {
      const barX = xScale(b.x0)
      const barWidth = Math.max(0, xScale(b.x1) - xScale(b.x0) - barPadding)
      const yValue = showDensity ? b.density : normalized ? b.percent : b.count
      const barY = yScale(yValue)
      const barHeight = Math.max(0, innerHeight - barY)

      let fillColor = datasetColor
      if (variant === "gradient") {
        fillColor = getGradientColor(binIdx, binData.length)
      }

      const isHovered =
        hoveredBin?.datasetIdx === datasetIdx && hoveredBin?.binIdx === binIdx

      return (
        <rect
          key={`${datasetIdx}-${binIdx}`}
          x={barX}
          y={barY}
          width={barWidth}
          height={barHeight}
          fill={fillColor}
          fillOpacity={getFillOpacity()}
          stroke={showBorder ? borderColor || fillColor : "none"}
          strokeWidth={showBorder ? 1 : 0}
          rx={cornerRadius}
          ry={cornerRadius}
          className={cn(
            "cursor-pointer transition-opacity duration-150",
            hoveredBin !== null && !isHovered && "opacity-60"
          )}
          onMouseEnter={() => setHoveredBin({ datasetIdx, binIdx })}
          onMouseLeave={() => setHoveredBin(null)}
        />
      )
    })
  }

  // Render stepped/area histogram
  const renderStepped = (
    binData: (typeof histograms)[0],
    datasetIdx: number,
    datasetColor: string
  ) => {
    const path = generateSteppedPath(binData)
    return (
      <g key={datasetIdx}>
        {/* The filled area path */}
        <path
          d={path}
          fill={datasetColor}
          fillOpacity={getFillOpacity()}
          stroke={datasetColor}
          strokeWidth={1.5}
          className={cn(
            "transition-opacity duration-150",
            hoveredBin !== null &&
              hoveredBin.datasetIdx !== datasetIdx &&
              "opacity-50"
          )}
        />
        {/* Invisible hit areas for each bin segment */}
        {binData.map((b, binIdx) => {
          const barX = xScale(b.x0)
          const barWidth = Math.max(0, xScale(b.x1) - xScale(b.x0))
          const yValue = showDensity
            ? b.density
            : normalized
              ? b.percent
              : b.count
          const barY = yScale(yValue)
          const barHeight = Math.max(0, innerHeight - barY)

          const isHovered =
            hoveredBin?.datasetIdx === datasetIdx &&
            hoveredBin?.binIdx === binIdx

          return (
            <rect
              key={`hit-${datasetIdx}-${binIdx}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="transparent"
              className={cn("cursor-pointer", isHovered && "fill-foreground/5")}
              onMouseEnter={() => setHoveredBin({ datasetIdx, binIdx })}
              onMouseLeave={() => setHoveredBin(null)}
            />
          )
        })}
      </g>
    )
  }

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid */}
          {showGrid && (
            <ChartHorizontalGrid scale={yScale} width={innerWidth} />
          )}

          {/* Render based on variant */}
          {variant === "stepped"
            ? datasets.map((dataset, idx) =>
                renderStepped(histograms[idx], idx, dataset.color!)
              )
            : datasets.map((dataset, idx) =>
                renderBars(histograms[idx], idx, dataset.color!)
              )}

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

        {/* Legend for multiple datasets */}
        {showLegend && datasets.length > 1 && (
          <g
            transform={`translate(${width - margin.right - 100}, ${margin.top})`}
          >
            <rect
              x={-10}
              y={-10}
              width={110}
              height={datasets.length * 22 + 10}
              fill="var(--background)"
              stroke="var(--border)"
              strokeWidth={1}
              rx={4}
            />
            {datasets.map((dataset, idx) => (
              <g key={idx} transform={`translate(0, ${idx * 22})`}>
                <rect
                  x={0}
                  y={0}
                  width={16}
                  height={14}
                  fill={dataset.color}
                  fillOpacity={getFillOpacity()}
                  stroke={dataset.color}
                  strokeWidth={1}
                  rx={2}
                />
                <text x={22} y={11} className="fill-foreground text-[11px]">
                  {dataset.label || `Dataset ${idx + 1}`}
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredBin !== null && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left:
              margin.left +
              xScale(
                (histograms[hoveredBin.datasetIdx][hoveredBin.binIdx].x0 +
                  histograms[hoveredBin.datasetIdx][hoveredBin.binIdx].x1) /
                  2
              ),
            top:
              margin.top +
              yScale(
                showDensity
                  ? histograms[hoveredBin.datasetIdx][hoveredBin.binIdx].density
                  : normalized
                    ? histograms[hoveredBin.datasetIdx][hoveredBin.binIdx]
                        .percent
                    : histograms[hoveredBin.datasetIdx][hoveredBin.binIdx].count
              ) -
              10,
            transform: "translateX(-50%)",
          }}
        >
          <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            {datasets.length > 1 && (
              <div
                className="mb-1 font-medium"
                style={{ color: datasets[hoveredBin.datasetIdx].color }}
              >
                {datasets[hoveredBin.datasetIdx].label ||
                  `Dataset ${hoveredBin.datasetIdx + 1}`}
              </div>
            )}
            <div className="font-medium">
              {histograms[hoveredBin.datasetIdx][hoveredBin.binIdx].x0.toFixed(
                1
              )}{" "}
              -{" "}
              {histograms[hoveredBin.datasetIdx][hoveredBin.binIdx].x1.toFixed(
                1
              )}
            </div>
            <div className="text-muted-foreground">
              Count:{" "}
              {histograms[hoveredBin.datasetIdx][hoveredBin.binIdx].count}
            </div>
            <div className="text-muted-foreground">
              {histograms[hoveredBin.datasetIdx][
                hoveredBin.binIdx
              ].percent.toFixed(1)}
              %
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  )
}
