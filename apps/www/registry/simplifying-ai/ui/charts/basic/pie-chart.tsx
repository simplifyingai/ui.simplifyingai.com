"use client"

import * as React from "react"
import { arc, pie, type PieArcDatum } from "d3-shape"

import { cn } from "@/lib/utils"

import type { BaseChartProps, ChartConfig } from "../chart-config"
import { ChartContainer } from "../chart-container"
import { ChartLegend, type LegendItem } from "../chart-legend"

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface PieChartDataPoint {
  label: string
  value: number
  color?: string
  [key: string]: unknown
}

export interface PieChartProps extends BaseChartProps {
  /** Data points for the pie chart */
  data: PieChartDataPoint[]
  /** Inner radius (0 for pie, > 0 for donut) */
  innerRadius?: number
  /** Outer radius */
  outerRadius?: number
  /** Padding angle between segments */
  padAngle?: number
  /** Corner radius for rounded segments */
  cornerRadius?: number
  /** Starting angle in radians */
  startAngle?: number
  /** Ending angle in radians */
  endAngle?: number
  /** Sort values by size */
  sortValues?: boolean
  /** Show labels on segments */
  showLabels?: boolean
  /** Label display type */
  labelType?: "percent" | "value" | "label"
  /** Chart variant */
  variant?:
    | "default"
    | "donut"
    | "donut-active"
    | "donut-text"
    | "label"
    | "interactive"
  /** Active segment index (for donut-active variant) */
  activeIndex?: number
  /** Center label text (for donut-text variant) */
  centerLabel?: React.ReactNode
  /** Center value text (for donut-text variant) */
  centerValue?: React.ReactNode
  /** Show total in center (for donut-text variant) */
  showTotal?: boolean
  /** Value formatter */
  valueFormatter?: (value: number, total: number) => string
  /** Callback when segment is clicked */
  onSegmentClick?: (data: PieChartDataPoint, index: number) => void
  /** Interactive selection options (for interactive variant) */
  selectionOptions?: { key: string; label: string }[]
  /** Selected key (for interactive variant) */
  selectedKey?: string
  /** On selection change (for interactive variant) */
  onSelectionChange?: (key: string) => void
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

// ============================================================================
// Component
// ============================================================================

export function PieChart({
  data,
  config,
  className,
  width = 400,
  height = 400,
  margin: marginProp,
  showTooltip = true,
  showLegend: showLegendProp,
  innerRadius: innerRadiusProp,
  outerRadius: outerRadiusProp,
  padAngle: padAngleProp,
  cornerRadius: cornerRadiusProp,
  startAngle = 0,
  endAngle = 2 * Math.PI,
  sortValues = false,
  showLabels: showLabelsProp,
  labelType = "percent",
  variant = "default",
  activeIndex: activeIndexProp,
  centerLabel,
  centerValue,
  showTotal = true,
  valueFormatter = (value, total) => `${((value / total) * 100).toFixed(1)}%`,
  onSegmentClick,
  selectionOptions,
  selectedKey,
  onSelectionChange,
}: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [internalActiveIndex, setInternalActiveIndex] = React.useState(0)
  const [internalSelectedKey, setInternalSelectedKey] = React.useState(
    selectedKey ?? selectionOptions?.[0]?.key ?? ""
  )
  // Legend/slice click-to-isolate: null shows all segments, a label shows
  // only that one (others dimmed). Independent of the "interactive" variant's
  // selectedKey mechanism, which is always-one-active with no "show all" state.
  const [activeSeries, setActiveSeries] = React.useState<string | null>(null)

  // Variant-specific defaults
  const getVariantDefaults = () => {
    switch (variant) {
      case "donut":
        return {
          innerRadius: 60,
          padAngle: 0.02,
          cornerRadius: 0,
          showLabels: false,
          showLegend: true,
          margin: { top: 20, right: 20, bottom: 20, left: 20 },
        }
      case "donut-active":
        return {
          innerRadius: 60,
          padAngle: 0.02,
          cornerRadius: 0,
          showLabels: false,
          showLegend: true,
          margin: { top: 20, right: 20, bottom: 20, left: 20 },
        }
      case "donut-text":
        return {
          innerRadius: 60,
          padAngle: 0.02,
          cornerRadius: 0,
          showLabels: false,
          showLegend: true,
          margin: { top: 20, right: 20, bottom: 20, left: 20 },
        }
      case "label":
        return {
          innerRadius: 0,
          padAngle: 0.02,
          cornerRadius: 0,
          showLabels: true,
          showLegend: true,
          margin: { top: 40, right: 40, bottom: 40, left: 40 },
        }
      case "interactive":
        return {
          innerRadius: 60,
          padAngle: 0.02,
          cornerRadius: 0,
          showLabels: false,
          showLegend: false,
          margin: { top: 20, right: 20, bottom: 20, left: 20 },
        }
      default:
        return {
          innerRadius: 0,
          padAngle: 0.02,
          cornerRadius: 4,
          showLabels: false,
          showLegend: true,
          margin: { top: 20, right: 20, bottom: 20, left: 20 },
        }
    }
  }

  const defaults = getVariantDefaults()
  const margin = marginProp ?? defaults.margin
  const innerRadius = innerRadiusProp ?? defaults.innerRadius
  const padAngle = padAngleProp ?? defaults.padAngle
  const cornerRadius = cornerRadiusProp ?? defaults.cornerRadius
  const showLabels = showLabelsProp ?? defaults.showLabels
  const showLegend = showLegendProp ?? defaults.showLegend

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const radius = Math.min(innerWidth, innerHeight) / 2
  const outerRadius = outerRadiusProp ?? radius

  // Handle interactive variant selection
  const effectiveSelectedKey = selectedKey ?? internalSelectedKey
  const handleSelectionChange = (key: string) => {
    setInternalSelectedKey(key)
    onSelectionChange?.(key)
    // Update active index when selection changes in interactive mode
    const newIndex = data.findIndex(
      (d) => d.label.toLowerCase() === key.toLowerCase()
    )
    if (newIndex >= 0) {
      setInternalActiveIndex(newIndex)
    }
  }

  // Calculate total
  const total = data.reduce((sum, d) => sum + d.value, 0)

  // Active index handling
  const activeIndex =
    variant === "donut-active" || variant === "interactive"
      ? (activeIndexProp ?? internalActiveIndex)
      : hoveredIndex

  const isSeriesVisible = React.useCallback(
    (name: string) => activeSeries === null || activeSeries === name,
    [activeSeries]
  )

  // Index of the isolated segment, used as a fallback for center-text
  // display when nothing is actively hovered. Doesn't apply to
  // "donut-active"/"interactive" variants, which manage their own
  // always-one-active index.
  const isolatedIndex = React.useMemo(() => {
    if (variant === "donut-active" || variant === "interactive") return null
    if (activeSeries === null) return null
    const idx = data.findIndex((d) => d.label === activeSeries)
    return idx >= 0 ? idx : null
  }, [variant, activeSeries, data])

  // Create pie generator
  const pieGenerator = React.useMemo(() => {
    const gen = pie<PieChartDataPoint>()
      .value((d) => d.value)
      .padAngle(padAngle)
      .startAngle(startAngle)
      .endAngle(endAngle)

    if (sortValues) {
      return gen.sort((a, b) => b.value - a.value)
    }
    return gen.sort(null)
  }, [padAngle, startAngle, endAngle, sortValues])

  // Arc datum type
  type ArcDatum = PieArcDatum<PieChartDataPoint>

  // Create arc generators
  const arcGenerator = arc<ArcDatum>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(cornerRadius)

  // Active arc (slightly larger)
  const activeArcGenerator = arc<ArcDatum>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius + 10)
    .cornerRadius(cornerRadius)

