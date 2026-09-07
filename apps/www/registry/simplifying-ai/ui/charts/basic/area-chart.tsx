"use client"

import * as React from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

import { ChartTooltipSurface } from "../chart-tooltip"

import {
  chartActiveTick,
  chartTagLabel,
  resolveReferenceValue,
  type ChartLabelRenderer,
} from "../chart-annotations"
import { ChartLegendLayout, useSeriesHighlight } from "../chart-legend"
import {
  autoTickInterval,
  ChartPlotArea,
  resolveResponsive,
  useCategoryLayout,
  useChartSize,
  type CategoryChartLayoutProps,
  type Responsive,
} from "../chart-responsive"
import {
  useChartTheme,
  type ChartTagVariant,
  type ChartTickVariant,
} from "../chart-theme"
import {
  ChartWindowSelectionOverlay,
  ChartZoomControls,
  useChartWindow,
} from "../chart-zoom"

export interface AreaChartDataPoint {
  label: string
  value: number
  [key: string]: unknown
}

export interface AreaChartProps extends CategoryChartLayoutProps {
  data: AreaChartDataPoint[]
  className?: string
  color?: string
  gradientFrom?: string
  gradientTo?: string
  gradientOpacity?: [number, number]
  showDots?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  showCursor?: boolean
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
  yAxisDomain?: [number, number]
  yAxisTicks?: number[]
  animate?: boolean
  strokeWidth?: number
  dotRadius?: number
  xAxisAngle?: number
  curveType?: "linear" | "monotone" | "step"
  yAxisWidth?: Responsive<number>

  xAxisLabel?: string
  yAxisLabel?: string
  /**
   * Recharts tick interval for the category axis. The default draws every
   * label, which is unreadable past ~15 points — pass a number to draw
   * every Nth, or "preserveStartEnd" for just the ends.
   */
  xAxisInterval?: number | "preserveStart" | "preserveEnd" | "preserveStartEnd"
  showXAxis?: boolean
  showYAxis?: boolean
  /** Category to mark out on the axis. */
  activeLabel?: string | null
  /** How that tick is marked. Defaults to the chart theme. */
  activeTickVariant?: ChartTickVariant
  /** Horizontal marker: a literal value, or a statistic over the data. */
  referenceLine?: AreaChartReferenceLine | number | "avg" | "min" | "max" | null
}

/** Horizontal marker across the plot — a target, a budget, an average. */
export interface AreaChartReferenceLine {
  value: number | "avg" | "min" | "max"
  /** Text for the label, or your own renderer. Omit for a bare line. */
  label?: string | ChartLabelRenderer
  /** Shape of that label. Defaults to the chart theme. */
  labelVariant?: ChartTagVariant
  color?: string
  strokeDasharray?: string
  labelSide?: "left" | "right"
}

