"use client"

import * as React from "react"

import type { ChartTagVariant, ChartTickVariant } from "./chart-theme"

/**
 * Annotation renderers for Recharts cartesian charts.
 *
 * These are exported as *render functions* rather than components on
 * purpose: Recharts discovers `ReferenceLine` / axis `tick` children by
 * type, so a wrapper component would be invisible to it. A function passed
 * to `label={...}` / `tick={...}` is called with the layout props and can
 * return whatever SVG it likes.
 */

interface ViewBox {
  x?: number
  y?: number
  width?: number
  height?: number
}

/** Rough advance width. Charts render in the app's sans stack, so a fixed
 *  ratio beats measuring the DOM for a label this small. Override with
 *  `width` when a font makes it visibly wrong. */
function estimateWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.58
}

/** Anything Recharts can use as a `label` / `tick`: it is handed the layout
 *  props and returns SVG. Pass your own to replace a built-in variant
 *  wholesale rather than configuring it. */
export type ChartLabelRenderer = (props: {
  viewBox?: ViewBox
  x?: number
  y?: number
  payload?: { value?: string | number }
}) => React.ReactElement<SVGElement>

export interface ChartTagLabelOptions {
  /**
   * `plain` prints the text alone, `pill` sets it in a rounded chip and
   * `flag` gives the chip a point aimed along the line. Default `plain`:
   * a filled chip floating over a plot reads as a stuck tooltip.
   */
  variant?: ChartTagVariant
  background?: string
  foreground?: string
  fontSize?: number
  /** Which end of the line the label hangs off. */
  side?: "left" | "right"
  /** Horizontal nudge, px. Negative pulls the label outside the plot. */
  dx?: number
  /** Vertical nudge, px. `plain` sits above the line by default. */
  dy?: number
  paddingX?: number
  height?: number
  radius?: number
  /** Length of the point on the `flag` variant. */
  tip?: number
  /** Skip the estimator when you know the exact width. */
  width?: number
}

/**
 * Label for a reference line.
 *
 * ```tsx
 * <ReferenceLine y={avg} label={chartTagLabel("Avg 6.8%", { variant: "flag" })} />
 * ```
 */