  // Interactive double-ring arc for active segment
  const interactiveOuterArcGenerator = arc<ArcDatum>()
    .innerRadius(outerRadius + 12)
    .outerRadius(outerRadius + 25)
    .cornerRadius(cornerRadius)

  // Label arc (for positioning external labels)
  const labelArcGenerator = arc<ArcDatum>()
    .innerRadius(outerRadius * 0.7)
    .outerRadius(outerRadius * 0.7)

  // External label arc (for label variant)
  const externalLabelArcGenerator = arc<ArcDatum>()
    .innerRadius(outerRadius + 15)
    .outerRadius(outerRadius + 15)

  const arcs = pieGenerator(data)

  // Get color for segment
  const getColor = (d: PieChartDataPoint, index: number): string => {
    if (d.color) return d.color
    const configItem = config?.[d.label]
    if (configItem && "color" in configItem && configItem.color) {
      return configItem.color
    }
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }

  // Format label
  const formatLabel = (d: PieChartDataPoint): string => {
    switch (labelType) {
      case "percent":
        return valueFormatter(d.value, total)
      case "value":
        return d.value.toLocaleString()
      case "label":
        return d.label
      default:
        return ""
    }
  }

  // Legend items
  const legendItems: LegendItem[] = data.map((d, i) => ({
    name: d.label,
    color: getColor(d, i),
    value: d.value,
  }))

