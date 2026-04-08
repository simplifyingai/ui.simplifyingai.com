"use client"

import * as React from "react"
import { interpolateRgb } from "d3-interpolate"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

import { ChartAxis } from "../chart-axis"
import type { BaseChartProps } from "../chart-config"
import { ChartContainer } from "../chart-container"

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface HeatmapDataPoint {
  x: string | number
  y: string | number
  value: number
  date?: Date | string
  metadata?: Record<string, unknown>
}

export interface CalendarDataPoint {
  date: Date | string
  value: number
  metadata?: Record<string, unknown>
}

export interface HeatmapLegendConfig {
  show?: boolean
  position?: "top-right" | "bottom-right" | "bottom-left" | "top-left"
  showLabels?: boolean
  lessLabel?: string
  moreLabel?: string
}

export interface RadialHeatmapDataPoint {
  day: number | string // 0-6 (Sunday-Saturday) or day name
  hour: number | string // 0-23 or hour string like "12am"
  value: number
  metadata?: Record<string, unknown>
}

export interface HeatmapChartProps extends BaseChartProps {
  /** Data points for the heatmap */
  data: HeatmapDataPoint[] | CalendarDataPoint[] | RadialHeatmapDataPoint[]
  /** Variant style */
  variant?: "matrix" | "calendar" | "compact" | "radial"
  /** X-axis labels (for matrix variant) */
  xLabels?: string[]
  /** Y-axis labels (for matrix variant) */
  yLabels?: string[]
  /** Color scale - array of colors from low to high */
  colorScale?: string[]
  /** Color theme preset. Use "auto" to derive colors from active CSS theme. */
  colorTheme?:
    | "green"
    | "blue"
    | "purple"
    | "orange"
    | "red"
    | "gray"
    | "pink"
    | "heat"
    | "thermal"
    | "auto"
  /** Show values in cells */
  showValues?: boolean
  /** Cell border radius */
  cellRadius?: number
  /** Cell padding/gap */
  cellGap?: number
  /** Cell size (for calendar variant) */
  cellSize?: number
  /** X-axis label */
  xAxisLabel?: string
  /** Y-axis label */
  yAxisLabel?: string
  /** Value formatter */
  valueFormat?: (value: number) => string
  /** Start of week (0 = Sunday, 1 = Monday) */
  weekStartsOn?: 0 | 1
  /** Show month labels (calendar variant) */
  showMonthLabels?: boolean
  /** Show weekday labels (calendar variant) */
  showWeekdayLabels?: boolean
  /** Legend configuration */
  legend?: HeatmapLegendConfig
  /** Number of color levels */
  levels?: number
  /** Custom level function */
  getLevelFromValue?: (value: number, max: number) => number
  /** On cell click handler */
  onCellClick?: (data: HeatmapDataPoint | CalendarDataPoint) => void
  /** Empty cell color */
  emptyColor?: string
}

// ============================================================================
// Color Themes
// ============================================================================

