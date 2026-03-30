"use client"

import * as React from "react"
import { scaleBand, scalePoint } from "d3-scale"

import { cn } from "@/lib/utils"

export interface ParcatsDataPoint {
  id: string
  categories: Record<string, string>
  value?: number
}

export interface ParcatsChartProps {
  data: ParcatsDataPoint[]
  dimensions: string[]
  className?: string
  /** Visual style variant: standard (uniform width), ribbon (proportional to value) */
  variant?: "standard" | "ribbon"
  /** Show category counts */
  showCounts?: boolean
  /** Flow line opacity (0-1) */
  lineOpacity?: number
  /** Single color for all flows */
  color?: string
  /** Color by first dimension categories */
  colorByCategory?: boolean
  /** Color scheme for categories */
  colorScheme?: string[]
}

const DEFAULT_COLOR = "#3b82f6"

const DEFAULT_COLOR_SCHEME = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
]

export function ParcatsChart({
  data,
  dimensions,
  className,
  variant = "standard",
  showCounts = true,
  lineOpacity = 0.5,
  color,
  colorByCategory = false,
  colorScheme = DEFAULT_COLOR_SCHEME,
}: ParcatsChartProps) {
  const [hoveredPath, setHoveredPath] = React.useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = React.useState<{
    dim: string
    cat: string
  } | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Dynamic width based on dimensions
  const width = Math.max(400, dimensions.length * 150)
  // Dynamic height based on max categories
  const maxCategories = React.useMemo(() => {
    let max = 0
    dimensions.forEach((dim) => {
      const cats = new Set(data.map((d) => d.categories[dim]))
      max = Math.max(max, cats.size)
    })
    return max
  }, [data, dimensions])
  const height = Math.max(300, maxCategories * 45 + 80)
  const margin = { top: 40, right: 40, bottom: 30, left: 40 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Calculate value extent for ribbon width scaling
  const valueExtent = React.useMemo(() => {
    if (variant !== "ribbon") return { min: 1, max: 1 }
    const values = data.map((d) => d.value ?? 1)
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [data, variant])

  // Get stroke width based on value (for ribbon variant)
  const getStrokeWidth = (
    value: number | undefined,
    highlighted: boolean
  ): number => {
    if (variant !== "ribbon") {
      return highlighted ? 2.5 : 1.5
    }
    const v = value ?? 1
    const range = valueExtent.max - valueExtent.min || 1
    const normalized = (v - valueExtent.min) / range
    const baseWidth = 2 + normalized * 16 // Range: 2-18px
    return highlighted ? baseWidth * 1.2 : baseWidth
  }

  // Get unique categories for each dimension
  const categoryData = React.useMemo(() => {
    const result: Record<string, string[]> = {}
    dimensions.forEach((dim) => {
      result[dim] = [...new Set(data.map((d) => d.categories[dim]))].sort()
    })
    return result
  }, [data, dimensions])

  // Get first dimension categories for coloring
  const firstDimCategories = categoryData[dimensions[0]] ?? []

  const getCategoryColor = (category: string) => {
    if (color) return color
    if (!colorByCategory) return DEFAULT_COLOR
    const index = firstDimCategories.indexOf(category)
    return colorScheme[index % colorScheme.length]
  }

  const getPathColor = (d: ParcatsDataPoint) => {
    if (color) return color
    if (colorByCategory) {
      return getCategoryColor(d.categories[dimensions[0]])
    }
    return DEFAULT_COLOR
  }

  // X scale for dimensions
  const xScale = scalePoint<string>().domain(dimensions).range([0, innerWidth])

  // Y scales for each dimension (band scale for categories)
  const yScales = React.useMemo(() => {
    const scales: Record<string, ReturnType<typeof scaleBand<string>>> = {}

    dimensions.forEach((dim) => {
      scales[dim] = scaleBand<string>()
        .domain(categoryData[dim])
        .range([0, innerHeight])
        .padding(0.15)
    })

    return scales
  }, [dimensions, categoryData, innerHeight])

  // Count occurrences for each category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, Record<string, number>> = {}
    dimensions.forEach((dim) => {
      counts[dim] = {}
      categoryData[dim].forEach((cat) => {
        counts[dim][cat] = data.filter((d) => d.categories[dim] === cat).length
      })
    })
    return counts
  }, [data, dimensions, categoryData])

  // Generate paths for each data point
  const paths = React.useMemo(() => {
    return data.map((d) => {
      const points = dimensions.map((dim) => {
        const x = xScale(dim) ?? 0
        const yBand = yScales[dim]
        const cat = d.categories[dim]
        const y = (yBand(cat) ?? 0) + yBand.bandwidth() / 2
        return { x, y }
      })

      // Create smooth bezier curve path
      let pathD = `M ${points[0].x} ${points[0].y}`
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const midX = (prev.x + curr.x) / 2
        pathD += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`
      }

      return {
        id: d.id,
        d: pathD,
        color: getPathColor(d),
        categories: d.categories,
        value: d.value,
      }
    })
  }, [data, dimensions, xScale, yScales, color, colorByCategory])

  // Check if path matches hovered category
  const isPathHighlighted = (path: (typeof paths)[0]) => {
    if (hoveredPath === path.id) return true
    if (hoveredCategory) {
      return path.categories[hoveredCategory.dim] === hoveredCategory.cat
    }
    return false
  }

  const handleMouseMove = (e: React.MouseEvent, pathId: string) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setHoveredPath(pathId)
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex h-[380px] items-center justify-center",
          className
        )}
      >
        No data available
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Legend - only show when colorByCategory is true */}
      {colorByCategory && !color && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {firstDimCategories.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              <span className="text-muted-foreground text-sm">{cat}</span>
            </div>
          ))}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Flow paths - render first so they appear behind boxes */}
          {paths.map((path) => {
            const hasHover = hoveredPath !== null || hoveredCategory !== null
            const highlighted = hasHover ? isPathHighlighted(path) : true

            return (
              <path
                key={path.id}
                d={path.d}
                fill="none"
                stroke={path.color}
                strokeWidth={getStrokeWidth(path.value, highlighted)}
                strokeOpacity={
                  hasHover ? (highlighted ? 0.85 : 0.08) : lineOpacity
                }
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-150"
                onMouseMove={(e) => handleMouseMove(e, path.id)}
                onMouseLeave={() => setHoveredPath(null)}
              />
            )
          })}

          {/* Category rectangles and labels */}
          {dimensions.map((dim) => {
            const x = xScale(dim) ?? 0
            const yBand = yScales[dim]

            return (
              <g key={dim}>
                {/* Dimension label */}
                <text
                  x={x}
                  y={-18}
                  textAnchor="middle"
                  className="fill-foreground text-xs font-medium"
                >
                  {dim}
                </text>

                {/* Category boxes */}
                {categoryData[dim].map((cat) => {
                  const y = yBand(cat) ?? 0
                  const h = yBand.bandwidth()
                  const count = categoryCounts[dim][cat]
                  const isHovered =
                    hoveredCategory?.dim === dim && hoveredCategory?.cat === cat

                  const boxColor =
                    colorByCategory && dim === dimensions[0]
                      ? getCategoryColor(cat)
                      : "#e2e8f0"

                  return (
                    <g
                      key={`${dim}-${cat}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCategory({ dim, cat })}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <rect
                        x={x - 35}
                        y={y}
                        width={70}
                        height={h}
                        fill={boxColor}
                        fillOpacity={isHovered ? 1 : 0.85}
                        stroke={isHovered ? "#94a3b8" : "#d1d5db"}
                        strokeWidth={isHovered ? 2 : 1}
                        rx={4}
                        className="transition-all duration-150 dark:fill-zinc-800 dark:stroke-zinc-600"
                      />
                      <text
                        x={x}
                        y={y + h / 2 - (showCounts ? 5 : 0)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground pointer-events-none text-[11px] font-medium"
                      >
                        {cat}
                      </text>
                      {showCounts && (
                        <text
                          x={x}
                          y={y + h / 2 + 10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-muted-foreground pointer-events-none text-[9px]"
                        >
                          ({count})
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPath && (
        <div
          className="bg-foreground text-background pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 10 }}
        >
          <div className="mb-1 font-semibold">{hoveredPath}</div>
          <div className="flex items-center gap-1 opacity-90">
            {dimensions.map((dim, i) => (
              <React.Fragment key={dim}>
                <span>
                  {paths.find((p) => p.id === hoveredPath)?.categories[dim]}
                </span>
                {i < dimensions.length - 1 && (
                  <span className="opacity-50">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
