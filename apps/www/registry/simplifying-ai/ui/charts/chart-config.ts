"use client"

import * as React from "react"

// Theme configuration for light/dark mode
export const THEMES = { light: "", dark: ".dark" } as const

// Chart configuration type - matches shadcn/ui pattern
export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

// Default chart dimensions
export const DEFAULT_CHART_DIMENSIONS = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 50 },
} as const

// Default chart colors (CSS variable references)
export const DEFAULT_CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

// Get color from config or fallback to default
export function getChartColor(
  config: ChartConfig | undefined,
  key: string,
  index: number
): string {
  if (config?.[key]?.color) {
    return config[key].color!
  }
  if (config?.[key]?.theme) {
    // Theme colors handled by CSS variables
    return `var(--color-${key})`
  }
  return DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
}

// Generate CSS variables from config
export function generateChartStyles(
  chartId: string,
  config: ChartConfig
): string {
  const colorConfig = Object.entries(config).filter(
    ([, cfg]) => cfg.theme || cfg.color
  )

  if (!colorConfig.length) return ""

  return Object.entries(THEMES)
    .map(
      ([theme, prefix]) => `
${prefix} [data-chart="${chartId}"] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}`
    )
    .join("\n")
}

// Common data types
export interface ChartDataPoint {
  label: string
  value: number
  [key: string]: unknown
}

export interface ChartSeries {
  name: string
  data: ChartDataPoint[]
  color?: string
}

// Axis types
export type AxisOrientation = "top" | "right" | "bottom" | "left"
export type AxisScale = "linear" | "log" | "time" | "band" | "point"

// Common chart props
export interface BaseChartProps {
  className?: string
  config?: ChartConfig
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  animate?: boolean
}