const COLOR_THEMES = {
  green: {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  },
  blue: {
    light: ["#ebedf0", "#c6e6ff", "#79c0ff", "#388bfd", "#1f6feb"],
    dark: ["#161b22", "#0d419d", "#1158c7", "#388bfd", "#58a6ff"],
  },
  purple: {
    light: ["#ebedf0", "#d8b4fe", "#a855f7", "#9333ea", "#7e22ce"],
    dark: ["#161b22", "#3b0764", "#6b21a8", "#9333ea", "#a855f7"],
  },
  orange: {
    light: ["#ebedf0", "#fed7aa", "#fb923c", "#f97316", "#ea580c"],
    dark: ["#161b22", "#7c2d12", "#c2410c", "#f97316", "#fb923c"],
  },
  red: {
    light: ["#ebedf0", "#fecaca", "#f87171", "#ef4444", "#dc2626"],
    dark: ["#161b22", "#7f1d1d", "#b91c1c", "#ef4444", "#f87171"],
  },
  gray: {
    light: ["#ebedf0", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563"],
    dark: ["#161b22", "#374151", "#4b5563", "#6b7280", "#9ca3af"],
  },
  pink: {
    light: ["#ebedf0", "#fbcfe8", "#f472b6", "#ec4899", "#db2777"],
    dark: ["#161b22", "#831843", "#be185d", "#ec4899", "#f472b6"],
  },
  heat: {
    light: [
      "#fffde7",
      "#fff59d",
      "#ffee58",
      "#ffca28",
      "#ffa726",
      "#ff7043",
      "#e53935",
    ],
    dark: [
      "#1a1a1a",
      "#4a3000",
      "#6d4c00",
      "#8b6000",
      "#a67300",
      "#c45c00",
      "#e53935",
    ],
  },
  thermal: {
    light: [
      "#f5f5f5",
      "#bbdefb",
      "#64b5f6",
      "#4dd0e1",
      "#81c784",
      "#fff176",
      "#ff8a65",
      "#e53935",
    ],
    dark: [
      "#1a1a1a",
      "#1a237e",
      "#0d47a1",
      "#006064",
      "#1b5e20",
      "#f57f17",
      "#bf360c",
      "#b71c1c",
    ],
  },
} as const

// ============================================================================
// Utility Functions
// ============================================================================

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function parseDate(date: Date | string): Date {
  if (date instanceof Date) return date
  return new Date(date)
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

function getWeekNumber(date: Date, weekStartsOn: 0 | 1 = 0): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const startOfYear = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - startOfYear.getTime()
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  return Math.floor(diff / oneWeek)
}

function getStartOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1)
}

function getEndOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31)
}

function generateDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function defaultGetLevel(value: number, max: number): number {
  if (value <= 0) return 0
  if (max === 0) return 0
  const normalized = value / max
  if (normalized <= 0.25) return 1
  if (normalized <= 0.5) return 2
  if (normalized <= 0.75) return 3
  return 4
}

// ============================================================================
// Component
// ============================================================================

