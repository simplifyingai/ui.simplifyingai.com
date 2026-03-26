"use client"

import { extent, max, min } from "d3-array"
import {
  scaleBand,
  scaleLinear,
  scaleLog,
  scaleOrdinal,
  scaleTime,
} from "d3-scale"

// Re-export D3 utilities for convenience
export { scaleLinear, scaleBand, scaleTime, scaleLog, scaleOrdinal }
export { max, min, extent }

// Common scale creation utilities
export interface CreateLinearScaleOptions {
  domain: [number, number]
  range: [number, number]
  nice?: boolean
  padding?: number
}

export function createLinearScale({
  domain,
  range,
  nice = true,
  padding = 0.1,
}: CreateLinearScaleOptions) {
  const [minVal, maxVal] = domain
  const paddedDomain: [number, number] = [
    minVal - (maxVal - minVal) * padding,
    maxVal + (maxVal - minVal) * padding,
  ]

  const scale = scaleLinear().domain(paddedDomain).range(range)
  return nice ? scale.nice() : scale
}

export interface CreateBandScaleOptions {
  domain: string[]
  range: [number, number]
  padding?: number
  paddingInner?: number
  paddingOuter?: number
}

export function createBandScale({
  domain,
  range,
  padding = 0.2,
  paddingInner,
  paddingOuter,
}: CreateBandScaleOptions) {
  const scale = scaleBand().domain(domain).range(range)

  if (paddingInner !== undefined && paddingOuter !== undefined) {
    return scale.paddingInner(paddingInner).paddingOuter(paddingOuter)
  }

  return scale.padding(padding)
}

// Data processing utilities
export function getDataExtent<T>(
  data: T[],
  accessor: (d: T) => number
): [number, number] {
  const values = data.map(accessor)
  return [Math.min(...values), Math.max(...values)]
}

export function normalizeData<T extends Record<string, unknown>>(
  data: T[],
  keys: string[]
): T[] {
  const maxValues = keys.reduce(
    (acc, key) => {
      acc[key] = Math.max(...data.map((d) => Number(d[key]) || 0))
      return acc
    },
    {} as Record<string, number>
  )

  return data.map((d) => {
    const normalized = { ...d }
    keys.forEach((key) => {
      if (maxValues[key] > 0) {
        ;(normalized as Record<string, unknown>)[`${key}_normalized`] =
          (Number(d[key]) || 0) / maxValues[key]
      }
    })
    return normalized
  })
}

// Color utilities
export function interpolateColor(
  color1: string,
  color2: string,
  t: number
): string {
  // Simple linear interpolation for hex colors
  const hex1 = color1.replace("#", "")
  const hex2 = color2.replace("#", "")

  const r1 = parseInt(hex1.substring(0, 2), 16)
  const g1 = parseInt(hex1.substring(2, 4), 16)
  const b1 = parseInt(hex1.substring(4, 6), 16)

  const r2 = parseInt(hex2.substring(0, 2), 16)
  const g2 = parseInt(hex2.substring(2, 4), 16)
  const b2 = parseInt(hex2.substring(4, 6), 16)

  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

export function generateColorScale(
  count: number,
  baseColor?: string
): string[] {
  if (count <= 0) return []

  // Default chart colors (CSS variables)
  const defaultColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ]

  if (!baseColor) {
    return Array.from(
      { length: count },
      (_, i) => defaultColors[i % defaultColors.length]
    )
  }

  // Generate shades of the base color
  return Array.from({ length: count }, (_, i) => {
    const lightness = 0.3 + (0.5 * i) / (count - 1 || 1)
    return `hsl(from ${baseColor} h s ${lightness * 100}%)`
  })
}

// Animation utilities
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3
  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

// Number formatting utilities
export function formatNumber(value: number, decimals = 0): string {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`
  }
  return value.toFixed(decimals)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

// Geometry utilities
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

export function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ")
}

// SVG path utilities
export function linePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ""

  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
}

export function smoothLinePath(
  points: Array<{ x: number; y: number }>,
  smoothing = 0.2
): string {
  if (points.length < 2) return linePath(points)

  const line = (
    pointA: { x: number; y: number },
    pointB: { x: number; y: number }
  ) => {
    const lengthX = pointB.x - pointA.x
    const lengthY = pointB.y - pointA.y
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX),
    }
  }

  const controlPoint = (
    current: { x: number; y: number },
    previous: { x: number; y: number } | undefined,
    next: { x: number; y: number } | undefined,
    reverse?: boolean
  ) => {
    const p = previous ?? current
    const n = next ?? current
    const l = line(p, n)
    const angle = l.angle + (reverse ? Math.PI : 0)
    const length = l.length * smoothing
    return {
      x: current.x + Math.cos(angle) * length,
      y: current.y + Math.sin(angle) * length,
    }
  }

  return points.reduce((path, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`

    const cp1 = controlPoint(arr[i - 1], arr[i - 2], point)
    const cp2 = controlPoint(point, arr[i - 1], arr[i + 1], true)

    return `${path} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${point.x} ${point.y}`
  }, "")
}