  // Center content for donut-text variant
  const displayedCenterValue = React.useMemo(() => {
    if (variant === "donut-text" || variant === "interactive") {
      const idx = activeIndex ?? isolatedIndex
      if (idx !== null) {
        return data[idx]?.value.toLocaleString() ?? ""
      }
      return centerValue ?? (showTotal ? total.toLocaleString() : null)
    }
    return null
  }, [variant, activeIndex, isolatedIndex, data, centerValue, showTotal, total])

  const displayedCenterLabel = React.useMemo(() => {
    if (variant === "donut-text" || variant === "interactive") {
      const idx = activeIndex ?? isolatedIndex
      if (idx !== null) {
        return data[idx]?.label ?? ""
      }
      return centerLabel ?? (showTotal ? "Total" : null)
    }
    return null
  }, [variant, activeIndex, isolatedIndex, data, centerLabel, showTotal])

  // Handle segment interaction
  const handleSegmentEnter = (index: number) => {
    if (variant === "donut-active" || variant === "interactive") {
      setInternalActiveIndex(index)
    }
    setHoveredIndex(index)
  }

  const handleSegmentLeave = () => {
    setHoveredIndex(null)
  }

  // Isolate a segment by label. The "interactive" variant already has its
  // own always-one-active selection mechanism (selectionOptions/selectedKey)
  // driven by a dropdown — reuse that state instead of introducing a second,
  // parallel isolate mechanism. Every other variant uses the standard
  // toggle-to-isolate/click-again-to-restore activeSeries pattern.
  const applyIsolate = (label: string) => {
    if (variant === "interactive" && selectionOptions) {
      const option = selectionOptions.find(
        (o) => o.label.toLowerCase() === label.toLowerCase()
      )
      if (option) {
        handleSelectionChange(option.key)
      }
      return
    }
    setActiveSeries((prev) => (prev === label ? null : label))
  }

  const handleSegmentClick = (d: PieChartDataPoint, index: number) => {
    onSegmentClick?.(d, index)
    applyIsolate(d.label)
  }

  // Drives the legend's onItemClick — shares the same isolate state as
  // clicking a slice directly (via applyIsolate above).
  const handleLegendClick = (name: string) => {
    applyIsolate(name)
  }

  const isLegendItemActive = (name: string) => {
    if (variant === "interactive" && selectionOptions) {
      const option = selectionOptions.find(
        (o) => o.label.toLowerCase() === name.toLowerCase()
      )
      return option ? option.key === effectiveSelectedKey : true
    }
    return isSeriesVisible(name)
  }

