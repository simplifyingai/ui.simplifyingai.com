"use client"

import * as React from "react"
import { contours } from "d3-contour"
import { geoPath } from "d3-geo"
import { interpolateRgb } from "d3-interpolate"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartGrid } from "../chart-grid"

export interface ContourPoint {
  x: number
  y: number
  value?: number
}

export interface ContourChartProps extends BaseChartProps {
  /** 2D array of z values (grid data) */
  data: number[][]
  /** Optional scatter points to display on top */
  points?: ContourPoint[]
  xDomain?: [number, number]
  yDomain?: [number, number]
  /** Number of contour levels */
  levels?: number
  /** Color scale - supports 2-7 colors for gradient */
  colorScale?: string[]
  /** Show filled contour regions */
  showFill?: boolean
  /** Show contour lines */
  showLines?: boolean
  /** Contour line width */
  lineWidth?: number
  /** Line color (defaults to darker shade of fill) */
  lineColor?: string
  /** Show data point markers */
  showMarkers?: boolean
  /** Marker symbol: "x", "cross", "circle", "diamond" */
  markerSymbol?: "x" | "cross" | "circle" | "diamond"
  /** Marker size */
  markerSize?: number
  /** Marker color */
  markerColor?: string
  xAxisLabel?: string
  yAxisLabel?: string
  /** Smoothing factor for contours (higher = smoother) */
  bandwidth?: number
}

// Predefined color scales
export const CONTOUR_COLOR_SCALES = {
  // Rainbow (like the image)
  rainbow: ["#0000ff", "#00ffff", "#00ff00", "#ffff00", "#ff8000", "#ff0000"],
  // Viridis-like
  viridis: ["#440154", "#414487", "#2a788e", "#22a884", "#7ad151", "#fde725"],
  // Cool to warm
  coolwarm: [
    "#3b4cc0",
    "#7092c0",
    "#aac7fd",
    "#f7f7f7",
    "#f4a582",
    "#d6604d",
    "#b40426",
  ],
  // Ocean
  ocean: [
    "#023858",
    "#045a8d",
    "#0570b0",
    "#3690c0",
    "#74a9cf",
    "#a6bddb",
    "#d0d1e6",
  ],
  // Thermal
  thermal: ["#0d0887", "#6a00a8", "#b12a90", "#e16462", "#fca636", "#f0f921"],
  // Default blue
  blue: ["#eff6ff", "#3b82f6", "#1e3a8a"],
}

