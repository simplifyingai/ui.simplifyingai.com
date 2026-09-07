"use client"

import * as React from "react"
import {
  Bar,
  CartesianGrid,
  Cell,
  LabelList,
  BarChart as RechartsBarChart,
  Rectangle,
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
  chartActiveValueLabel,
  chartTagLabel,
  resolveReferenceValue,
  type ChartLabelRenderer,
} from "../chart-annotations"
import { ChartLegendLayout, useSeriesHighlight } from "../chart-legend"
import {
  chartPatternDefs,
  patternFill,
  useChartPatternIds,
} from "../chart-patterns"
import {
  autoTickInterval,
  categoryAxisWidth,
  ChartPlotArea,
  resolveResponsive,
  useCategoryLayout,
  useChartSize,
  type CategoryChartLayoutProps,
  type Responsive,
} from "../chart-responsive"
import {
  useChartTheme,
  type ChartPatternKind,
  type ChartTagVariant,
  type ChartTickVariant,
} from "../chart-theme"
import {
  ChartWindowSelectionOverlay,
  ChartZoomControls,
  useChartWindow,
} from "../chart-zoom"

// ============================================
// Bar Chart
// ============================================

export interface BarChartDataPoint {
  label: string
  value: number
  fill?: string
  [key: string]: unknown
}

/** Horizontal marker across the plot — a target, a budget, an average. */
export interface BarChartReferenceLine {
  /** A literal value, or a statistic computed over the plotted values. */
  value: number | "avg" | "min" | "max"
  /** Text for the label, or your own renderer. Omit for a bare line. */
  label?: string | ChartLabelRenderer
  /** Shape of that label. Defaults to the chart theme. */
  labelVariant?: ChartTagVariant
  color?: string
  strokeDasharray?: string
  labelSide?: "left" | "right"
}

export interface BarChartProps extends CategoryChartLayoutProps {
  data: BarChartDataPoint[]
  className?: string
  color?: string
  showGrid?: boolean
  showTooltip?: boolean
  showLabel?: boolean
  labelPosition?:
    | "top"
    | "center"
    | "bottom"
    | "inside"
    | "left"
    | "right"
    | "insideLeft"
    | "insideRight"
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
  layout?: "vertical" | "horizontal"
  /**
   * Plotly-style alias for `layout`, where "horizontal" means horizontal
   * *bars*. `layout` names the axis instead, so the two are inverted — this
   * exists because chart payloads generated from Plotly figures speak the
   * former and were silently landing on the wrong orientation.
   */
  orientation?: "vertical" | "horizontal"
  barRadius?: number
  /** Space for the value axis, px. Responsive: a 48px gutter is an eighth
   *  of a phone screen. */
  yAxisWidth?: Responsive<number>

  // ---- Framing -------------------------------------------------------
  xAxisLabel?: string
  yAxisLabel?: string
  showXAxis?: boolean
  showYAxis?: boolean
  /**
   * Categories skipped between drawn ticks. Defaults to whatever keeps
   * labels from colliding at the measured width; `0` forces every tick.
   */
  xAxisInterval?: number | "preserveStart" | "preserveEnd" | "preserveStartEnd"

  // ---- Emphasis ------------------------------------------------------
  /** Bar(s) to keep vivid; every other bar drops to `mutedColor`. */
  activeIndex?: number | number[] | null
  /** Same, addressed by category — the form a JSON payload can express. */
  activeLabel?: string | null
  mutedColor?: string
  /** Texture over emphasised bars. Defaults to the chart theme. */
  pattern?: ChartPatternKind
  /** Texture over de-emphasised bars. Defaults to the chart theme. */
  mutedPattern?: ChartPatternKind
  patternColor?: string
  mutedPatternColor?: string
  /** Print the value above the emphasised bars only. */
  showActiveValue?: boolean
  /** How the active category's tick is marked. Defaults to the theme. */
  activeTickVariant?: ChartTickVariant

  // ---- Annotation ----------------------------------------------------
  referenceLine?: BarChartReferenceLine | number | "avg" | "min" | "max" | null