  return (
    <ChartContainer
      config={config}
      className={cn("relative !aspect-auto flex-col", className)}
    >
      {/* Interactive selector dropdown */}
      {variant === "interactive" && selectionOptions && (
        <div className="absolute top-4 right-4 z-10">
          <select
            value={effectiveSelectedKey}
            onChange={(e) => handleSelectionChange(e.target.value)}
            className="bg-background border-input text-foreground focus:ring-ring rounded-lg border px-3 py-1.5 text-sm shadow-sm focus:ring-2 focus:outline-none"
          >
            {selectionOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="relative mx-auto aspect-square w-full max-w-[280px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
        >
          <g
            transform={`translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight / 2})`}
          >
            {arcs.map((arcData, index) => {
              const isActive = activeIndex === index
              const isHovered = hoveredIndex === index
              const color = getColor(data[index], index)
              // The "interactive" variant renders every segment regardless
              // of isolate state (it has its own always-one-active spotlight
              // look); other variants heavily dim segments isolated out via
              // the legend/slice click-to-isolate feature.
              const isVisible =
                variant === "interactive" ||
                isSeriesVisible(data[index].label)
              const shouldExpand =
                isVisible &&
                ((variant === "donut-active" && isActive) ||
                  (variant === "interactive" && isActive) ||
                  (variant !== "donut-active" &&
                    variant !== "interactive" &&
                    isHovered))

              return (
                <g key={index}>
                  {/* Pie segment */}
                  <path
                    d={
                      (shouldExpand ? activeArcGenerator : arcGenerator)(
                        arcData
                      ) ?? ""
                    }
                    fill={color}
                    stroke="hsl(var(--background))"
                    strokeWidth={variant === "label" ? 0 : 2}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      (activeIndex !== null || hoveredIndex !== null) &&
                        !isActive &&
                        !isHovered &&
                        "opacity-50",
                      !isVisible && "opacity-15"
                    )}
                    onMouseEnter={() => handleSegmentEnter(index)}
                    onMouseLeave={handleSegmentLeave}
                    onClick={() => handleSegmentClick(data[index], index)}
                  />

                  {/* Interactive outer ring for active segment */}
                  {variant === "interactive" && isActive && (
                    <path
                      d={interactiveOuterArcGenerator(arcData) ?? ""}
                      fill={color}
                      className="pointer-events-none"
                    />
                  )}

                  {/* Internal labels (for label variant) */}
                  {showLabels && variant === "label" && isVisible && (
                    <text
                      transform={`translate(${labelArcGenerator.centroid(arcData)})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground pointer-events-none text-[11px] font-medium"
                    >
                      {data[index].value}
                    </text>
                  )}

                  {/* External labels with lines (for label variant) */}
                  {variant === "label" && isVisible && (
                    <g className="pointer-events-none">
                      {/* Label line */}
                      <polyline
                        points={(() => {
                          const posA = arcGenerator.centroid(arcData)
                          const posB =
                            externalLabelArcGenerator.centroid(arcData)
                          const midAngle =
                            (arcData.startAngle + arcData.endAngle) / 2
                          const posC = [
                            posB[0] + (midAngle < Math.PI ? 8 : -8),
                            posB[1],
                          ]
                          return `${posA[0]},${posA[1]} ${posB[0]},${posB[1]} ${posC[0]},${posC[1]}`
                        })()}
                        fill="none"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={1}
                        strokeOpacity={0.5}
                      />
                      {/* External label text */}
                      <text
                        transform={`translate(${externalLabelArcGenerator.centroid(arcData)})`}
                        textAnchor={
                          (arcData.startAngle + arcData.endAngle) / 2 < Math.PI
                            ? "start"
                            : "end"
                        }
                        dx={
                          (arcData.startAngle + arcData.endAngle) / 2 < Math.PI
                            ? 12
                            : -12
                        }
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-[10px]"
                      >
                        {data[index].label}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* Center text for donut-text and interactive variants */}
            {(variant === "donut-text" || variant === "interactive") && (
              <g className="pointer-events-none">
                {displayedCenterValue && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    y={displayedCenterLabel ? -8 : 0}
                    className="fill-foreground text-3xl font-bold"
                  >
                    {displayedCenterValue}
                  </text>
                )}
                {displayedCenterLabel && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    y={displayedCenterValue ? 20 : 0}
                    className="fill-muted-foreground text-sm"
                  >
                    {displayedCenterLabel}
                  </text>
                )}
              </g>
            )}
          </g>
        </svg>

        {/* Tooltip */}
        {showTooltip && hoveredIndex !== null && variant !== "interactive" && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
            <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-sm shadow-xl">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor: getColor(data[hoveredIndex], hoveredIndex),
                  }}
                />
                <span className="font-medium">{data[hoveredIndex].label}</span>
              </div>
              <div className="text-muted-foreground mt-1">
                {data[hoveredIndex].value.toLocaleString()} (
                {valueFormatter(data[hoveredIndex].value, total)})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend — click an item to isolate that segment, click again to
          restore all (or, for the "interactive" variant, drives its own
          selectedKey picker) */}
      {showLegend && (
        <ChartLegend
          items={legendItems}
          onItemHover={(name) => {
            const index = data.findIndex((d) => d.label === name)
            if (index >= 0) {
              handleSegmentEnter(index)
            } else {
              handleSegmentLeave()
            }
          }}
          onItemClick={handleLegendClick}
          isItemActive={isLegendItemActive}
        />
      )}
    </ChartContainer>
  )
}