export function ContourChart({
  data,
  points,
  config,
  className,
  width = 600,
  height = 400,
  margin = { top: 20, right: 80, bottom: 50, left: 60 },
  showGrid = true,
  showTooltip = true,
  xDomain,
  yDomain,
  levels = 10,
  colorScale = CONTOUR_COLOR_SCALES.rainbow,
  showFill = true,
  showLines = true,
  lineWidth = 0.5,
  lineColor,
  showMarkers = true,
  markerSymbol = "x",
  markerSize = 8,
  markerColor = "#333333",
  xAxisLabel,
  yAxisLabel,
  bandwidth = 1,
}: ContourChartProps) {
  const [mousePos, setMousePos] = React.useState<{
    x: number
    y: number
    value: number
  } | null>(null)

  const gradientId = React.useId().replace(/:/g, "")
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const rows = data.length
  const cols = data[0]?.length ?? 0

  // Calculate value range
  const allValues = data.flat()
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)

  // Scales
  const actualXDomain = xDomain ?? [0, cols - 1]
  const actualYDomain = yDomain ?? [0, rows - 1]

  const xScale = scaleLinear().domain(actualXDomain).range([0, innerWidth])
  const yScale = scaleLinear().domain(actualYDomain).range([innerHeight, 0])
  const valueScale = scaleLinear().domain([minValue, maxValue]).range([0, 1])

  // Color interpolator for multiple colors
  const getColor = React.useCallback(
    (value: number) => {
      const t = valueScale(value)
      const n = colorScale.length - 1
      const segment = Math.min(Math.floor(t * n), n - 1)
      const localT = t * n - segment
      return interpolateRgb(
        colorScale[segment],
        colorScale[segment + 1]
      )(localT)
    },
    [colorScale, valueScale]
  )

  // Generate contours using d3-contour
  const contourGenerator = React.useMemo(() => {
    const thresholds = Array.from(
      { length: levels + 1 },
      (_, i) => minValue + ((maxValue - minValue) * i) / levels
    )
    return contours().size([cols, rows]).thresholds(thresholds)
  }, [cols, rows, levels, minValue, maxValue])

  // Flatten data for d3-contour (expects 1D array)
  const flatData = React.useMemo(() => {
    // d3-contour expects row-major order, bottom to top
    const result: number[] = []
    for (let j = rows - 1; j >= 0; j--) {
      for (let i = 0; i < cols; i++) {
        result.push(data[j][i])
      }
    }
    return result
  }, [data, rows, cols])

  // Generate contour paths
  const contourPaths = React.useMemo(() => {
    return contourGenerator(flatData)
  }, [contourGenerator, flatData])

  // Path generator that transforms from grid coords to screen coords
  const pathGenerator = React.useMemo(() => {
    return geoPath().projection({
      stream: (s) => ({
        point: (x: number, y: number) => {
          // Transform from grid coordinates to screen coordinates
          const screenX = (x / (cols - 1)) * innerWidth
          const screenY = innerHeight - (y / (rows - 1)) * innerHeight
          s.point(screenX, screenY)
        },
        lineStart: () => s.lineStart(),
        lineEnd: () => s.lineEnd(),
        polygonStart: () => s.polygonStart(),
        polygonEnd: () => s.polygonEnd(),
        sphere: () => {},
      }),
    })
  }, [cols, rows, innerWidth, innerHeight])

  // Generate marker path based on symbol
  const getMarkerPath = React.useCallback(
    (cx: number, cy: number) => {
      const s = markerSize / 2
      switch (markerSymbol) {
        case "x":
          return `M${cx - s},${cy - s}L${cx + s},${cy + s}M${cx + s},${cy - s}L${cx - s},${cy + s}`
        case "cross":
          return `M${cx},${cy - s}L${cx},${cy + s}M${cx - s},${cy}L${cx + s},${cy}`
        case "diamond":
          return `M${cx},${cy - s}L${cx + s},${cy}L${cx},${cy + s}L${cx - s},${cy}Z`
        case "circle":
        default:
          return ""
      }
    },
    [markerSize, markerSymbol]
  )

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - margin.left
    const y = e.clientY - rect.top - margin.top

    if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) {
      setMousePos(null)
      return
    }

    const dataX = Math.round((x / innerWidth) * (cols - 1))
    const dataY = Math.round(((innerHeight - y) / innerHeight) * (rows - 1))

    if (dataX >= 0 && dataX < cols && dataY >= 0 && dataY < rows) {
      setMousePos({
        x: xScale.invert(x),
        y: yScale.invert(y),
        value: data[dataY]?.[dataX] ?? 0,
      })
    }
  }

  // Generate grid points for markers
  const gridPoints = React.useMemo(() => {
    if (!showMarkers && !points) return []

    if (points) {
      return points.map((p) => ({
        x: xScale(p.x),
        y: yScale(p.y),
        value: p.value,
      }))
    }

    // Generate markers at grid intersections
    const result: { x: number; y: number; value: number }[] = []
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const gridX =
          actualXDomain[0] +
          ((actualXDomain[1] - actualXDomain[0]) * i) / (cols - 1)
        const gridY =
          actualYDomain[0] +
          ((actualYDomain[1] - actualYDomain[0]) * j) / (rows - 1)
        result.push({
          x: xScale(gridX),
          y: yScale(gridY),
          value: data[j][i],
        })
      }
    }
    return result
  }, [
    showMarkers,
    points,
    data,
    rows,
    cols,
    xScale,
    yScale,
    actualXDomain,
    actualYDomain,
  ])

  return (
    <ChartContainer
      config={config}
      className={cn("!aspect-auto flex-col", className)}
    >
      <div className="w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos(null)}
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Clip path for contours */}
            <defs>
              <clipPath id={`clip-${gradientId}`}>
                <rect width={innerWidth} height={innerHeight} />
              </clipPath>
            </defs>

            {/* Filled contours */}
            {showFill && (
              <g clipPath={`url(#clip-${gradientId})`}>
                {contourPaths.map((contour, i) => (
                  <path
                    key={`fill-${i}`}
                    d={pathGenerator(contour) || ""}
                    fill={getColor(contour.value)}
                    fillOpacity={0.9}
                    className="pointer-events-none"
                  />
                ))}
              </g>
            )}

            {/* Contour lines */}
            {showLines && (
              <g clipPath={`url(#clip-${gradientId})`}>
                {contourPaths.map((contour, i) => (
                  <path
                    key={`line-${i}`}
                    d={pathGenerator(contour) || ""}
                    fill="none"
                    stroke={lineColor || "rgba(0,0,0,0.3)"}
                    strokeWidth={lineWidth}
                    className="pointer-events-none"
                  />
                ))}
              </g>
            )}

            {/* Grid */}
            {showGrid && (
              <ChartGrid
                xScale={xScale}
                yScale={yScale}
                width={innerWidth}
                height={innerHeight}
              />
            )}

            {/* Data point markers */}
            {showMarkers &&
              gridPoints.map((point, i) =>
                markerSymbol === "circle" ? (
                  <circle
                    key={`marker-${i}`}
                    cx={point.x}
                    cy={point.y}
                    r={markerSize / 2}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth={1.5}
                    className="pointer-events-none"
                  />
                ) : (
                  <path
                    key={`marker-${i}`}
                    d={getMarkerPath(point.x, point.y)}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth={1.5}
                    className="pointer-events-none"
                  />
                )
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
          <g
            transform={`translate(${width - margin.right + 15}, ${margin.top})`}
          >
            <defs>
              <linearGradient
                id={`contour-gradient-${gradientId}`}
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                {colorScale.map((color, i) => (
                  <stop
                    key={i}
                    offset={`${(i / (colorScale.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </linearGradient>
            </defs>
            <rect
              width={15}
              height={innerHeight}
              fill={`url(#contour-gradient-${gradientId})`}
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
      </div>

      {/* Tooltip */}
      {showTooltip && mousePos && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: margin.left + xScale(mousePos.x),
            top: margin.top + yScale(mousePos.y),
          }}
        >
          <div className="border-border/50 bg-background -mt-2 -translate-x-1/2 -translate-y-full rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
            <div className="text-muted-foreground">
              x: {mousePos.x.toFixed(2)}, y: {mousePos.y.toFixed(2)}
            </div>
            <div className="font-medium">
              Value: {mousePos.value.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  )
}
