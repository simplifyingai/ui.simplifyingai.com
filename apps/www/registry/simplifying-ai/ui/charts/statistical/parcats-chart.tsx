"use client"

import * as React from "react"
import { scalePoint, scaleBand } from "d3-scale"

import { cn } from "@/lib/utils"

export interface ParcatsDataPoint {
  id: string
  categories: Record<string, string>
  value?: number
  color?: string
}

export interface ParcatsChartProps {
  data: ParcatsDataPoint[]
  dimensions: string[]
  className?: string
  bundleColors?: boolean
  showCounts?: boolean
  lineOpacity?: number
  colorScheme?: string[]
}

export function ParcatsChart({
  data,
  dimensions,
  className,
  bundleColors = true,
  showCounts = true,
  lineOpacity = 0.5,
  colorScheme = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#dc2626", "#059669", "#d97706"],
}: ParcatsChartProps) {
  const [hoveredPath, setHoveredPath] = React.useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = React.useState<{ dim: string; cat: string } | null>(null)

  const width = 600
  const height = 400
  const margin = { top: 40, right: 30, bottom: 30, left: 30 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

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
    const index = firstDimCategories.indexOf(category)
    return colorScheme[index % colorScheme.length]
  }

  // X scale for dimensions
  const xScale = scalePoint<string>()
    .domain(dimensions)
    .range([0, innerWidth])

  // Y scales for each dimension (band scale for categories)
  const yScales = React.useMemo(() => {
    const scales: Record<string, ReturnType<typeof scaleBand<string>>> = {}

    dimensions.forEach((dim) => {
      scales[dim] = scaleBand<string>()
        .domain(categoryData[dim])
        .range([0, innerHeight])
        .padding(0.1)
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
      const points = dimensions.map((dim, i) => {
        const x = xScale(dim) ?? 0
        const yBand = yScales[dim]
        const cat = d.categories[dim]
        const y = (yBand(cat) ?? 0) + yBand.bandwidth() / 2
        return { x, y }
      })

      // Create smooth path
      let pathD = `M ${points[0].x} ${points[0].y}`
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const midX = (prev.x + curr.x) / 2
        pathD += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`
      }

      const color = bundleColors
        ? getCategoryColor(d.categories[dimensions[0]])
        : d.color ?? colorScheme[0]

      return {
        id: d.id,
        d: pathD,
        color,
        categories: d.categories,
      }
    })
  }, [data, dimensions, xScale, yScales, bundleColors, colorScheme])

  // Check if path matches hovered category
  const isPathHighlighted = (path: typeof paths[0]) => {
    if (hoveredPath === path.id) return true
    if (hoveredCategory) {
      return path.categories[hoveredCategory.dim] === hoveredCategory.cat
    }
    return false
  }

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Category rectangles and labels */}
          {dimensions.map((dim) => {
            const x = xScale(dim) ?? 0
            const yBand = yScales[dim]

            return (
              <g key={dim}>
                {/* Dimension label */}
                <text
                  x={x}
                  y={-15}
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
                  const isHovered = hoveredCategory?.dim === dim && hoveredCategory?.cat === cat

                  return (
                    <g
                      key={`${dim}-${cat}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCategory({ dim, cat })}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <rect
                        x={x - 30}
                        y={y}
                        width={60}
                        height={h}
                        fill={dim === dimensions[0] ? getCategoryColor(cat) : "hsl(var(--muted))"}
                        fillOpacity={isHovered ? 1 : 0.8}
                        stroke="hsl(var(--border))"
                        strokeWidth={isHovered ? 2 : 1}
                        rx={3}
                        className="transition-all duration-150"
                      />
                      <text
                        x={x}
                        y={y + h / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-[10px] font-medium pointer-events-none"
                      >
                        {cat}
                      </text>
                      {showCounts && (
                        <text
                          x={x}
                          y={y + h / 2 + 10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-muted-foreground text-[8px] pointer-events-none"
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

          {/* Flow paths */}
          {paths.map((path) => {
            const highlighted = hoveredPath !== null || hoveredCategory !== null
              ? isPathHighlighted(path)
              : true

            return (
              <path
                key={path.id}
                d={path.d}
                fill="none"
                stroke={path.color}
                strokeWidth={highlighted ? 2.5 : 1.5}
                strokeOpacity={highlighted ? (hoveredPath === path.id || hoveredCategory ? 0.9 : lineOpacity) : 0.1}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredPath(path.id)}
                onMouseLeave={() => setHoveredPath(null)}
              />
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPath && (
        <div className="mt-2 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
            <div className="font-medium">{hoveredPath}</div>
            <div className="text-muted-foreground text-xs">
              {dimensions.map((dim, i) => (
                <span key={dim}>
                  {paths.find((p) => p.id === hoveredPath)?.categories[dim]}
                  {i < dimensions.length - 1 && " → "}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