export function AreaChart({
  data,
  className,
  color = "var(--chart-3)",
  gradientFrom = "var(--chart-3)",
  gradientTo = "var(--chart-1)",
  gradientOpacity = [0.8, 0.1],
  showDots = false,
  showGrid = true,
  showTooltip = true,
  showCursor = true,
  valueFormatter = (value) => `${value}%`,
  labelFormatter = (label) => label,
  yAxisDomain,
  yAxisTicks,
  animate = true,
  strokeWidth = 2,
  dotRadius = 4,
  xAxisAngle = 0,
  aspectRatio = 2,
  minHeight = 180,
  overflow = "compress",
  minCategorySize = 24,
  zoomable = true,
  wheelZoom = false,
  showZoomControls = true,
  yAxisWidth,
  curveType = "linear",
  xAxisLabel,
  yAxisLabel,
  showXAxis = true,
  showYAxis = true,
  xAxisInterval = 0,
  activeLabel = null,
  activeTickVariant,
  referenceLine = null,
}: AreaChartProps) {
  const theme = useChartTheme({ activeTickVariant })
  const gradientId = React.useId().replace(/:/g, "")
  const patternId = React.useId().replace(/:/g, "")

  const { ref: sizeRef, width: containerWidth } = useChartSize<HTMLDivElement>()
  const layoutBox = useCategoryLayout({
    count: data.length,
    containerWidth,
    aspectRatio,
    minHeight,
    overflow,
    minCategorySize,
  })
  const resolvedYAxisWidth = resolveResponsive(
    yAxisWidth,
    containerWidth,
    containerWidth && containerWidth < 420 ? 38 : 50
  )
  const zoom = useChartWindow({
    length: data.length,
    // Scrolling already owns the pointer; two ways to move the same axis
    // just fight each other.
    disabled: !zoomable || layoutBox.scrolls,
    wheelZoom,
    insetStart: resolvedYAxisWidth + 10,
    insetEnd: 30,
  })
  const displayData = zoom.slice(data)

  // Calculate domain from the currently-visible (possibly zoomed) data if
  // not provided, so zooming auto-fits the Y-axis to the selected range.
  const calculatedDomain = React.useMemo(() => {
    if (yAxisDomain) return yAxisDomain
    const values = displayData.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1
    return [
      Math.max(0, Math.floor((min - padding) / 10) * 10),
      Math.ceil((max + padding) / 10) * 10,
    ] as [number, number]
  }, [displayData, yAxisDomain])

  // Calculate ticks if not provided
  const calculatedTicks = React.useMemo(() => {
    if (yAxisTicks) return yAxisTicks
    const [min, max] = calculatedDomain
    const step = (max - min) / 4
    return Array.from({ length: 5 }, (_, i) => Math.round(min + step * i))
  }, [calculatedDomain, yAxisTicks])

  const reference = React.useMemo(() => {
    if (referenceLine == null) return null
    const spec: AreaChartReferenceLine =
      typeof referenceLine === "object"
        ? referenceLine
        : { value: referenceLine }
    const resolved = resolveReferenceValue(
      spec.value,
      displayData.map((d) => Number(d.value))
    )
    return resolved == null ? null : { ...spec, resolved }
  }, [referenceLine, displayData])

  const marksActiveTick = activeLabel != null
  const resolvedInterval =
    xAxisInterval ||
    autoTickInterval(
      displayData.length,
      layoutBox.plotWidth - resolvedYAxisWidth
    )

  return (
    <div ref={sizeRef} className={cn("group/chart relative w-full", className)}>
      <div className="relative" {...zoom.bind}>
        <ChartPlotArea layout={layoutBox}>
          <ResponsiveContainer width="100%" height={layoutBox.plotHeight}>
            <ComposedChart
              data={displayData}
              margin={{
                top: 20,
                right: 30,
                left: yAxisLabel ? 20 : 10,
                bottom: (xAxisAngle === 0 ? 20 : 60) + (xAxisLabel ? 24 : 0),
              }}
            >
              <defs>
                {/* Gradient fill - stronger fade */}
                <linearGradient
                  id={`gradient-${gradientId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={gradientFrom}
                    stopOpacity={gradientOpacity[0]}
                  />
                  <stop
                    offset="100%"
                    stopColor={gradientTo}
                    stopOpacity={gradientOpacity[1]}
                  />
                </linearGradient>

                {/* Dotted pattern overlay */}
                <pattern
                  id={`pattern-${patternId}`}
                  x="0"
                  y="0"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="1.5"
                    cy="1.5"
                    r="0.75"
                    fill="rgba(255,255,255,0.3)"
                  />
                </pattern>
              </defs>

              {/* Grid */}
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={true}
                  horizontal={true}
                  stroke="var(--border)"
                  strokeOpacity={0.5}
                />
              )}

              {/* Y-Axis */}
              <YAxis
                domain={calculatedDomain}
                ticks={calculatedTicks}
                tickFormatter={valueFormatter}
                hide={!showYAxis}
                label={
                  yAxisLabel
                    ? {
                        value: yAxisLabel,
                        angle: -90,
                        position: "insideLeft",
                        fill: "var(--muted-foreground)",
                        fontSize: 12,
                      }
                    : undefined
                }
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y}
                    dy={4}
                    textAnchor="end"
                    className="fill-muted-foreground text-xs"
                  >
                    {valueFormatter(payload.value)}
                  </text>
                )}
                width={resolvedYAxisWidth}
              />

              {/* X-Axis */}
              <XAxis
                dataKey="label"
                hide={!showXAxis}
                axisLine={false}
                tickLine={false}
                label={
                  xAxisLabel
                    ? {
                        value: xAxisLabel,
                        position: "insideBottom",
                        offset: -12,
                        fill: "var(--muted-foreground)",
                        fontSize: 12,
                      }
                    : undefined
                }
                tick={
                  marksActiveTick
                    ? chartActiveTick(activeLabel, {
                        variant: theme.activeTickVariant,
                        background: theme.activeTickBackground,
                        foreground: theme.activeTickForeground,
                        formatter: labelFormatter,
                      })
                    : ({ x, y, payload }) => (
                        <text
                          x={x}
                          y={y}
                          dy={16}
                          textAnchor="middle"
                          className="fill-muted-foreground text-xs"
                        >
                          {labelFormatter(payload.value)}
                        </text>
                      )
                }
                height={xAxisAngle === 0 ? 30 : 60}
                interval={resolvedInterval}
              />

              {reference && (
                <ReferenceLine
                  y={reference.resolved}
                  stroke={reference.color ?? "var(--muted-foreground)"}
                  strokeDasharray={reference.strokeDasharray ?? "2 6"}
                  ifOverflow="extendDomain"
                  label={
                    typeof reference.label === "function"
                      ? reference.label
                      : reference.label
                        ? chartTagLabel(reference.label, {
                            variant: reference.labelVariant ?? theme.tagVariant,
                            side: reference.labelSide ?? "left",
                            background: theme.tagBackground,
                            foreground: theme.tagForeground,
                          })
                        : undefined
                  }
                />
              )}

              {/* Tooltip with cursor line */}
              {showTooltip && (
                <Tooltip
                  cursor={
                    showCursor
                      ? {
                          stroke: "var(--muted-foreground)",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }
                      : false
                  }
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <ChartTooltipSurface>
                        <p className="text-foreground font-medium">
                          {labelFormatter(label)}
                        </p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            style={{ color: entry.color }}
                          >
                            {entry.name}:{" "}
                            {valueFormatter(entry.value as number)}
                          </p>
                        ))}
                      </ChartTooltipSurface>
                    )
                  }}
                />
              )}

              {/* Area fill with gradient */}
              <Area
                type={curveType}
                dataKey="value"
                stroke="none"
                fill={`url(#gradient-${gradientId})`}
                fillOpacity={1}
                isAnimationActive={animate}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
              />

              {/* Dotted pattern overlay */}
              <Area
                type={curveType}
                dataKey="value"
                stroke="none"
                fill={`url(#pattern-${patternId})`}
                fillOpacity={1}
                isAnimationActive={animate}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
              />

              {/* Line on top with dots */}
              <Line
                type={curveType}
                dataKey="value"
                stroke={color}
                strokeWidth={strokeWidth}
                dot={
                  showDots
                    ? {
                        r: dotRadius,
                        fill: "var(--background)",
                        stroke: color,
                        strokeWidth: 2,
                      }
                    : false
                }
                activeDot={{
                  r: 4,
                  fill: color,
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
                isAnimationActive={animate}
                animationBegin={200}
                animationDuration={1800}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPlotArea>

        <ChartWindowSelectionOverlay
          selection={zoom.selection}
          insetStart={resolvedYAxisWidth + 10}
          insetEnd={30}
        />
      </div>

      {showZoomControls && !layoutBox.scrolls && zoomable && (
        <ChartZoomControls
          onZoomIn={zoom.zoomIn}
          onZoomOut={zoom.zoomOut}
          onReset={zoom.reset}
          isZoomed={zoom.isZoomed}
        />
      )}
    </div>
  )
}

// Helper function to generate chart data
export function generateAreaChartData(
  labels: string[],
  values: number[]
): AreaChartDataPoint[] {
  return labels.map((label, index) => ({
    label,
    value: values[index] ?? 0,
  }))
}

// ============================================
// Multi-Series Area Chart
// ============================================

export interface MultiAreaChartSeries {
  name: string
  dataKey: string
  color: string
  gradientFrom?: string
  gradientTo?: string
}

export interface MultiAreaChartDataPoint {
  label: string
  [key: string]: string | number
}

export interface MultiAreaChartProps extends CategoryChartLayoutProps {
  data: MultiAreaChartDataPoint[]
  series: MultiAreaChartSeries[]
  className?: string
  showGrid?: boolean
  showTooltip?: boolean
  showCursor?: boolean
  showLegend?: boolean
  /** Side the legend sits on. A side legend eats width a narrow container
   *  doesn't have, so it falls to the bottom below `md` by default. */
  legendPosition?: Responsive<"top" | "bottom" | "left" | "right">
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
  yAxisDomain?: [number, number]
  yAxisTicks?: number[]
  animate?: boolean
  strokeWidth?: number
  xAxisAngle?: number
  yAxisWidth?: Responsive<number>
  curveType?: "linear" | "monotone" | "step"
  stacked?: boolean
  gradientOpacity?: [number, number]
}

export function MultiAreaChart({
  data,
  series,
  className,
  showGrid = true,
  showTooltip = true,
  showCursor = true,
  showLegend = true,
  legendPosition = { base: "bottom", md: "right" },
  valueFormatter = (value) => `${value}`,
  labelFormatter = (label) => label,
  yAxisDomain,
  yAxisTicks,
  animate = true,
  strokeWidth = 2,
  xAxisAngle = 0,
  aspectRatio = 2,
  minHeight = 180,
  overflow = "compress",
  minCategorySize = 24,
  zoomable = true,
  wheelZoom = false,
  showZoomControls = true,
  yAxisWidth,
  curveType = "monotone",
  stacked = false,
  gradientOpacity = [0.6, 0.1],
}: MultiAreaChartProps) {
  const baseId = React.useId().replace(/:/g, "")

  const { ref: sizeRef, width: containerWidth } = useChartSize<HTMLDivElement>()
  const layoutBox = useCategoryLayout({
    count: data.length,
    containerWidth,
    aspectRatio,
    minHeight,
    overflow,
    minCategorySize,
  })
  const resolvedLegendPosition = resolveResponsive(
    legendPosition,
    containerWidth,
    "right"
  )
  const resolvedYAxisWidth = resolveResponsive(
    yAxisWidth,
    containerWidth,
    containerWidth && containerWidth < 420 ? 38 : 50
  )
  const zoom = useChartWindow({
    length: data.length,
    disabled: !zoomable || layoutBox.scrolls,
    wheelZoom,
    insetStart: resolvedYAxisWidth + 10,
    insetEnd: 30,
  })
  const displayData = zoom.slice(data)
  // Legend highlight: click a series to emphasize it (others fade but stay
  // drawn so the stack layout never shifts), hover to preview — Plotly-style.
  const highlight = useSeriesHighlight()

  // Calculate domain from the currently-visible (possibly zoomed) data
  // across ALL series — highlighting only fades series, it never removes
  // them, so the Y-axis stays put as you emphasize different series.
  const calculatedDomain = React.useMemo(() => {
    if (yAxisDomain) return yAxisDomain
    const allValues = displayData.flatMap((d) =>
      series.map((s) => (d[s.dataKey] as number) || 0)
    )
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.1
    return [
      Math.max(0, Math.floor((min - padding) / 10) * 10),
      Math.ceil((max + padding) / 10) * 10,
    ] as [number, number]
  }, [displayData, series, yAxisDomain])

  const calculatedTicks = React.useMemo(() => {
    if (yAxisTicks) return yAxisTicks
    const [min, max] = calculatedDomain
    const step = (max - min) / 4
    return Array.from({ length: 5 }, (_, i) => Math.round(min + step * i))
  }, [calculatedDomain, yAxisTicks])

  return (
    <div ref={sizeRef} className={cn("group/chart relative w-full", className)}>
      <ChartLegendLayout
        position={resolvedLegendPosition}
        show={showLegend && series.length > 1}
        legend={
          <div
            className={cn(
              "flex gap-3",
              legendPosition === "left" || legendPosition === "right"
                ? "flex-col items-start"
                : "flex-wrap items-center justify-center",
              legendPosition === "top" && "pb-4",
              legendPosition === "bottom" && "pt-4",
              legendPosition === "left" && "pr-4",
              legendPosition === "right" && "pl-4"
            )}
          >
            {series.map((s) => (
              <button
                key={s.dataKey}
                type="button"
                onClick={() => highlight.toggle(s.name)}
                onMouseEnter={() => highlight.setHovered(s.name)}
                onMouseLeave={() => highlight.setHovered(null)}
                className={cn(
                  "flex items-center gap-2 text-sm transition-opacity hover:opacity-80",
                  !highlight.isActive(s.name) && "opacity-40"
                )}
              >
                <div
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-muted-foreground">{s.name}</span>
              </button>
            ))}
          </div>
        }
      >
        <div className="relative w-full flex-1" {...zoom.bind}>
          <ChartPlotArea layout={layoutBox}>
            <ResponsiveContainer width="100%" height={layoutBox.plotHeight}>
              <ComposedChart
                data={displayData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 10,
                  bottom: xAxisAngle === 0 ? 20 : 60,
                }}
              >
                <defs>
                  {series.map((s, i) => (
                    <linearGradient
                      key={s.dataKey}
                      id={`gradient-${baseId}-${i}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={s.gradientFrom || s.color}
                        stopOpacity={gradientOpacity[0]}
                      />
                      <stop
                        offset="100%"
                        stopColor={s.gradientTo || s.color}
                        stopOpacity={gradientOpacity[1]}
                      />
                    </linearGradient>
                  ))}
                  {/* Dot pattern overlay */}
                  <pattern
                    id={`pattern-${baseId}`}
                    x="0"
                    y="0"
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="1.5"
                      cy="1.5"
                      r="0.75"
                      fill="rgba(255,255,255,0.25)"
                    />
                  </pattern>
                </defs>

                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={true}
                    horizontal={true}
                    stroke="var(--border)"
                    strokeOpacity={0.5}
                  />
                )}

                <YAxis
                  domain={calculatedDomain}
                  ticks={calculatedTicks}
                  tickFormatter={valueFormatter}
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y}
                      dy={4}
                      textAnchor="end"
                      className="fill-muted-foreground text-xs"
                    >
                      {valueFormatter(payload.value)}
                    </text>
                  )}
                  width={50}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y}
                      dy={16}
                      textAnchor="middle"
                      className="fill-muted-foreground text-xs"
                    >
                      {labelFormatter(payload.value)}
                    </text>
                  )}
                  height={xAxisAngle === 0 ? 30 : 60}
                  interval={0}
                />

                {showTooltip && (
                  <Tooltip
                    cursor={
                      showCursor
                        ? {
                            stroke: "var(--muted-foreground)",
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                          }
                        : false
                    }
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <ChartTooltipSurface>
                          <p className="text-foreground mb-1 font-medium">
                            {labelFormatter(label)}
                          </p>
                          {payload.map((entry, index) => (
                            <div
                              key={index}
                              className={cn(
                                "flex items-center gap-2 transition-opacity",
                                highlight.isDimmed(entry.name as string) &&
                                  "opacity-40"
                              )}
                            >
                              <div
                                className="size-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-muted-foreground">
                                {entry.name}:
                              </span>
                              <span style={{ color: entry.color }}>
                                {valueFormatter(entry.value as number)}
                              </span>
                            </div>
                          ))}
                        </ChartTooltipSurface>
                      )
                    }}
                  />
                )}

                {/* Render areas in reverse order so first series is on top.
              All series always render — the focused one stays vivid while
              the rest fade (never removed, so the layout never shifts). */}
                {[...series].reverse().map((s, i) => (
                  <Area
                    key={`${s.dataKey}-fill`}
                    type={curveType}
                    dataKey={s.dataKey}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={strokeWidth}
                    fill={`url(#gradient-${baseId}-${series.indexOf(s)})`}
                    fillOpacity={1}
                    stackId={stacked ? "stack" : undefined}
                    isAnimationActive={animate}
                    animationBegin={i * 100}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    className={cn(
                      "transition-opacity duration-200",
                      highlight.isDimmed(s.name) && "opacity-30"
                    )}
                    activeDot={{
                      r: 4,
                      fill: s.color,
                      stroke: "var(--background)",
                      strokeWidth: 2,
                    }}
                  />
                ))}

                {/* Dot pattern overlay for each series */}
                {[...series].reverse().map((s, i) => (
                  <Area
                    key={`${s.dataKey}-pattern`}
                    type={curveType}
                    dataKey={s.dataKey}
                    stroke="none"
                    fill={`url(#pattern-${baseId})`}
                    fillOpacity={1}
                    stackId={stacked ? "stack-pattern" : undefined}
                    isAnimationActive={animate}
                    animationBegin={i * 100}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    legendType="none"
                    tooltipType="none"
                    className={cn(
                      "transition-opacity duration-200",
                      highlight.isDimmed(s.name) && "opacity-30"
                    )}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPlotArea>

          <ChartWindowSelectionOverlay
            selection={zoom.selection}
            insetStart={resolvedYAxisWidth + 10}
            insetEnd={30}
          />

          {showZoomControls && !layoutBox.scrolls && zoomable && (
            <ChartZoomControls
              onZoomIn={zoom.zoomIn}
              onZoomOut={zoom.zoomOut}
              onReset={zoom.reset}
              isZoomed={zoom.isZoomed}
            />
          )}
        </div>
      </ChartLegendLayout>
    </div>
  )
}
