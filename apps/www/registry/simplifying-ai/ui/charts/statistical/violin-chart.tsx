"use client"

import * as React from "react"
import { max, median, min, quantile } from "d3-array"
import { scaleBand, scaleLinear } from "d3-scale"
import { area, curveCardinal } from "d3-shape"

import { cn } from "@/lib/utils"

export interface ViolinDataPoint {
  category: string
  values: number[]
}

export interface ViolinChartProps {
  /** Violin data */
  data: ViolinDataPoint[]
  className?: string
  /** Visual style variant: standard (full violin), boxplot (box only), split (A/B comparison) */
  variant?: "standard" | "boxplot" | "split"
  /** Show box plot overlay (for standard/split) */
  showBoxPlot?: boolean
  /** Show median marker */
  showMedian?: boolean
  /** Show grid lines */
  showGrid?: boolean
  /** KDE bandwidth (auto-calculated if not provided) */
  bandwidth?: number
  /** KDE resolution (number of points) */
  resolution?: number
  /** Single color for all violins */
  color?: string
  /** Per-category colors */
  colors?: string[]
  /** Groups for split variant (e.g., ["Group A", "Group B"]) */
  splitGroups?: [string, string]
  /** Custom value formatter */
  valueFormatter?: (value: number) => string
}

// Kernel density estimation using Gaussian kernel
function kde(
  values: number[],
  domain: [number, number],
  bandwidth: number,
  resolution: number
): Array<{ x: number; density: number }> {
  const [minVal, maxVal] = domain
  const step = (maxVal - minVal) / resolution
  const points: Array<{ x: number; density: number }> = []

  for (let x = minVal; x <= maxVal; x += step) {
    let density = 0
    for (const v of values) {
      const u = (x - v) / bandwidth
      // Gaussian kernel
      density += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
    }
    density /= values.length * bandwidth
    points.push({ x, density })
  }

  return points
}

// Calculate statistics for a set of values
function calculateStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25) ?? 0
  const med = median(sorted) ?? 0
  const q3 = quantile(sorted, 0.75) ?? 0
  const minVal = min(sorted) ?? 0
  const maxVal = max(sorted) ?? 0
  const iqr = q3 - q1

  // Silverman's rule of thumb for bandwidth
  const std = Math.sqrt(
    values.reduce((acc, v) => acc + Math.pow(v - med, 2), 0) / values.length
  )
  const autoBandwidth =
    0.9 * Math.min(std, iqr / 1.34) * Math.pow(values.length, -0.2)

  return { q1, median: med, q3, min: minVal, max: maxVal, autoBandwidth }
}

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
]