export function chartTagLabel(
  text: string,
  options: ChartTagLabelOptions = {}
) {
  const {
    variant = "plain",
    background = "var(--foreground)",
    foreground = "var(--background)",
    fontSize = 11,
    side = "left",
    dx = 0,
    dy,
    paddingX = 8,
    height = 22,
    radius = 6,
    tip = 6,
    width,
  } = options

  return function TagLabel(props: { viewBox?: ViewBox }) {
    const box = props.viewBox ?? {}
    const boxX = box.x ?? 0
    const boxY = box.y ?? 0
    const boxWidth = box.width ?? 0

    if (variant === "plain") {
      const anchor = side === "left" ? "start" : "end"
      const x = side === "left" ? boxX + dx : boxX + boxWidth + dx
      return (
        <text
          x={x}
          y={boxY + (dy ?? -6)}
          textAnchor={anchor}
          fill="var(--muted-foreground)"
          fontSize={fontSize}
          fontWeight={500}
          style={{ pointerEvents: "none" }}
        >
          {text}
        </text>
      )
    }

    const pointed = variant === "flag"
    const point = pointed ? tip : 0
    const w = width ?? estimateWidth(text, fontSize) + paddingX * 2 + point
    const h = height
    const r = Math.min(radius, h / 2)
    const x = side === "left" ? boxX + dx : boxX + boxWidth - w + dx
    const y = boxY - h / 2 + (dy ?? 0)

    // Rounded on the blunt end; the flag variant points along the line.
    const path = !pointed
      ? `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`
      : side === "left"
        ? `M ${r} 0 H ${w - point} L ${w} ${h / 2} L ${w - point} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`
        : `M ${point} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${point} L 0 ${h / 2} Z`

    return (
      <g transform={`translate(${x}, ${y})`} style={{ pointerEvents: "none" }}>
        <path d={path} fill={background} />
        <text
          x={
            pointed && side === "right"
              ? point + (w - point) / 2
              : (w - point) / 2
          }
          y={h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={foreground}
          fontSize={fontSize}
          fontWeight={500}
        >
          {text}
        </text>
      </g>
    )
  }
}

export interface ChartPillTickOptions {
  /** `plain` marks the active tick with weight and colour only. */
  variant?: ChartTickVariant
  fontSize?: number
  background?: string
  foreground?: string
  mutedForeground?: string
  paddingX?: number
  height?: number
  formatter?: (value: string) => string
}

/**
 * Category-axis tick that marks out one category.
 *
 * ```tsx
 * <XAxis dataKey="label" tick={chartActiveTick("May", { variant: "pill" })} />
 * ```
 */
export function chartActiveTick(
  activeLabel: string | null | undefined,
  options: ChartPillTickOptions = {}
) {
  const {
    variant = "plain",
    fontSize = 12,
    background = "color-mix(in oklab, var(--chart-3) 15%, transparent)",
    foreground = "var(--chart-3)",
    mutedForeground = "var(--muted-foreground)",
    paddingX = 12,
    height = 26,
    formatter,
  } = options

  return function ActiveTick(props: {
    x?: number
    y?: number
    payload?: { value?: string | number }
  }) {
    const raw = String(props.payload?.value ?? "")
    const text = formatter ? formatter(raw) : raw
    const active = activeLabel != null && raw === activeLabel
    const w = estimateWidth(text, fontSize) + paddingX * 2

    return (
      <g transform={`translate(${props.x ?? 0}, ${props.y ?? 0})`}>
        {active && variant === "pill" && (
          <rect
            x={-w / 2}
            y={0}
            width={w}
            height={height}
            rx={height / 2}
            fill={background}
          />
        )}
        {active && variant === "underline" && (
          <rect
            x={-w / 4}
            y={height - 2}
            width={w / 2}
            height={2}
            rx={1}
            fill={foreground}
          />
        )}
        <text
          x={0}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={active ? 600 : 400}
          fill={active ? foreground : mutedForeground}
        >
          {text}
        </text>
      </g>
    )
  }
}

/** @deprecated Use `chartActiveTick`, which takes a `variant`. */
export const chartPillTick = (
  activeLabel: string | null | undefined,
  options: ChartPillTickOptions = {}
) => chartActiveTick(activeLabel, { variant: "pill", ...options })

export interface ChartValueLabelOptions {
  fontSize?: number
  color?: string
  /** Gap between the mark and the label, px. */
  offset?: number
  fontWeight?: number
}

/**
 * `LabelList` content that prints the value above *only* the emphasised
 * marks, so a dense chart gets one readable callout instead of forty.
 */
export function chartActiveValueLabel(
  isActive: (index: number) => boolean,
  format: (value: number) => string,
  options: ChartValueLabelOptions = {}
) {
  const {
    fontSize = 13,
    color = "var(--foreground)",
    offset = 10,
    fontWeight = 600,
  } = options

  // Recharts hands `LabelList` content the raw layout props, where the
  // geometry can arrive as strings — hence the coercion rather than `??`.
  return function ActiveValueLabel(props: {
    x?: number | string
    y?: number | string
    width?: number | string
    value?: number | string
    index?: number
  }) {
    const index = props.index ?? -1
    if (!isActive(index)) return <g />
    const value = Number(props.value)
    if (!Number.isFinite(value)) return <g />
    const x = Number(props.x) || 0
    const y = Number(props.y) || 0
    const width = Number(props.width) || 0

    return (
      <text
        x={x + width / 2}
        y={y - offset}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight={fontWeight}
        fill={color}
      >
        {format(value)}
      </text>
    )
  }
}

/** Resolve `"avg" | "min" | "max" | number` against the plotted values. */
export function resolveReferenceValue(
  spec: number | "avg" | "min" | "max",
  values: number[]
): number | null {
  if (typeof spec === "number") return Number.isFinite(spec) ? spec : null
  const finite = values.filter((v) => Number.isFinite(v))
  if (!finite.length) return null
  if (spec === "min") return Math.min(...finite)
  if (spec === "max") return Math.max(...finite)
  return finite.reduce((a, b) => a + b, 0) / finite.length
}
