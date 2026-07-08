"use client"

import * as React from "react"
import { bin, extent, max } from "d3-array"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import {
  ChartZoomResetButton,
  ChartZoomSelectionRect,
  useChartZoom,
} from "../chart-zoom"

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
  color = "var(--chart-1)",
  valueFormatter = (value) => value.toLocaleString(),
}: DotPlotChartProps) {
  const [hoveredBin, setHoveredBin] = React.useState<number | null>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)
  // Drag-to-zoom range over the (continuous) value domain — unlike the
  // band-scale charts, there's no fixed category count here, so the zoom
  // window is a pair of raw values rather than data indices.
  const [zoomDomain, setZoomDomain] = React.useState<[number, number] | null>(
    null
  )
  const isZoomed = zoomDomain !== null

  // Reset any active zoom if the underlying data set changes.
  React.useEffect(() => {
    setZoomDomain(null)
  }, [data])

  // Normalize data to array of values
  const values = React.useMemo(() => {
    return data.map((d) => (typeof d === "number" ? d : d.value))
  }, [data])

  // Get colors if provided
  const colors = React.useMemo(() => {
    return data.map((d) => (typeof d === "number" ? color : (d.color ?? color)))
  }, [data, color])

  // Values/colors narrowed to the active zoom window, if any — filtered
  // (not rescaled) so the bins below re-derive purely from what's visible.
  const plotValues = React.useMemo(() => {
    if (!zoomDomain) return values
    const [lo, hi] = zoomDomain
    return values.filter((v) => v >= lo && v <= hi)
  }, [values, zoomDomain])

  const plotColors = React.useMemo(() => {
    if (!zoomDomain) return colors
    const [lo, hi] = zoomDomain
    return values.reduce<string[]>((acc, v, i) => {
      if (v >= lo && v <= hi) acc.push(colors[i])
      return acc
    }, [])
  }, [values, colors, zoomDomain])

  const width = 500
  const margin = { top: 20, right: 20, bottom: xAxisLabel ? 60 : 40, left: 20 }

  const innerWidth = width - margin.left - margin.right

  // Create bins
  const binnedData = React.useMemo(() => {
    const [minVal, maxVal] = extent(plotValues) as [number, number]
    const binGenerator = bin().domain([minVal, maxVal]).thresholds(binCount)

    const bins = binGenerator(plotValues)

    // For each bin, track individual dots with their colors
    return bins.map((b) => {
      const dots: { value: number; color: string }[] = []
      b.forEach((val) => {
        // Find the actual index considering duplicates
        let foundCount = 0
        for (let i = 0; i < plotValues.length; i++) {
          if (plotValues[i] === val) {
            if (foundCount === dots.filter((d) => d.value === val).length) {
              dots.push({ value: val, color: plotColors[i] })
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
  }, [plotValues, plotColors, binCount])

  // Calculate max stack height
  const maxCount = max(binnedData, (d) => d.count) ?? 0

  // Dynamic height based on max stack
  const dotTotalSize = dotSize + dotSpacing
  const innerHeight = Math.max(maxCount * dotTotalSize + 20, 100)
  const height = innerHeight + margin.top + margin.bottom

  // Scales
  const xScale = React.useMemo(() => {
    const [minVal, maxVal] = extent(plotValues) as [number, number]
    const padding = (maxVal - minVal) * 0.05
    return scaleLinear()
      .domain([minVal - padding, maxVal + padding])
      .range([0, innerWidth])
      .nice()
  }, [plotValues, innerWidth])

  const xTicks = xScale.ticks(7)

  // Drag-to-zoom: converts the pixel drag range into a value-domain range
  // (continuous scale, so we invert directly rather than using
  // getBandScaleIndexRange) and narrows the view to it. Re-zooming while
  // already zoomed narrows further, since xScale is derived from the
  // current (possibly already-zoomed) plotValues.
  const zoom = useChartZoom({
    svgRef,
    marginLeft: margin.left,
    innerWidth,
    onZoom: ({ x0, x1 }) => {
      const lo = xScale.invert(x0)
      const hi = xScale.invert(x1)
      const hasPointsInRange = values.some((v) => v >= lo && v <= hi)
      if (hasPointsInRange) setZoomDomain([lo, hi])
    },
    onReset: () => setZoomDomain(null),
  })

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
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible select-none"
        onMouseDown={zoom.handlers.onMouseDown}
        onMouseMove={zoom.handlers.onMouseMove}
        onMouseUp={zoom.handlers.onMouseUp}
        onMouseLeave={zoom.handlers.onMouseLeave}
        onDoubleClick={zoom.handlers.onDoubleClick}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Drag-to-zoom selection rectangle */}
          <ChartZoomSelectionRect range={zoom.dragRange} height={innerHeight} />

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
            {Math.round(binnedData[hoveredBin].x0)}-
            {Math.round(binnedData[hoveredBin].x1)}:{" "}
            {binnedData[hoveredBin].count}
          </div>
        </div>
      )}

      <ChartZoomResetButton
        visible={isZoomed}
        onReset={() => setZoomDomain(null)}
      />
    </div>
  )
}