export function ViolinChart({
  data,
  className,
  variant = "standard",
  showBoxPlot = true,
  showMedian = true,
  showGrid = true,
  bandwidth: bandwidthProp,
  resolution = 50,
  color,
  colors = DEFAULT_COLORS,
  splitGroups,
  valueFormatter = (v) => v.toFixed(0),
}: ViolinChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })
  const svgRef = React.useRef<SVGSVGElement>(null)

  // Dynamic sizing based on data
  const width = Math.max(400, data.length * 80 + 100)
  const height = 320
  const margin = { top: 20, right: 30, bottom: 50, left: 55 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Get color for a category
  const getColor = (index: number): string => {
    if (color) return color
    return colors[index % colors.length]
  }

  // Split variant colors
  const splitColors = splitGroups
    ? [colors[0], colors[1]]
    : ["#3b82f6", "#ef4444"]

  // Process data
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return []

    const allValues = data.flatMap((d) => d.values)
    const globalMin = min(allValues) ?? 0
    const globalMax = max(allValues) ?? 100
    const padding = (globalMax - globalMin) * 0.1
    const domain: [number, number] = [globalMin - padding, globalMax + padding]

    return data.map((d) => {
      const stats = calculateStats(d.values)
      const bw = bandwidthProp ?? stats.autoBandwidth

      return {
        category: d.category,
        values: d.values,
        density: kde(d.values, domain, bw, resolution),
        stats,
      }
    })
  }, [data, bandwidthProp, resolution])

  // Category scale
  const categoryScale = React.useMemo(() => {
    return scaleBand<string>()
      .domain(data.map((d) => d.category))
      .range([0, innerWidth])
      .padding(0.3)
  }, [data, innerWidth])

  // Value scale (Y-axis)
  const valueScale = React.useMemo(() => {
    const allValues = data.flatMap((d) => d.values)
    const minV = min(allValues) ?? 0
    const maxV = max(allValues) ?? 100
    const padding = (maxV - minV) * 0.15

    return scaleLinear()
      .domain([minV - padding, maxV + padding])
      .range([innerHeight, 0])
      .nice()
  }, [data, innerHeight])

  // Max density across all violins (for width scaling)
  const maxDensity = React.useMemo(() => {
    return (
      max(
        processedData.flatMap((d) =>
          d.density ? [max(d.density, (p) => p.density) ?? 0] : []
        )
      ) ?? 1
    )
  }, [processedData])

  // Density scale (for violin width)
  const densityScale = scaleLinear()
    .domain([0, maxDensity])
    .range([0, categoryScale.bandwidth() / 2])

  const yTicks = valueScale.ticks(6)

  // Render single violin (full or half for split variant)
  const renderViolin = (
    density: Array<{ x: number; density: number }>,
    center: number,
    isHovered: boolean,
    violinColor: string,
    side?: "left" | "right" // For split variant
  ) => {
    let violinArea

    if (side === "left") {
      // Left half only
      violinArea = area<{ x: number; density: number }>()
        .curve(curveCardinal)
        .x0(() => center)
        .x1((p) => center - densityScale(p.density))
        .y((p) => valueScale(p.x))
    } else if (side === "right") {
      // Right half only
      violinArea = area<{ x: number; density: number }>()
        .curve(curveCardinal)
        .x0(() => center)
        .x1((p) => center + densityScale(p.density))
        .y((p) => valueScale(p.x))
    } else {
      // Full violin
      violinArea = area<{ x: number; density: number }>()
        .curve(curveCardinal)
        .x0((p) => center - densityScale(p.density))
        .x1((p) => center + densityScale(p.density))
        .y((p) => valueScale(p.x))
    }

    return (
      <path
        d={violinArea(density) ?? ""}
        fill={violinColor}
        fillOpacity={isHovered ? 0.4 : 0.25}
        stroke={violinColor}
        strokeWidth={isHovered ? 2 : 1.5}
        className="transition-all duration-150"
      />
    )
  }

  // Render box plot
  const renderBoxPlot = (
    stats: { q1: number; median: number; q3: number; min: number; max: number },
    center: number,
    boxColor: string
  ) => {
    const boxWidth = 6

    return (
      <g>
        {/* Whisker line */}
        <line
          x1={center}
          x2={center}
          y1={valueScale(stats.min)}
          y2={valueScale(stats.max)}
          stroke={boxColor}
          strokeWidth={1}
        />
        {/* Box */}
        <rect
          x={center - boxWidth / 2}
          y={valueScale(stats.q3)}
          width={boxWidth}
          height={Math.max(0, valueScale(stats.q1) - valueScale(stats.q3))}
          fill={boxColor}
          fillOpacity={0.7}
          rx={1}
        />
        {/* Whisker caps */}
        <line
          x1={center - 3}
          x2={center + 3}
          y1={valueScale(stats.min)}
          y2={valueScale(stats.min)}
          stroke={boxColor}
          strokeWidth={1}
        />
        <line
          x1={center - 3}
          x2={center + 3}
          y1={valueScale(stats.max)}
          y2={valueScale(stats.max)}
          stroke={boxColor}
          strokeWidth={1}
        />
      </g>
    )
  }

  // Render median marker
  const renderMedian = (
    medianVal: number,
    center: number,
    medianColor: string
  ) => (
    <circle
      cx={center}
      cy={valueScale(medianVal)}
      r={3}
      fill="white"
      stroke={medianColor}
      strokeWidth={2}
    />
  )

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - margin.left

    // Find which category is being hovered
    let hoveredIdx: number | null = null
    data.forEach((d, i) => {
      const catX = categoryScale(d.category) ?? 0
      if (x >= catX && x <= catX + categoryScale.bandwidth()) {
        hoveredIdx = i
      }
    })

    if (hoveredIdx !== null) {
      setTooltipPos({
        x:
          (categoryScale(data[hoveredIdx].category) ?? 0) +
          categoryScale.bandwidth() / 2 +
          margin.left,
        y: margin.top + 20,
      })
    }
    setHoveredIndex(hoveredIdx)
  }

  if (!data || data.length === 0 || processedData.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex h-[320px] items-center justify-center",
          className
        )}
      >
        No data available
      </div>
    )
  }

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {showGrid &&
            yTicks.map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={innerWidth}
                y1={valueScale(tick)}
                y2={valueScale(tick)}
                stroke="#e5e7eb"
                strokeWidth={1}
                className="dark:stroke-zinc-700"
              />
            ))}

          {/* X axis line */}
          <line
            x1={0}
            x2={innerWidth}
            y1={innerHeight}
            y2={innerHeight}
            stroke="#d1d5db"
            strokeWidth={1}
            className="dark:stroke-zinc-600"
          />

          {/* Render violins */}
          {processedData.map((d, i) => {
            const center =
              (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
            const isHovered = hoveredIndex === i
            const violinColor = getColor(i)

            if (variant === "split") {
              // Split variant: render two half-violins side by side
              return (
                <g key={d.category}>
                  {/* Left half (Group A) */}
                  {renderViolin(
                    d.density,
                    center,
                    isHovered,
                    splitColors[0],
                    "left"
                  )}
                  {/* Right half (Group B) */}
                  {renderViolin(
                    d.density,
                    center,
                    isHovered,
                    splitColors[1],
                    "right"
                  )}
                  {/* Median markers */}
                  {showMedian && (
                    <>
                      <circle
                        cx={center - 4}
                        cy={valueScale(d.stats.median)}
                        r={2.5}
                        fill="white"
                        stroke={splitColors[0]}
                        strokeWidth={1.5}
                      />
                      <circle
                        cx={center + 4}
                        cy={valueScale(d.stats.median)}
                        r={2.5}
                        fill="white"
                        stroke={splitColors[1]}
                        strokeWidth={1.5}
                      />
                    </>
                  )}
                </g>
              )
            }

            return (
              <g key={d.category}>
                {/* Violin shape */}
                {variant !== "boxplot" &&
                  renderViolin(d.density, center, isHovered, violinColor)}

                {/* Box plot */}
                {(showBoxPlot || variant === "boxplot") &&
                  renderBoxPlot(d.stats, center, violinColor)}

                {/* Median marker */}
                {showMedian &&
                  renderMedian(d.stats.median, center, violinColor)}
              </g>
            )
          })}

          {/* Category labels */}
          {data.map((d) => (
            <text
              key={d.category}
              x={
                (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
              }
              y={innerHeight + 25}
              textAnchor="middle"
              fontSize={12}
              className="fill-foreground"
            >
              {d.category}
            </text>
          ))}

          {/* Y axis labels */}
          {yTicks.map((tick) => (
            <text
              key={tick}
              x={-12}
              y={valueScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              className="fill-muted-foreground"
            >
              {valueFormatter(tick)}
            </text>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && processedData[hoveredIndex] && (
        <div
          className="bg-foreground text-background pointer-events-none absolute z-50 -translate-x-1/2 rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="mb-1 font-semibold">
            {processedData[hoveredIndex].category}
          </div>
          <div className="space-y-0.5 opacity-90">
            <div>n: {processedData[hoveredIndex].values.length}</div>
            <div>
              Median: {valueFormatter(processedData[hoveredIndex].stats.median)}
            </div>
            <div>
              Q1-Q3: {valueFormatter(processedData[hoveredIndex].stats.q1)} -{" "}
              {valueFormatter(processedData[hoveredIndex].stats.q3)}
            </div>
            <div>
              Range: {valueFormatter(processedData[hoveredIndex].stats.min)} -{" "}
              {valueFormatter(processedData[hoveredIndex].stats.max)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