  // ---- Legend --------------------------------------------------------
  /**
   * Colour key for a chart whose bars carry their own `fill` — one bar per
   * category, coloured by some grouping (sector, region, status). Without
   * it the colours are undecodable. This is NOT a multi-series legend:
   * for several measures over the same categories use `MultiBarChart`.
   */
  legend?: { label: string; color: string }[]
  showLegend?: boolean
  legendPosition?: Responsive<"top" | "bottom" | "left" | "right">
}

export function BarChart({
  data,
  className,
  color = "var(--chart-3)",
  showGrid = true,
  showTooltip = true,
  showLabel = false,
  labelPosition,
  valueFormatter = (value) => `${value}`,
  labelFormatter = (label) => label,
  layout = "horizontal",
  orientation,
  barRadius,
  aspectRatio = 2,
  minHeight = 180,
  overflow = "compress",
  minCategorySize = 32,
  zoomable = true,
  wheelZoom = false,
  showZoomControls = true,
  yAxisWidth,
  xAxisLabel,
  yAxisLabel,
  showXAxis = true,
  showYAxis = true,
  xAxisInterval,
  activeIndex = null,
  activeLabel = null,
  mutedColor,
  pattern,
  mutedPattern,
  patternColor,
  mutedPatternColor,
  showActiveValue = false,
  activeTickVariant,
  referenceLine = null,
  legend,
  showLegend = true,
  legendPosition = { base: "bottom", md: "right" },
}: BarChartProps) {
  const theme = useChartTheme({
    barRadius,
    mutedColor,
    activePattern: pattern,
    mutedPattern,
    activeTickVariant,
  })

  // `orientation` wins when given: it is the more explicit of the two, and
  // the only one a Plotly-derived payload sets.
  const isVertical = orientation
    ? orientation === "horizontal"
    : layout === "vertical"

  const { ref: sizeRef, width: containerWidth } = useChartSize<HTMLDivElement>()
  const layoutBox = useCategoryLayout({
    count: data.length,
    containerWidth,
    aspectRatio,
    minHeight,
    overflow,
    minCategorySize,
    // Horizontal bars stack their categories down the screen, so it is the
    // height that has to grow, not the width.
    axis: isVertical ? "y" : "x",
  })

  const resolvedYAxisWidth = resolveResponsive(
    yAxisWidth,
    containerWidth,
    // Horizontal bars put the CATEGORY names in this gutter, so a constant
    // width wraps long ones into each other. Size it to the labels there;
    // vertical bars only need room for the numeric ticks.
    isVertical
      ? categoryAxisWidth(
          data.map((d) => labelFormatter(String(d.label))),
          containerWidth,
          { fontSize: theme.tickFontSize }
        )
      : containerWidth && containerWidth < 420
        ? 36
        : 48
  )

  const resolvedLegendPosition = resolveResponsive(
    legendPosition,
    containerWidth,
    "right"
  )
  const legendItems = legend ?? []
  const hasLegend = showLegend && legendItems.length > 1

  const zoom = useChartWindow({
    length: data.length,
    orientation: isVertical ? "y" : "x",
    // Scrolling already owns the pointer; two ways to move the same axis
    // just fight each other.
    disabled: !zoomable || layoutBox.scrolls,
    wheelZoom,
    insetStart: isVertical ? resolvedYAxisWidth + 10 : resolvedYAxisWidth + 10,
    insetEnd: 10,
  })
  const displayData = zoom.slice(data)

  // Layout-aware default. For horizontal bars (`layout="vertical"` per
  // Recharts' convention) the natural label spot is to the RIGHT of the
  // bar end — "top" places labels above each row, which overlaps the
  // bar in the row above when bars are tightly packed. For vertical
  // bars, "top" remains the sensible default.
  const effectiveLabelPosition = labelPosition ?? (isVertical ? "right" : "top")

  const patternIds = useChartPatternIds("bar-on", "bar-off")

  // Which bars stay vivid. `null` means "all of them" — no emphasis asked
  // for, so nothing is dimmed.
  const activeSet = React.useMemo(() => {
    const indices = new Set<number>()
    if (typeof activeIndex === "number") indices.add(activeIndex)
    else if (Array.isArray(activeIndex))
      activeIndex.forEach((i) => indices.add(i))
    if (activeLabel != null) {
      displayData.forEach((d, i) => {
        if (d.label === activeLabel) indices.add(i)
      })
    }
    return indices.size ? indices : null
  }, [activeIndex, activeLabel, displayData])

  const hasEmphasis =
    activeSet !== null ||
    theme.activePattern !== "none" ||
    theme.mutedPattern !== "none"

  /** Per-bar fill: an explicit datum colour wins, then emphasis, then the
   *  chart colour — each optionally wearing its pattern. */
  const fillFor = (entry: BarChartDataPoint | undefined, index: number) => {
    if (entry && typeof entry.fill === "string" && entry.fill) return entry.fill
    const on = activeSet === null || activeSet.has(index)
    return on
      ? patternFill(color, theme.activePattern, patternIds["bar-on"])
      : patternFill(theme.mutedColor, theme.mutedPattern, patternIds["bar-off"])
  }

  // A custom `shape` keeps emphasis out of `<Cell>`, which recharts
  // mis-positions in horizontal-bar mode (see the Cell comment below).
  const barShape = hasEmphasis
    ? (props: unknown) => {
        // Recharts types this callback's argument as `unknown`; the runtime
        // shape is the bar's layout props merged with its datum.
        const bar = props as React.ComponentProps<typeof Rectangle> & {
          payload?: BarChartDataPoint
          index?: number
        }
        return (
          <Rectangle {...bar} fill={fillFor(bar.payload, bar.index ?? -1)} />
        )
      }
    : undefined

  const reference = React.useMemo(() => {
    if (referenceLine == null) return null
    const spec: BarChartReferenceLine =
      typeof referenceLine === "object"
        ? referenceLine
        : { value: referenceLine }
    const resolved = resolveReferenceValue(
      spec.value,
      displayData.map((d) => Number(d.value))
    )
    return resolved == null ? null : { ...spec, resolved }
  }, [referenceLine, displayData])

  // Bars sit on the baseline, so only the far corners should round —
  // rounding all four notches the bar where it meets the axis. Negative
  // values flip which end is "far", so those fall back to a plain radius.
  const hasNegative = displayData.some((d) => Number(d.value) < 0)
  const r = theme.barRadius
  const cornerRadius: number | [number, number, number, number] = hasNegative
    ? r
    : isVertical
      ? [0, r, r, 0]
      : [r, r, 0, 0]

  const marksActiveTick = activeLabel != null
  const tickInterval =
    xAxisInterval ??
    autoTickInterval(
      displayData.length,
      layoutBox.plotWidth - resolvedYAxisWidth
    )

  return (
    <div ref={sizeRef} className={cn("group/chart relative w-full", className)}>
      <ChartLegendLayout
        position={resolvedLegendPosition}
        show={hasLegend}
        legend={
          <div
            className={cn(
              "flex gap-3",
              resolvedLegendPosition === "left" ||
                resolvedLegendPosition === "right"
                ? "flex-col items-start"
                : "flex-wrap items-center justify-center",
              resolvedLegendPosition === "top" && "pb-4",
              resolvedLegendPosition === "bottom" && "pt-4",
              resolvedLegendPosition === "left" && "pr-4",
              resolvedLegendPosition === "right" && "pl-4"
            )}
          >
            {legendItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2"
              >
                <div
                  className="size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        }
      >
      <div className="relative w-full flex-1" {...zoom.bind}>
        <ChartPlotArea layout={layoutBox}>
          <ResponsiveContainer width="100%" height={layoutBox.plotHeight}>
            <RechartsBarChart
              data={displayData}
              layout={isVertical ? "vertical" : "horizontal"}
              margin={{
                top: (showLabel || showActiveValue) && !isVertical ? 24 : 10,
                // Horizontal bars with end-of-bar labels need real space at
                // the right edge — the default 10px clips multi-digit
                // values. Bump only in the (showLabel ∧ horizontal-bars)
                // case so vertical-bar charts aren't penalised.
                right: showLabel && isVertical ? 80 : 10,
                left: yAxisLabel ? 20 : 10,
                bottom: xAxisLabel ? 56 : 40,
              }}
            >
              {chartPatternDefs([
                {
                  id: patternIds["bar-on"],
                  kind: theme.activePattern,
                  background: color,
                  color: patternColor ?? "rgba(255,255,255,0.34)",
                },
                {
                  id: patternIds["bar-off"],
                  kind: theme.mutedPattern,
                  background: theme.mutedColor,
                  color:
                    mutedPatternColor ??
                    "color-mix(in oklab, var(--muted-foreground) 22%, transparent)",
                },
              ])}

              {showGrid && (
                <CartesianGrid
                  strokeDasharray={theme.gridDash || undefined}
                  vertical={true}
                  horizontal={true}
                  stroke="var(--border)"
                  strokeOpacity={theme.gridOpacity}
                />
              )}

              {/* CRITICAL: render each axis as a SEPARATE conditional slot
                  instead of wrapping in a `<>...</>` fragment. Recharts
                  iterates BarChart's children via React.Children.forEach,
                  which does NOT recurse into fragments — wrapping the
                  axes in a fragment caused recharts to miss them entirely
                  and collapse all bars to a single Y-position (the long-
                  running "1 bar visible" failure mode for horizontal-bar
                  mode). Each `{cond && <Axis/>}` is one direct-child slot
                  React enumerates correctly. */}
              {isVertical && (
                <YAxis
                  dataKey="label"
                  type="category"
                  hide={!showYAxis}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: theme.tickFontSize }}
                  tickFormatter={labelFormatter}
                  width={resolvedYAxisWidth}
                  interval={layoutBox.scrolls ? 0 : undefined}
                  label={
                    yAxisLabel
                      ? {
                          value: yAxisLabel,
                          angle: -90,
                          position: "insideLeft",
                          fill: "var(--muted-foreground)",
                          fontSize: theme.tickFontSize,
                        }
                      : undefined
                  }
                />
              )}
              {isVertical && (
                <XAxis
                  type="number"
                  hide={!showXAxis}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: theme.tickFontSize }}
                  tickFormatter={valueFormatter}
                  label={
                    xAxisLabel
                      ? {
                          value: xAxisLabel,
                          position: "insideBottom",
                          offset: -12,
                          fill: "var(--muted-foreground)",
                          fontSize: theme.tickFontSize,
                        }
                      : undefined
                  }
                />
              )}
              {!isVertical && (
                <XAxis
                  dataKey="label"
                  hide={!showXAxis}
                  axisLine={false}
                  tickLine={false}
                  tick={
                    marksActiveTick
                      ? chartActiveTick(activeLabel, {
                          variant: theme.activeTickVariant,
                          fontSize: theme.tickFontSize,
                          background: theme.activeTickBackground,
                          foreground: theme.activeTickForeground,
                          formatter: labelFormatter,
                        })
                      : { fontSize: theme.tickFontSize }
                  }
                  tickFormatter={marksActiveTick ? undefined : labelFormatter}
                  tickMargin={marksActiveTick ? 4 : 8}
                  interval={tickInterval}
                  label={
                    xAxisLabel
                      ? {
                          value: xAxisLabel,
                          position: "insideBottom",
                          offset: -12,
                          fill: "var(--muted-foreground)",
                          fontSize: theme.tickFontSize,
                        }
                      : undefined
                  }
                />
              )}
              {!isVertical && (
                <YAxis
                  hide={!showYAxis}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: theme.tickFontSize }}
                  tickFormatter={valueFormatter}
                  width={resolvedYAxisWidth}
                  label={
                    yAxisLabel
                      ? {
                          value: yAxisLabel,
                          angle: -90,
                          position: "insideLeft",
                          fill: "var(--muted-foreground)",
                          fontSize: theme.tickFontSize,
                        }
                      : undefined
                  }
                />
              )}

              {showTooltip && (
                <Tooltip
                  cursor={{
                    fill: "var(--muted-foreground)",
                    opacity: 0.08,
                  }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <ChartTooltipSurface>
                        <p className="text-foreground font-medium">
                          {labelFormatter(label)}
                        </p>
                        <p
                          style={{ color: payload[0]?.color || color }}
                        >
                          {valueFormatter(payload[0]?.value as number)}
                        </p>
                      </ChartTooltipSurface>
                    )
                  }}
                />
              )}

              {reference && (
                <ReferenceLine
                  {...(isVertical
                    ? { x: reference.resolved }
                    : { y: reference.resolved })}
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

              {/* Per-row Cell children only when at least one data point
                  specifies its own `fill`. With Cells present unconditionally,
                  recharts' horizontal-bar mode (`layout="vertical"`)
                  collapses every bar's Y-position to row 0 — the second
                  prong of the long-running "1 bar visible" failure mode
                  (the first being the Fragment-wrapped axes). When all
                  bars share the Bar's `fill` prop (the common case),
                  omitting Cells lets recharts position each row correctly.
                  Emphasis and patterns go through `shape` for the same
                  reason: one child, no per-row Cells. */}
              {displayData.some((d) => typeof d.fill === "string" && d.fill) ? (
                <Bar
                  dataKey="value"
                  fill={color}
                  radius={cornerRadius}
                  maxBarSize={theme.maxBarSize}
                  shape={barShape}
                  isAnimationActive={theme.animate}
                  animationDuration={theme.animationDuration}
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || color} />
                  ))}
                  {showLabel && (
                    <LabelList
                      dataKey="value"
                      position={effectiveLabelPosition}
                      offset={
                        effectiveLabelPosition === "right" ||
                        effectiveLabelPosition === "left"
                          ? 6
                          : undefined
                      }
                      formatter={valueFormatter}
                      className="fill-foreground text-xs"
                    />
                  )}
                  {showActiveValue && (
                    <LabelList
                      dataKey="value"
                      content={chartActiveValueLabel(
                        (i) => activeSet === null || activeSet.has(i),
                        valueFormatter
                      )}
                    />
                  )}
                </Bar>
              ) : (
                <Bar
                  dataKey="value"
                  fill={color}
                  radius={cornerRadius}
                  maxBarSize={theme.maxBarSize}
                  shape={barShape}
                  isAnimationActive={theme.animate}
                  animationDuration={theme.animationDuration}
                >
                  {showLabel && (
                    <LabelList
                      dataKey="value"
                      position={effectiveLabelPosition}
                      offset={
                        effectiveLabelPosition === "right" ||
                        effectiveLabelPosition === "left"
                          ? 6
                          : undefined
                      }
                      formatter={valueFormatter}
                      className="fill-foreground text-xs"
                    />
                  )}
                  {showActiveValue && (
                    <LabelList
                      dataKey="value"
                      content={chartActiveValueLabel(
                        (i) => activeSet === null || activeSet.has(i),
                        valueFormatter
                      )}
                    />
                  )}
                </Bar>
              )}
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartPlotArea>

        <ChartWindowSelectionOverlay
          selection={zoom.selection}
          orientation={isVertical ? "y" : "x"}
          insetStart={resolvedYAxisWidth + 10}
          insetEnd={10}
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
      </ChartLegendLayout>
    </div>
  )
}