export function HeatmapChart({
  data,
  config,
  className,
  width = 900,
  height = 200,
  margin = { top: 30, right: 30, bottom: 20, left: 50 },
  showTooltip = true,
  variant = "matrix",
  colorScale,
  colorTheme = "green",
  showValues = false,
  cellRadius = 2,
  cellGap = 3,
  cellSize = 12,
  xAxisLabel,
  yAxisLabel,
  valueFormat = (v) => v.toString(),
  weekStartsOn = 0,
  showMonthLabels = true,
  showWeekdayLabels = true,
  legend = {
    show: true,
    position: "top-right",
    lessLabel: "Less",
    moreLabel: "More",
  },
  levels = 5,
  getLevelFromValue = defaultGetLevel,
  onCellClick,
  emptyColor,
}: HeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = React.useState<{
    x: number
    y: number
    data: HeatmapDataPoint | CalendarDataPoint | RadialHeatmapDataPoint
  } | null>(null)
  const chartRef = React.useRef<HTMLDivElement>(null)

  // Detect dark mode
  const [isDark, setIsDark] = React.useState(false)
  React.useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  // Resolve CSS variable colors for "auto" theme
  const [resolvedAutoColors, setResolvedAutoColors] = React.useState<
    string[] | null
  >(null)
  React.useEffect(() => {
    if (colorTheme !== "auto") return
    const resolve = () => {
      const el = chartRef.current || document.documentElement
      const style = getComputedStyle(el)
      const bg = isDark ? "#161b22" : "#ebedf0"
      const c1 = style.getPropertyValue("--chart-1").trim()
      const c3 = style.getPropertyValue("--chart-3").trim()
      const c4 = style.getPropertyValue("--chart-4").trim()
      const c5 = style.getPropertyValue("--chart-5").trim()
      if (c1 && c3 && c5) {
        setResolvedAutoColors([bg, c1, c3, c4, c5])
      }
    }
    resolve()
    const observer = new MutationObserver(resolve)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [colorTheme, isDark])

  // Get colors based on theme
  const colors = React.useMemo(() => {
    if (colorScale) return colorScale
    if (colorTheme === "auto" && resolvedAutoColors) return resolvedAutoColors
    const theme = COLOR_THEMES[colorTheme === "auto" ? "blue" : colorTheme]
    return isDark ? theme.dark : theme.light
  }, [colorScale, colorTheme, isDark, resolvedAutoColors])

  const emptyColorFinal = emptyColor || colors[0]

  // ============================================================================
  // Calendar Variant
  // ============================================================================
  if (variant === "calendar") {
    return (
      <CalendarHeatmap
        data={data as CalendarDataPoint[]}
        config={config}
        className={className}
        width={width}
        height={height}
        margin={margin}
        showTooltip={showTooltip}
        colors={colors}
        cellRadius={cellRadius}
        cellGap={cellGap}
        cellSize={cellSize}
        valueFormat={valueFormat}
        weekStartsOn={weekStartsOn}
        showMonthLabels={showMonthLabels}
        showWeekdayLabels={showWeekdayLabels}
        legend={legend}
        getLevelFromValue={getLevelFromValue}
        onCellClick={onCellClick}
        emptyColor={emptyColorFinal}
        hoveredCell={hoveredCell}
        setHoveredCell={setHoveredCell}
      />
    )
  }

  // ============================================================================
  // Radial Variant
  // ============================================================================
  if (variant === "radial") {
    return (
      <RadialHeatmap
        data={data as RadialHeatmapDataPoint[]}
        config={config}
        className={className}
        width={width}
        height={height}
        margin={margin}
        showTooltip={showTooltip}
        colors={colors}
        cellGap={cellGap}
        valueFormat={valueFormat}
        weekStartsOn={weekStartsOn}
        legend={legend}
        onCellClick={
          onCellClick as ((data: RadialHeatmapDataPoint) => void) | undefined
        }
        emptyColor={emptyColorFinal}
        hoveredCell={hoveredCell}
        setHoveredCell={setHoveredCell}
      />
    )
  }

  // ============================================================================
  // Matrix Variant (Original Implementation)
  // ============================================================================
  const matrixData = data as HeatmapDataPoint[]
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Extract unique labels
  const xLabelsUnique = React.useMemo(() => {
    const labels = [...new Set(matrixData.map((d) => String(d.x)))]
    return labels.sort()
  }, [matrixData])

  const yLabelsUnique = React.useMemo(() => {
    const labels = [...new Set(matrixData.map((d) => String(d.y)))]
    return labels.sort()
  }, [matrixData])

  // Scales
  const xScale = scaleBand()
    .domain(xLabelsUnique)
    .range([0, innerWidth])
    .padding(cellGap / 100)

  const yScale = scaleBand()
    .domain(yLabelsUnique)
    .range([0, innerHeight])
    .padding(cellGap / 100)

  // Value scale for colors
  const values = matrixData.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  const valueScale = scaleLinear().domain([minValue, maxValue]).range([0, 1])

  // Color interpolator
  const getColor = React.useCallback(
    (value: number) => {
      if (colors.length === 2) {
        const t = valueScale(value)
        return interpolateRgb(colors[0], colors[1])(t)
      }
      // Multi-color scale
      const t = valueScale(value)
      const segmentSize = 1 / (colors.length - 1)
      const segmentIndex = Math.min(
        Math.floor(t / segmentSize),
        colors.length - 2
      )
      const segmentT = (t - segmentIndex * segmentSize) / segmentSize
      return interpolateRgb(
        colors[segmentIndex],
        colors[segmentIndex + 1]
      )(segmentT)
    },
    [colors, valueScale]
  )

  // Create data matrix for quick lookup
  const dataMatrix = React.useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {}
    matrixData.forEach((d) => {
      const xKey = String(d.x)
      const yKey = String(d.y)
      if (!matrix[yKey]) matrix[yKey] = {}
      matrix[yKey][xKey] = d.value
    })
    return matrix
  }, [matrixData])

  const compactMode = variant === "compact"
  const effectiveCellRadius = compactMode ? 1 : cellRadius
  const fontSize = compactMode ? 8 : 10

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Cells */}
          {yLabelsUnique.map((yLabel) =>
            xLabelsUnique.map((xLabel) => {
              const value = dataMatrix[yLabel]?.[xLabel]
              if (value === undefined) return null

              const x = xScale(xLabel) ?? 0
              const y = yScale(yLabel) ?? 0
              const cellWidth = xScale.bandwidth()
              const cellHeight = yScale.bandwidth()
              const isHovered =
                hoveredCell?.data &&
                "x" in hoveredCell.data &&
                hoveredCell.data.x === xLabel &&
                hoveredCell.data.y === yLabel

              return (
                <g key={`${xLabel}-${yLabel}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellWidth}
                    height={cellHeight}
                    fill={getColor(value)}
                    rx={effectiveCellRadius}
                    ry={effectiveCellRadius}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      isHovered && "stroke-foreground stroke-2"
                    )}
                    onMouseEnter={(e) =>
                      setHoveredCell({
                        x: e.clientX,
                        y: e.clientY,
                        data: { x: xLabel, y: yLabel, value },
                      })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() =>
                      onCellClick?.({ x: xLabel, y: yLabel, value })
                    }
                  />

                  {/* Value label */}
                  {showValues && cellWidth > 25 && cellHeight > 15 && (
                    <text
                      x={x + cellWidth / 2}
                      y={y + cellHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        "pointer-events-none font-medium",
                        valueScale(value) > 0.5
                          ? "fill-white"
                          : "fill-foreground"
                      )}
                      style={{ fontSize }}
                    >
                      {valueFormat(value)}
                    </text>
                  )}
                </g>
              )
            })
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
        {legend.show && (
          <g
            transform={`translate(${width - margin.right + 15}, ${margin.top})`}
          >
            <defs>
              <linearGradient
                id="heatmap-matrix-gradient"
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                {colors.map((color, i) => (
                  <stop
                    key={i}
                    offset={`${(i / (colors.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </linearGradient>
            </defs>
            <rect
              width={15}
              height={innerHeight}
              fill="url(#heatmap-matrix-gradient)"
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
        )}
      </svg>

      {/* Tooltip */}
      {showTooltip &&
        hoveredCell &&
        hoveredCell.data &&
        "x" in hoveredCell.data && (
          <div
            className="pointer-events-none fixed z-50"
            style={{
              left: hoveredCell.x + 10,
              top: hoveredCell.y - 10,
            }}
          >
            <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
              <div className="font-medium">
                {String(hoveredCell.data.x)} × {String(hoveredCell.data.y)}
              </div>
              <div className="text-muted-foreground">
                Value: {valueFormat(hoveredCell.data.value)}
              </div>
            </div>
          </div>
        )}
    </ChartContainer>
  )
}

// ============================================================================
// Calendar Heatmap Sub-component
// ============================================================================

interface CalendarHeatmapProps {
  data: CalendarDataPoint[]
  config?: BaseChartProps["config"]
  className?: string
  width: number
  height: number
  margin: { top: number; right: number; bottom: number; left: number }
  showTooltip: boolean
  colors: readonly string[] | string[]
  cellRadius: number
  cellGap: number
  cellSize: number
  valueFormat: (value: number) => string
  weekStartsOn: 0 | 1
  showMonthLabels: boolean
  showWeekdayLabels: boolean
  legend: HeatmapLegendConfig
  getLevelFromValue: (value: number, max: number) => number
  onCellClick?: (data: CalendarDataPoint) => void
  emptyColor: string
  hoveredCell: {
    x: number
    y: number
    data: HeatmapDataPoint | CalendarDataPoint | RadialHeatmapDataPoint
  } | null
  setHoveredCell: React.Dispatch<
    React.SetStateAction<{
      x: number
      y: number
      data: HeatmapDataPoint | CalendarDataPoint | RadialHeatmapDataPoint
    } | null>
  >
}

function CalendarHeatmap({
  data,
  config,
  className,
  width,
  height,
  margin,
  showTooltip,
  colors,
  cellRadius,
  cellGap,
  cellSize,
  valueFormat,
  weekStartsOn,
  showMonthLabels,
  showWeekdayLabels,
  legend,
  getLevelFromValue,
  onCellClick,
  emptyColor,
  hoveredCell,
  setHoveredCell,
}: CalendarHeatmapProps) {
  // Build date -> value map
  const dataMap = React.useMemo(() => {
    const map = new Map<string, CalendarDataPoint>()
    data.forEach((d) => {
      const date = parseDate(d.date)
      const key = formatDateKey(date)
      const existing = map.get(key)
      if (existing) {
        // Aggregate values for same date
        map.set(key, { ...d, value: existing.value + d.value })
      } else {
        map.set(key, d)
      }
    })
    return map
  }, [data])

  // Get date range from data
  const dateRange = React.useMemo(() => {
    if (data.length === 0) {
      const now = new Date()
      return {
        start: getStartOfYear(now),
        end: getEndOfYear(now),
      }
    }
    const dates = data.map((d) => parseDate(d.date))
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    // Extend to full year view
    return {
      start: getStartOfYear(minDate),
      end: getEndOfYear(maxDate),
    }
  }, [data])

  // Max value for level calculation
  const maxValue = React.useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1)
  }, [data])

  // Generate all dates in range
  const allDates = React.useMemo(() => {
    return generateDateRange(dateRange.start, dateRange.end)
  }, [dateRange])

  // Group dates by week
  const weeks = React.useMemo(() => {
    const weeksMap: Date[][] = []
    let currentWeek: Date[] = []

    // Pad start to align with week start
    const firstDate = allDates[0]
    const firstDay = firstDate.getDay()
    const padStart = (firstDay - weekStartsOn + 7) % 7
    for (let i = 0; i < padStart; i++) {
      currentWeek.push(new Date(NaN)) // Invalid date placeholder
    }

    allDates.forEach((date) => {
      const day = date.getDay()
      const adjustedDay = (day - weekStartsOn + 7) % 7

      if (adjustedDay === 0 && currentWeek.length > 0) {
        weeksMap.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(date)
    })

    if (currentWeek.length > 0) {
      weeksMap.push(currentWeek)
    }

    return weeksMap
  }, [allDates, weekStartsOn])

  // Calculate month labels positions
  const monthLabels = React.useMemo(() => {
    const labels: { month: string; x: number }[] = []
    let lastMonth = -1

    weeks.forEach((week, weekIndex) => {
      const validDate = week.find((d) => !isNaN(d.getTime()))
      if (validDate) {
        const month = validDate.getMonth()
        if (month !== lastMonth) {
          labels.push({
            month: MONTHS_SHORT[month],
            x: weekIndex * (cellSize + cellGap),
          })
          lastMonth = month
        }
      }
    })

    return labels
  }, [weeks, cellSize, cellGap])

  // Weekday labels (showing only Sun, Tue, Thu, Sat for space)
  const weekdayLabels = React.useMemo(() => {
    const labels: { day: string; y: number }[] = []
    const daysToShow = weekStartsOn === 0 ? [0, 2, 4, 6] : [1, 3, 5]

    daysToShow.forEach((dayIndex) => {
      const adjustedIndex = (dayIndex - weekStartsOn + 7) % 7
      labels.push({
        day: WEEKDAYS_SHORT[dayIndex].toUpperCase(),
        y: adjustedIndex * (cellSize + cellGap) + cellSize / 2,
      })
    })
    return labels
  }, [cellSize, cellGap, weekStartsOn])

  // Calculate dimensions
  const chartWidth = weeks.length * (cellSize + cellGap)
  const chartHeight = 7 * (cellSize + cellGap)
  const labelWidth = showWeekdayLabels ? 35 : 0
  const labelHeight = showMonthLabels ? 20 : 0

  const svgWidth = Math.max(
    width,
    chartWidth + labelWidth + margin.left + margin.right
  )
  const svgHeight = chartHeight + labelHeight + margin.top + margin.bottom

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-auto"
          style={{ minWidth: svgWidth }}
        >
          <g
            transform={`translate(${margin.left + labelWidth}, ${margin.top + labelHeight})`}
          >
            {/* Month labels */}
            {showMonthLabels &&
              monthLabels.map((label, i) => (
                <text
                  key={i}
                  x={label.x}
                  y={-8}
                  className="fill-muted-foreground text-[11px]"
                >
                  {label.month}
                </text>
              ))}

            {/* Weekday labels */}
            {showWeekdayLabels &&
              weekdayLabels.map((label, i) => (
                <text
                  key={i}
                  x={-8}
                  y={label.y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {label.day}
                </text>
              ))}

            {/* Calendar cells */}
            {weeks.map((week, weekIndex) =>
              week.map((date, dayIndex) => {
                if (isNaN(date.getTime())) {
                  return null // Skip placeholder dates
                }

                const key = formatDateKey(date)
                const dataPoint = dataMap.get(key)
                const value = dataPoint?.value ?? 0
                const level = getLevelFromValue(value, maxValue)
                const color = value > 0 ? colors[level] : emptyColor

                const x = weekIndex * (cellSize + cellGap)
                const y = dayIndex * (cellSize + cellGap)

                const isHovered =
                  hoveredCell?.data &&
                  "date" in hoveredCell.data &&
                  hoveredCell.data.date !== undefined &&
                  formatDateKey(parseDate(hoveredCell.data.date)) === key

                return (
                  <rect
                    key={key}
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={color}
                    rx={cellRadius}
                    ry={cellRadius}
                    className={cn(
                      "cursor-pointer transition-all duration-150",
                      isHovered && "stroke-foreground stroke-[1.5]"
                    )}
                    onMouseEnter={(e) =>
                      setHoveredCell({
                        x: e.clientX,
                        y: e.clientY,
                        data: dataPoint || { date, value: 0 },
                      })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() =>
                      onCellClick?.(dataPoint || { date, value: 0 })
                    }
                  />
                )
              })
            )}
          </g>

          {/* Legend */}
          {legend.show && (
            <g
              transform={`translate(${svgWidth - margin.right - colors.length * (cellSize + 2) - 60}, ${margin.top})`}
            >
              <text
                x={0}
                y={cellSize / 2}
                dominantBaseline="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {legend.lessLabel || "Less"}
              </text>
              {colors.map((color, i) => (
                <rect
                  key={i}
                  x={35 + i * (cellSize + 2)}
                  y={0}
                  width={cellSize}
                  height={cellSize}
                  fill={color}
                  rx={cellRadius}
                  ry={cellRadius}
                />
              ))}
              <text
                x={35 + colors.length * (cellSize + 2) + 5}
                y={cellSize / 2}
                dominantBaseline="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {legend.moreLabel || "More"}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {showTooltip &&
        hoveredCell &&
        hoveredCell.data &&
        "date" in hoveredCell.data &&
        hoveredCell.data.date && (
          <div
            className="pointer-events-none fixed z-50"
            style={{
              left: hoveredCell.x + 10,
              top: hoveredCell.y - 10,
            }}
          >
            <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
              <div className="font-medium">
                {parseDate(hoveredCell.data.date!).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-muted-foreground">
                {hoveredCell.data.value > 0
                  ? `${valueFormat(hoveredCell.data.value)} contributions`
                  : "No contributions"}
              </div>
            </div>
          </div>
        )}
    </ChartContainer>
  )
}

// ============================================================================
// Radial Heatmap Sub-component
// ============================================================================

const WEEKDAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const HOURS_12 = [
  "12am",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
]

interface RadialHeatmapProps {
  data: RadialHeatmapDataPoint[]
  config?: BaseChartProps["config"]
  className?: string
  width: number
  height: number
  margin: { top: number; right: number; bottom: number; left: number }
  showTooltip: boolean
  colors: readonly string[] | string[]
  cellGap: number
  valueFormat: (value: number) => string
  weekStartsOn: 0 | 1
  legend: HeatmapLegendConfig
  onCellClick?: (data: RadialHeatmapDataPoint) => void
  emptyColor: string
  hoveredCell: {
    x: number
    y: number
    data: HeatmapDataPoint | CalendarDataPoint | RadialHeatmapDataPoint
  } | null
  setHoveredCell: React.Dispatch<
    React.SetStateAction<{
      x: number
      y: number
      data: HeatmapDataPoint | CalendarDataPoint | RadialHeatmapDataPoint
    } | null>
  >
}

function RadialHeatmap({
  data,
  config,
  className,
  width,
  height,
  margin,
  showTooltip,
  colors,
  cellGap,
  valueFormat,
  weekStartsOn,
  legend,
  onCellClick,
  emptyColor,
  hoveredCell,
  setHoveredCell,
}: RadialHeatmapProps) {
  // Parse day to index (0-6)
  const parseDayIndex = (day: number | string): number => {
    if (typeof day === "number") return day
    const lower = day.toLowerCase()
    const index = WEEKDAYS_FULL.findIndex((d) =>
      d.toLowerCase().startsWith(lower)
    )
    return index >= 0 ? index : 0
  }

  // Parse hour to index (0-23)
  const parseHourIndex = (hour: number | string): number => {
    if (typeof hour === "number") return hour
    const lower = hour.toLowerCase().replace(/\s/g, "")
    const index = HOURS_12.findIndex((h) => h.toLowerCase() === lower)
    return index >= 0 ? index : 0
  }

  // Build data matrix [day][hour] = value
  const dataMatrix = React.useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0)
    )
    data.forEach((d) => {
      const dayIndex = parseDayIndex(d.day)
      const hourIndex = parseHourIndex(d.hour)
      matrix[dayIndex][hourIndex] = (matrix[dayIndex][hourIndex] || 0) + d.value
    })
    return matrix
  }, [data])

  // Get max value for color scaling
  const maxValue = React.useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1)
  }, [data])

  // Calculate dimensions
  const size = Math.min(
    width - margin.left - margin.right,
    height - margin.top - margin.bottom
  )
  const centerX = size / 2
  const centerY = size / 2
  const outerRadius = size / 2 - 30 // Leave space for hour labels
  const innerRadius = outerRadius * 0.35 // Center hole for day labels
  const ringWidth = (outerRadius - innerRadius) / 7 - cellGap / 2

  // Color interpolator
  const getColor = React.useCallback(
    (value: number) => {
      if (value <= 0) return emptyColor
      const t = Math.min(value / maxValue, 1)
      if (colors.length === 2) {
        return interpolateRgb(colors[0], colors[1])(t)
      }
      const segmentSize = 1 / (colors.length - 1)
      const segmentIndex = Math.min(
        Math.floor(t / segmentSize),
        colors.length - 2
      )
      const segmentT = (t - segmentIndex * segmentSize) / segmentSize
      return interpolateRgb(
        colors[segmentIndex],
        colors[segmentIndex + 1]
      )(segmentT)
    },
    [colors, maxValue, emptyColor]
  )

  // Generate arc path
  const generateArc = (dayIndex: number, hourIndex: number): string => {
    // Day rings: Sunday (0) is innermost, Saturday (6) is outermost
    const dayRadius = innerRadius + dayIndex * (ringWidth + cellGap / 2)
    const nextDayRadius = dayRadius + ringWidth

    // Hour segments: 12am starts at bottom (270 degrees), going clockwise
    const hourAngle = 360 / 24
    const startAngle = (270 + hourIndex * hourAngle) % 360
    const endAngle = (startAngle + hourAngle - cellGap) % 360

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    // Calculate points
    const innerStartX = centerX + dayRadius * Math.cos(startRad)
    const innerStartY = centerY + dayRadius * Math.sin(startRad)
    const innerEndX = centerX + dayRadius * Math.cos(endRad)
    const innerEndY = centerY + dayRadius * Math.sin(endRad)
    const outerStartX = centerX + nextDayRadius * Math.cos(startRad)
    const outerStartY = centerY + nextDayRadius * Math.sin(startRad)
    const outerEndX = centerX + nextDayRadius * Math.cos(endRad)
    const outerEndY = centerY + nextDayRadius * Math.sin(endRad)

    const largeArc = hourAngle - cellGap > 180 ? 1 : 0

    return `
      M ${innerStartX} ${innerStartY}
      A ${dayRadius} ${dayRadius} 0 ${largeArc} 1 ${innerEndX} ${innerEndY}
      L ${outerEndX} ${outerEndY}
      A ${nextDayRadius} ${nextDayRadius} 0 ${largeArc} 0 ${outerStartX} ${outerStartY}
      Z
    `
  }

  // Generate hour label positions
  const hourLabels = React.useMemo(() => {
    const labels: { hour: string; x: number; y: number; angle: number }[] = []
    const labelRadius = outerRadius + 18

    for (let i = 0; i < 24; i++) {
      const angle = (270 + i * 15 + 7.5) % 360 // Center of each hour segment
      const rad = (angle * Math.PI) / 180
      labels.push({
        hour: HOURS_12[i],
        x: centerX + labelRadius * Math.cos(rad),
        y: centerY + labelRadius * Math.sin(rad),
        angle: angle > 90 && angle < 270 ? angle + 180 : angle,
      })
    }
    return labels
  }, [centerX, centerY, outerRadius])

  // Order days based on weekStartsOn
  const orderedDays = React.useMemo(() => {
    const days = [...WEEKDAYS_FULL]
    if (weekStartsOn === 1) {
      // Monday first
      days.push(days.shift()!) // Move Sunday to end
    }
    return days
  }, [weekStartsOn])

  return (
    <ChartContainer config={config} className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${size + margin.left + margin.right} ${size + margin.top + margin.bottom + 60}`}
        className="h-full w-full"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Hour labels around the outside */}
          {hourLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px]"
              transform={`rotate(${label.angle - 90}, ${label.x}, ${label.y})`}
            >
              {label.hour}
            </text>
          ))}

          {/* Radial cells */}
          {Array.from({ length: 7 }).map((_, dayIdx) => {
            const actualDayIndex =
              weekStartsOn === 1 ? (dayIdx + 1) % 7 : dayIdx
            return Array.from({ length: 24 }).map((_, hourIdx) => {
              const value = dataMatrix[actualDayIndex][hourIdx]
              const color = getColor(value)
              const path = generateArc(dayIdx, hourIdx)

              const isHovered =
                hoveredCell?.data &&
                "day" in hoveredCell.data &&
                "hour" in hoveredCell.data &&
                parseDayIndex(hoveredCell.data.day) === actualDayIndex &&
                parseHourIndex(hoveredCell.data.hour) === hourIdx

              return (
                <path
                  key={`${dayIdx}-${hourIdx}`}
                  d={path}
                  fill={color}
                  stroke={isHovered ? "var(--foreground)" : "var(--background)"}
                  strokeWidth={isHovered ? 2 : 0.5}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={(e) =>
                    setHoveredCell({
                      x: e.clientX,
                      y: e.clientY,
                      data: {
                        day: actualDayIndex,
                        hour: hourIdx,
                        value,
                      },
                    })
                  }
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() =>
                    onCellClick?.({
                      day: actualDayIndex,
                      hour: hourIdx,
                      value,
                    })
                  }
                />
              )
            })
          })}

          {/* Day labels in center */}
          {orderedDays.map((day, i) => (
            <text
              key={day}
              x={centerX}
              y={centerY - innerRadius + 20 + i * 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[11px] font-medium"
            >
              {day}
            </text>
          ))}
        </g>

        {/* Legend */}
        {legend.show && (
          <g transform={`translate(${margin.left}, ${size + margin.top + 20})`}>
            <defs>
              <linearGradient
                id="radial-heatmap-gradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                {colors.map((color, i) => (
                  <stop
                    key={i}
                    offset={`${(i / (colors.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </linearGradient>
            </defs>
            <text x={0} y={10} className="fill-muted-foreground text-[11px]">
              {legend.lessLabel || "Less"}
            </text>
            <rect
              x={35}
              y={0}
              width={size - 100}
              height={16}
              fill="url(#radial-heatmap-gradient)"
              rx={3}
            />
            <text
              x={size - 60}
              y={10}
              className="fill-muted-foreground text-[11px]"
            >
              {legend.moreLabel || "More"}
            </text>
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {showTooltip &&
        hoveredCell &&
        hoveredCell.data &&
        "day" in hoveredCell.data &&
        "hour" in hoveredCell.data && (
          <div
            className="pointer-events-none fixed z-50"
            style={{
              left: hoveredCell.x + 10,
              top: hoveredCell.y - 10,
            }}
          >
            <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
              <div className="font-medium">
                {WEEKDAYS_FULL[parseDayIndex(hoveredCell.data.day)]},{" "}
                {HOURS_12[parseHourIndex(hoveredCell.data.hour)]}
              </div>
              <div className="text-muted-foreground">
                Value: {valueFormat(hoveredCell.data.value)}
              </div>
            </div>
          </div>
        )}
    </ChartContainer>
  )
}
