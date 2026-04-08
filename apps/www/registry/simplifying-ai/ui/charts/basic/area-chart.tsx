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

export interface AreaChartDataPoint {
  label: string
  value: number
  [key: string]: unknown
}

export interface AreaChartProps {
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
  aspectRatio?: number
  curveType?: "linear" | "monotone" | "step"
}

export function AreaChart({
  data,
  className,
  color = "var(--chart-1)",
  gradientFrom = "var(--chart-1)",
  gradientTo = "var(--chart-2)",
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
  curveType = "linear",
}: AreaChartProps) {
  const gradientId = React.useId().replace(/:/g, "")
  const patternId = React.useId().replace(/:/g, "")

  // Calculate domain from data if not provided
  const calculatedDomain = React.useMemo(() => {
    if (yAxisDomain) return yAxisDomain
    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1
    return [
      Math.max(0, Math.floor((min - padding) / 10) * 10),
      Math.ceil((max + padding) / 10) * 10,
    ] as [number, number]
  }, [data, yAxisDomain])

  // Calculate ticks if not provided
  const calculatedTicks = React.useMemo(() => {
    if (yAxisTicks) return yAxisTicks
    const [min, max] = calculatedDomain
    const step = (max - min) / 4
    return Array.from({ length: 5 }, (_, i) => Math.round(min + step * i))
  }, [calculatedDomain, yAxisTicks])

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" aspect={aspectRatio}>
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 10,
            bottom: xAxisAngle === 0 ? 20 : 60,
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
              <circle cx="1.5" cy="1.5" r="0.75" fill="rgba(255,255,255,0.3)" />
            </pattern>
          </defs>

          {/* Grid */}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={true}
              horizontal={true}
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
            />
          )}

          {/* Y-Axis */}
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

          {/* X-Axis */}
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

          {/* Tooltip with cursor line */}
          {showTooltip && (
            <Tooltip
              cursor={
                showCursor
                  ? {
                      stroke: "hsl(var(--muted-foreground))",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }
                  : false
              }
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
                    <p className="text-foreground text-sm font-medium">
                      {labelFormatter(label)}
                    </p>
                    {payload.map((entry, index) => (
                      <p
                        key={index}
                        className="text-sm"
                        style={{ color: entry.color }}
                      >
                        {entry.name}: {valueFormatter(entry.value as number)}
                      </p>
                    ))}
                  </div>
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
                    fill: "hsl(var(--background))",
                    stroke: color,
                    strokeWidth: 2,
                  }
                : false
            }
            activeDot={{
              r: 4,
              fill: color,
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
            isAnimationActive={animate}
            animationBegin={200}
            animationDuration={1800}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
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

export interface MultiAreaChartProps {
  data: MultiAreaChartDataPoint[]
  series: MultiAreaChartSeries[]
  className?: string
  showGrid?: boolean
  showTooltip?: boolean
  showCursor?: boolean
  showLegend?: boolean
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
  yAxisDomain?: [number, number]
  yAxisTicks?: number[]
  animate?: boolean
  strokeWidth?: number
  xAxisAngle?: number
  aspectRatio?: number
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
  valueFormatter = (value) => `${value}`,
  labelFormatter = (label) => label,
  yAxisDomain,
  yAxisTicks,
  animate = true,
  strokeWidth = 2,
  xAxisAngle = 0,
  aspectRatio = 2,
  curveType = "monotone",
  stacked = false,
  gradientOpacity = [0.6, 0.1],
}: MultiAreaChartProps) {
  const baseId = React.useId().replace(/:/g, "")

  // Calculate domain from all series data
  const calculatedDomain = React.useMemo(() => {
    if (yAxisDomain) return yAxisDomain
    const allValues = data.flatMap((d) =>
      series.map((s) => (d[s.dataKey] as number) || 0)
    )
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.1
    return [
      Math.max(0, Math.floor((min - padding) / 10) * 10),
      Math.ceil((max + padding) / 10) * 10,
    ] as [number, number]
  }, [data, series, yAxisDomain])

  const calculatedTicks = React.useMemo(() => {
    if (yAxisTicks) return yAxisTicks
    const [min, max] = calculatedDomain
    const step = (max - min) / 4
    return Array.from({ length: 5 }, (_, i) => Math.round(min + step * i))
  }, [calculatedDomain, yAxisTicks])

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" aspect={aspectRatio}>
        <ComposedChart
          data={data}
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
              stroke="hsl(var(--border))"
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
                      stroke: "hsl(var(--muted-foreground))",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }
                  : false
              }
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
                    <p className="text-foreground mb-1 text-sm font-medium">
                      {labelFormatter(label)}
                    </p>
                    {payload.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
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
                  </div>
                )
              }}
            />
          )}

          {/* Render areas in reverse order so first series is on top */}
          {[...series].reverse().map((s, i) => (
            <Area
              key={`${s.dataKey}-fill`}
              type={curveType}
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={strokeWidth}
              fill={`url(#gradient-${baseId}-${series.length - 1 - i})`}
              fillOpacity={1}
              stackId={stacked ? "stack" : undefined}
              isAnimationActive={animate}
              animationBegin={i * 100}
              animationDuration={1500}
              animationEasing="ease-out"
              activeDot={{
                r: 4,
                fill: s.color,
                stroke: "hsl(var(--background))",
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
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          {series.map((s) => (
            <div key={s.dataKey} className="flex items-center gap-2 text-sm">
              <div
                className="size-3 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
