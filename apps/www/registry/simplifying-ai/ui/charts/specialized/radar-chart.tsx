"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"
import { curveLinearClosed, lineRadial } from "d3-shape"

import { cn } from "@/lib/utils"

import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartLegend, type LegendItem } from "../chart-legend"

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface RadarChartDataPoint {
  axis: string
  value: number
}

export interface RadarChartSeries {
  name: string
  data: RadarChartDataPoint[]
  color?: string
  fillOpacity?: number
}

export type RadarChartVariant =
  | "default"
  | "comparison"
  | "legend"
  | "filled"
  | "circle"
  | "minimal"
  | "labels"

export interface RadarChartProps extends BaseChartProps {
  data: RadarChartSeries[]
  variant?: RadarChartVariant
  maxValue?: number
  levels?: number
  showDots?: boolean
  dotSize?: number
  fillOpacity?: number
  strokeWidth?: number
  showLabels?: boolean
  labelOffset?: number
  showLevelLabels?: boolean
  gridType?: "polygon" | "circle"
  showRadialLines?: boolean
}

// ============================================================================
// Variant Configuration
// ============================================================================

interface VariantDefaults {
  levels: number
  showDots: boolean
  dotSize: number
  fillOpacity: number
  strokeWidth: number
  showLabels: boolean
  labelOffset: number
  showLevelLabels: boolean
  gridType: "polygon" | "circle"
  showRadialLines: boolean
  showLegend: boolean
  showGrid: boolean
}

function getVariantDefaults(variant: RadarChartVariant): VariantDefaults {
  switch (variant) {
    case "comparison":
      return {
        levels: 5,
        showDots: false,
        dotSize: 4,
        fillOpacity: 0.4,
        strokeWidth: 2.5,
        showLabels: true,
        labelOffset: 25,
        showLevelLabels: false,
        gridType: "polygon",
        showRadialLines: true,
        showLegend: false,
        showGrid: true,
      }
    case "legend":
      return {
        levels: 5,
        showDots: false,
        dotSize: 4,
        fillOpacity: 0.35,
        strokeWidth: 2,
        showLabels: true,
        labelOffset: 20,
        showLevelLabels: false,
        gridType: "polygon",
        showRadialLines: true,
        showLegend: true,
        showGrid: true,
      }
    case "filled":
      return {
        levels: 5,
        showDots: false,
        dotSize: 4,
        fillOpacity: 0.5,
        strokeWidth: 2,
        showLabels: true,
        labelOffset: 20,
        showLevelLabels: false,
        gridType: "polygon",
        showRadialLines: true,
        showLegend: false,
        showGrid: true,
      }
    case "circle":
      return {
        levels: 4,
        showDots: false,
        dotSize: 4,
        fillOpacity: 0.4,
        strokeWidth: 2,
        showLabels: true,
        labelOffset: 20,
        showLevelLabels: false,
        gridType: "circle",
        showRadialLines: false,
        showLegend: false,
        showGrid: true,
      }
    case "minimal":
      return {
        levels: 0,
        showDots: true,
        dotSize: 5,
        fillOpacity: 0.4,
        strokeWidth: 2,
        showLabels: true,
        labelOffset: 20,
        showLevelLabels: false,
        gridType: "polygon",
        showRadialLines: false,
        showLegend: false,
        showGrid: false,
      }
    case "labels":
      return {
        levels: 5,
        showDots: false,
        dotSize: 4,
        fillOpacity: 0.4,
        strokeWidth: 2,
        showLabels: true,
        labelOffset: 35,
        showLevelLabels: false,
        gridType: "polygon",
        showRadialLines: true,
        showLegend: false,
        showGrid: true,
      }
    default:
      return {
        levels: 5,
        showDots: true,
        dotSize: 4,
        fillOpacity: 0.25,
        strokeWidth: 2,
        showLabels: true,
        labelOffset: 20,
        showLevelLabels: true,
        gridType: "polygon",
        showRadialLines: true,
        showLegend: true,
        showGrid: true,
      }
  }
}

// ============================================================================
// Component
// ============================================================================

