"use client"

import * as React from "react"
import {
  Bar,
  CartesianGrid,
  Cell,
  LabelList,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

// ============================================
// Bar Chart
// ============================================

export interface BarChartDataPoint {
  label: string
  value: number
  fill?: string
  [key: string]: unknown
}

export interface BarChartProps {
  data: BarChartDataPoint[]
  className?: string
  color?: string
  showGrid?: boolean
  showTooltip?: boolean
  showLabel?: boolean
  labelPosition?: "top" | "center" | "bottom" | "inside"
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
  layout?: "vertical" | "horizontal"
  barRadius?: number
  aspectRatio?: number
  yAxisWidth?: number
}

export function BarChart({
  data,
  className,
  color = "var(--chart-3)",
  showGrid = true,
  showTooltip = true,
  showLabel = false,
  labelPosition = "top",
  valueFormatter = (value) => `${value}`,
  labelFormatter = (label) => label,
  layout = "horizontal",
  barRadius = 4,
  aspectRatio = 2,
  yAxisWidth = 48,
}: BarChartProps) {
  const isVertical = layout === "vertical"

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" aspect={aspectRatio}>
        <RechartsBarChart
          data={data}
          layout={isVertical ? "vertical" : "horizontal"}
          margin={{
            top: showLabel ? 20 : 10,
            right: 10,
            left: 10,
            bottom: 40,
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={true}
              horizontal={true}
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
            />
          )}

          {isVertical ? (
            <>
              <YAxis
                dataKey="label"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={labelFormatter}
                width={yAxisWidth}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={valueFormatter}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={labelFormatter}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={valueFormatter}
                width={yAxisWidth}
              />
            </>
          )}

          {showTooltip && (
            <Tooltip
              cursor={{ fill: "hsl(var(--muted-foreground))", opacity: 0.08 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
                    <p className="text-foreground text-sm font-medium">
                      {labelFormatter(label)}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: payload[0]?.color || color }}
                    >
                      {valueFormatter(payload[0]?.value as number)}
                    </p>
                  </div>
                )
              }}
            />
          )}

          <Bar dataKey="value" fill={color} radius={barRadius} maxBarSize={50}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || color} />
            ))}
            {showLabel && (
              <LabelList
                dataKey="value"
                position={labelPosition}
                formatter={valueFormatter}
                className="fill-foreground text-xs"
              />
            )}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
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

export interface MultiBarChartProps {
  data: MultiBarChartDataPoint[]
  series: MultiBarChartSeries[]
  className?: string
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
  layout?: "vertical" | "horizontal"
  barRadius?: number
  aspectRatio?: number
  yAxisWidth?: number
}

export function MultiBarChart({
  data,
  series,
  className,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  valueFormatter = (value) => `${value}`,
  labelFormatter = (label) => label,
  layout = "horizontal",
  barRadius = 4,
  aspectRatio = 2,
  yAxisWidth = 48,
}: MultiBarChartProps) {
  const isVertical = layout === "vertical"

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" aspect={aspectRatio}>
        <RechartsBarChart
          data={data}
          layout={isVertical ? "vertical" : "horizontal"}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 40,
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={true}
              horizontal={true}
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
            />
          )}

          {isVertical ? (
            <>
              <YAxis
                dataKey="label"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={labelFormatter}
                width={yAxisWidth}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={valueFormatter}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={labelFormatter}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={valueFormatter}
                width={yAxisWidth}
              />
            </>
          )}

          {showTooltip && (
            <Tooltip
              cursor={{ fill: "hsl(var(--muted-foreground))", opacity: 0.08 }}
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

          {series.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color}
              radius={barRadius}
              stackId={s.stackId}
              maxBarSize={40}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>

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