// ============================================
// Multi Bar Chart (Grouped/Stacked)
// ============================================

export interface MultiBarChartSeries {
  name: string
  dataKey: string
  color: string
  stackId?: string
}

export interface MultiBarChartDataPoint {
  label: string
  [key: string]: string | number
}

export interface MultiBarChartProps extends CategoryChartLayoutProps {
  data: MultiBarChartDataPoint[]
  series: MultiBarChartSeries[]
  className?: string
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  /** Side the legend sits on. A side legend eats width a narrow container
   *  doesn't have, so it falls to the bottom below `md` by default. */
  legendPosition?: Responsive<"top" | "bottom" | "left" | "right">
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
  layout?: "vertical" | "horizontal"
  orientation?: "vertical" | "horizontal"
  barRadius?: number
  yAxisWidth?: Responsive<number>
  xAxisInterval?: number | "preserveStart" | "preserveEnd" | "preserveStartEnd"
}

export function MultiBarChart({
  data,
  series,
  className,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  legendPosition = { base: "bottom", md: "right" },
  valueFormatter = (value) => `${value}`,
  labelFormatter = (label) => label,
  layout = "horizontal",
  orientation,
  barRadius = 4,
  aspectRatio = 2,
  minHeight = 180,
  overflow = "compress",
  minCategorySize = 44,
  zoomable = true,
  wheelZoom = false,
  showZoomControls = true,
  yAxisWidth,
  xAxisInterval,
}: MultiBarChartProps) {
  const isVertical = orientation
    ? orientation === "horizontal"
    : layout === "vertical"

  const { ref: sizeRef, width: containerWidth } = useChartSize<HTMLDivElement>()
  const layoutBox = useCategoryLayout({
    count: data.length,
    containerWidth,
    aspectRatio,
    minHeight,
    overflow,
    minCategorySize,
    axis: isVertical ? "y" : "x",
  })
  const resolvedLegendPosition = resolveResponsive(
    legendPosition,
    containerWidth,
    "right"
  )
  const resolvedYAxisWidth = resolveResponsive(
    yAxisWidth,
    containerWidth,
    isVertical
      ? categoryAxisWidth(
          data.map((d) => labelFormatter(String(d.label))),
          containerWidth
        )
      : containerWidth && containerWidth < 420
        ? 36
        : 48
  )

  const zoom = useChartWindow({
    length: data.length,
    orientation: isVertical ? "y" : "x",
    disabled: !zoomable || layoutBox.scrolls,
    wheelZoom,
    insetStart: resolvedYAxisWidth + 10,
    insetEnd: 10,
  })
  const displayData = zoom.slice(data)

  // Legend highlight: click a series to emphasize it (others fade but stay
  // drawn so the grouped-bar layout never shifts), hover to preview.
  const highlight = useSeriesHighlight()
  const tickInterval =
    xAxisInterval ??
    autoTickInterval(
      displayData.length,
      layoutBox.plotWidth - resolvedYAxisWidth
    )

  return (
    <div ref={sizeRef} className={cn("group/chart relative w-full", className)}>
      <ChartLegendLayout
        position={resolvedLegendPosition}
        show={showLegend && series.length > 1}
        legend={
          <div
            className={cn(
              "flex gap-3",
              resolvedLegendPosition === "left" ||
                resolvedLegendPosition === "right"
                ? "flex-col items-start"
                : "flex-wrap items-center justify-center",
              resolvedLegendPosition === "top" && "pb-4",
              resolvedLegendPosition === "bottom" && "pt-4",
              resolvedLegendPosition === "left" && "pr-4",
              resolvedLegendPosition === "right" && "pl-4"
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
              <RechartsBarChart
                data={displayData}
                layout={isVertical ? "vertical" : "horizontal"}
                margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
              >
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={true}
                    horizontal={true}
                    stroke="var(--border)"
                    strokeOpacity={0.5}
                  />
                )}

                {/* CRITICAL: render each axis as a SEPARATE conditional slot
                    instead of wrapping in a `<>...</>` fragment. Recharts
                    iterates BarChart's children via React.Children.forEach,
                    which does NOT recurse into fragments — wrapping the
                    axes in a fragment caused recharts to miss them entirely
                    and collapse all bars to a single Y-position. */}
                {isVertical && (
                  <YAxis
                    dataKey="label"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={labelFormatter}
                    width={resolvedYAxisWidth}
                    interval={layoutBox.scrolls ? 0 : undefined}
                  />
                )}
                {isVertical && (
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={valueFormatter}
                  />
                )}
                {!isVertical && (
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={labelFormatter}
                    tickMargin={8}
                    interval={tickInterval}
                  />
                )}
                {!isVertical && (
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={valueFormatter}
                    width={resolvedYAxisWidth}
                  />
                )}

                {showTooltip && (
                  <Tooltip
                    cursor={{
                      fill: "var(--muted-foreground)",
                      opacity: 0.08,
                    }}
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

                {/* All series always render — the focused one stays vivid while
                    the rest fade (never removed, so grouped bars never re-flow). */}
                {series.map((s) => (
                  <Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    name={s.name}
                    fill={s.color}
                    radius={barRadius}
                    stackId={s.stackId}
                    maxBarSize={40}
                    className={cn(
                      "transition-opacity duration-200",
                      highlight.isDimmed(s.name) && "opacity-30"
                    )}
                  />
                ))}
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartPlotArea>

          <ChartWindowSelectionOverlay
            selection={zoom.selection}
            orientation={isVertical ? "y" : "x"}
            insetStart={resolvedYAxisWidth + 10}
            insetEnd={10}
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