export function RadarChart({
  data,
  config,
  className,
  variant = "default",
  width = 500,
  height = 500,
  margin: marginProp,
  showTooltip = true,
  showLegend: showLegendProp,
  showGrid: showGridProp,
  maxValue: maxValueProp,
  levels: levelsProp,
  showDots: showDotsProp,
  dotSize: dotSizeProp,
  fillOpacity: fillOpacityProp,
  strokeWidth: strokeWidthProp,
  showLabels: showLabelsProp,
  labelOffset: labelOffsetProp,
  showLevelLabels: showLevelLabelsProp,
  gridType: gridTypeProp,
  showRadialLines: showRadialLinesProp,
}: RadarChartProps) {
  const defaults = getVariantDefaults(variant)

  // Apply variant defaults with prop overrides
  const levels = levelsProp ?? defaults.levels
  const showDots = showDotsProp ?? defaults.showDots
  const dotSize = dotSizeProp ?? defaults.dotSize
  const fillOpacity = fillOpacityProp ?? defaults.fillOpacity
  const strokeWidth = strokeWidthProp ?? defaults.strokeWidth
  const showLabels = showLabelsProp ?? defaults.showLabels
  const labelOffset = labelOffsetProp ?? defaults.labelOffset
  const showLevelLabels = showLevelLabelsProp ?? defaults.showLevelLabels
  const gridType = gridTypeProp ?? defaults.gridType
  const showRadialLines = showRadialLinesProp ?? defaults.showRadialLines
  const showLegend = showLegendProp ?? defaults.showLegend
  const showGrid = showGridProp ?? defaults.showGrid

  const margin = marginProp ?? { top: 50, right: 50, bottom: 50, left: 50 }

  const [hoveredSeries, setHoveredSeries] = React.useState<string | null>(null)
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    series: string
    axis: string
    value: number
    x: number
    y: number
  } | null>(null)
  const [tooltipPosition, setTooltipPosition] = React.useState<{
    x: number
    y: number
  } | null>(null)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const radius = Math.min(innerWidth, innerHeight) / 2
  const centerX = innerWidth / 2
  const centerY = innerHeight / 2

  // Get all axes from data
  const axes = React.useMemo(() => {
    const axisSet = new Set<string>()
    data.forEach((series) => {
      series.data.forEach((d) => axisSet.add(d.axis))
    })
    return Array.from(axisSet)
  }, [data])

  const angleSlice = (2 * Math.PI) / axes.length

  // Calculate max value
  const maxValue =
    maxValueProp ??
    Math.max(...data.flatMap((s) => s.data.map((d) => d.value))) * 1.1

  // Radial scale
  const rScale = scaleLinear().domain([0, maxValue]).range([0, radius])

  // Get coordinates for a data point
  const getPoint = (axis: string, value: number) => {
    const index = axes.indexOf(axis)
    const angle = angleSlice * index - Math.PI / 2
    const r = rScale(value)
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    }
  }

  // Generate radar area path
  const radarLine = lineRadial<RadarChartDataPoint>()
    .angle((d) => axes.indexOf(d.axis) * angleSlice)
    .radius((d) => rScale(d.value))
    .curve(curveLinearClosed)

  // Generate polygon path for grid
  const generatePolygonPath = (levelRadius: number): string => {
    const points: string[] = []
    for (let i = 0; i < axes.length; i++) {
      const angle = angleSlice * i - Math.PI / 2
      const x = centerX + levelRadius * Math.cos(angle)
      const y = centerY + levelRadius * Math.sin(angle)
      points.push(`${x},${y}`)
    }
    return `M ${points.join(" L ")} Z`
  }

  // Get color for series
  const getSeriesColor = (series: RadarChartSeries, index: number): string => {
    return (
      series.color ??
      config?.[series.name]?.color ??
      `var(--chart-${(index % 5) + 1})`
    )
  }

  // Legend items
  const legendItems: LegendItem[] = data.map((series, i) => ({
    name: series.name,
    color: getSeriesColor(series, i),
  }))

  // Get sorted data for a series
  const getSortedData = (series: RadarChartSeries) => {
    return axes.map((axis) => {
      const point = series.data.find((d) => d.axis === axis)
      return { axis, value: point?.value ?? 0 }
    })
  }

  // Handle area hover
  const handleAreaEnter = (series: RadarChartSeries) => {
    setHoveredSeries(series.name)
  }

  const handleAreaLeave = () => {
    setHoveredSeries(null)
    setTooltipPosition(null)
  }

  // Handle area mouse move for tooltip positioning
  const handleAreaMove = (
    e: React.MouseEvent<SVGPathElement>,
    series: RadarChartSeries,
    seriesIndex: number
  ) => {
    const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect()
    if (svgRect) {
      const x = e.clientX - svgRect.left
      const y = e.clientY - svgRect.top
      setTooltipPosition({ x, y })
      setHoveredSeries(series.name)
    }
  }

  return (
    <ChartContainer
      config={config}
      className={cn("relative !aspect-auto flex-col", className)}
    >
      <div className="relative mx-auto aspect-square w-full max-w-[320px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Filled grid background for 'filled' variant */}
            {variant === "filled" && showGrid && (
              <path
                d={generatePolygonPath(radius)}
                fill="currentColor"
                className="text-primary/10"
              />
            )}

            {/* Grid levels */}
            {showGrid &&
              levels > 0 &&
              Array.from({ length: levels }, (_, i) => {
                const levelRadius = (radius / levels) * (i + 1)

                if (gridType === "circle") {
                  return (
                    <circle
                      key={i}
                      cx={centerX}
                      cy={centerY}
                      r={levelRadius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={i === levels - 1 ? 1 : 0.5}
                      strokeOpacity={i === levels - 1 ? 0.5 : 0.3}
                      className="text-border"
                    />
                  )
                }

                return (
                  <path
                    key={i}
                    d={generatePolygonPath(levelRadius)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={0.5}
                    strokeOpacity={0.3}
                    className="text-border"
                  />
                )
              })}

            {/* Radial lines (axis lines from center) */}
            {showRadialLines &&
              axes.map((axis, i) => {
                const angle = angleSlice * i - Math.PI / 2
                const x2 = centerX + radius * Math.cos(angle)
                const y2 = centerY + radius * Math.sin(angle)
                return (
                  <line
                    key={axis}
                    x1={centerX}
                    y1={centerY}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth={0.5}
                    strokeOpacity={0.3}
                    className="text-border"
                  />
                )
              })}

            {/* Axis labels */}
            {showLabels &&
              axes.map((axis, i) => {
                const angle = angleSlice * i - Math.PI / 2
                const x = centerX + (radius + labelOffset) * Math.cos(angle)
                const y = centerY + (radius + labelOffset) * Math.sin(angle)

                // For 'labels' variant, show values alongside axis names
                if (variant === "labels") {
                  const values = data.map((series) => {
                    const point = series.data.find((d) => d.axis === axis)
                    return point?.value ?? 0
                  })

                  return (
                    <g key={axis}>
                      <text
                        x={x}
                        y={y - (i === 0 ? 8 : 0)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-[13px] font-medium"
                      >
                        {values.length > 1 ? (
                          <>
                            <tspan>{values[0]}</tspan>
                            <tspan className="fill-muted-foreground">/</tspan>
                            <tspan>{values[1]}</tspan>
                          </>
                        ) : (
                          values[0]
                        )}
                      </text>
                      <text
                        x={x}
                        y={y + (i === 0 ? 8 : 14)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-[11px]"
                      >
                        {axis}
                      </text>
                    </g>
                  )
                }

                return (
                  <text
                    key={axis}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[11px]"
                  >
                    {axis}
                  </text>
                )
              })}

            {/* Level labels */}
            {showLevelLabels &&
              levels > 0 &&
              Array.from({ length: levels }, (_, i) => {
                const levelValue = (maxValue / levels) * (i + 1)
                const levelRadius = (radius / levels) * (i + 1)
                return (
                  <text
                    key={i}
                    x={centerX + 4}
                    y={centerY - levelRadius}
                    className="fill-muted-foreground text-[9px]"
                    dominantBaseline="middle"
                  >
                    {levelValue.toFixed(0)}
                  </text>
                )
              })}

            {/* Radar areas */}
            {data.map((series, seriesIndex) => {
              const color = getSeriesColor(series, seriesIndex)
              const isHovered =
                hoveredSeries === null || hoveredSeries === series.name
              const sortedData = getSortedData(series)
              const seriesFillOpacity = series.fillOpacity ?? fillOpacity

              return (
                <g key={series.name}>
                  {/* Invisible hit area for better mouse interaction */}
                  <path
                    d={radarLine(sortedData) ?? ""}
                    transform={`translate(${centerX}, ${centerY})`}
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth={20}
                    className="cursor-pointer"
                    style={{ pointerEvents: "stroke" }}
                    onMouseEnter={() => handleAreaEnter(series)}
                    onMouseMove={(e) => handleAreaMove(e, series, seriesIndex)}
                    onMouseLeave={handleAreaLeave}
                  />

                  {/* Visible Area */}
                  <path
                    d={radarLine(sortedData) ?? ""}
                    transform={`translate(${centerX}, ${centerY})`}
                    fill={color}
                    fillOpacity={seriesFillOpacity}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    className={cn(
                      "cursor-pointer transition-opacity duration-200",
                      !isHovered && "opacity-30"
                    )}
                    style={{ pointerEvents: "visiblePainted" }}
                    onMouseEnter={() => handleAreaEnter(series)}
                    onMouseMove={(e) => handleAreaMove(e, series, seriesIndex)}
                    onMouseLeave={handleAreaLeave}
                  />

                  {/* Dots */}
                  {showDots &&
                    sortedData.map((d) => {
                      const point = getPoint(d.axis, d.value)
                      const isPointHovered =
                        hoveredPoint?.series === series.name &&
                        hoveredPoint?.axis === d.axis

                      return (
                        <circle
                          key={d.axis}
                          cx={point.x}
                          cy={point.y}
                          r={isPointHovered ? dotSize * 1.5 : dotSize}
                          fill={color}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                          className={cn(
                            "cursor-pointer transition-all duration-200",
                            !isHovered && "opacity-30"
                          )}
                          onMouseEnter={() =>
                            setHoveredPoint({
                              series: series.name,
                              axis: d.axis,
                              value: d.value,
                              x: point.x,
                              y: point.y,
                            })
                          }
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      )
                    })}
                </g>
              )
            })}
          </g>
        </svg>

        {/* Tooltip for dot hover */}
        {showTooltip && hoveredPoint && (
          <div
            className="pointer-events-none absolute z-50"
            style={{
              left: margin.left + hoveredPoint.x,
              top: margin.top + hoveredPoint.y - 10,
            }}
          >
            <div className="border-border/50 bg-background -translate-x-1/2 -translate-y-full rounded-lg border px-3 py-2 text-xs shadow-xl">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: getSeriesColor(
                      data.find((s) => s.name === hoveredPoint.series)!,
                      data.findIndex((s) => s.name === hoveredPoint.series)
                    ),
                  }}
                />
                <span className="font-medium">{hoveredPoint.series}</span>
              </div>
              <div className="text-muted-foreground mt-1">
                {hoveredPoint.axis}: {hoveredPoint.value.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Tooltip for area hover (when no dot is hovered) */}
        {showTooltip &&
          !hoveredPoint &&
          hoveredSeries &&
          tooltipPosition &&
          data.length > 0 && (
            <div
              className="pointer-events-none absolute z-50"
              style={{
                left: tooltipPosition.x + 15,
                top: tooltipPosition.y - 10,
              }}
            >
              <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
                <div className="flex items-center gap-2 font-medium">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: getSeriesColor(
                        data.find((s) => s.name === hoveredSeries)!,
                        data.findIndex((s) => s.name === hoveredSeries)
                      ),
                    }}
                  />
                  {hoveredSeries}
                </div>
                <div className="text-muted-foreground mt-1.5 space-y-0.5">
                  {data
                    .find((s) => s.name === hoveredSeries)
                    ?.data.map((d) => (
                      <div key={d.axis} className="flex justify-between gap-3">
                        <span>{d.axis}:</span>
                        <span className="text-foreground font-medium">
                          {d.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Legend */}
      {showLegend && data.length > 1 && (
        <ChartLegend items={legendItems} onItemHover={setHoveredSeries} />
      )}
    </ChartContainer>
  )
}
