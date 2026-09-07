"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Container-driven responsiveness.
 *
 * Everything here measures the chart's own box, never the viewport: a chart
 * in a 320px sidebar on a desktop has exactly the problems a chart on a
 * phone has, and viewport media queries get that wrong in both directions.
 */

/** Container widths, not viewport widths. */
export const CHART_BREAKPOINTS = {
  base: 0,
  sm: 420,
  md: 640,
  lg: 900,
  xl: 1200,
} as const

export type ChartBreakpoint = keyof typeof CHART_BREAKPOINTS

/** A plain value, or one per container-width breakpoint. */
export type Responsive<T> = T | Partial<Record<ChartBreakpoint, T>>

const ORDER: ChartBreakpoint[] = ["base", "sm", "md", "lg", "xl"]

function isBreakpointMap<T>(
  value: Responsive<T>
): value is Partial<Record<ChartBreakpoint, T>> {
  return (
    typeof value === "object" &&
    value !== null &&
    ORDER.some((k) => k in (value as object))
  )
}

/** Pick the value for the widest breakpoint the container has reached. */
export function resolveResponsive<T>(
  value: Responsive<T> | undefined,
  width: number,
  fallback: T
): T {
  if (value === undefined) return fallback
  if (!isBreakpointMap(value)) return value
  let resolved = fallback
  for (const key of ORDER) {
    const candidate = value[key]
    if (candidate !== undefined && width >= CHART_BREAKPOINTS[key]) {
      resolved = candidate
    }
  }
  return resolved
}

/** Measured width of an element. 0 until the first observation, which is
 *  the signal to render nothing rather than a chart at the wrong size. */
export function useChartSize<T extends HTMLElement>() {
  const ref = React.useRef<T>(null)
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(Math.round(el.getBoundingClientRect().width))
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

/**
 * Recharts' `interval` (categories skipped between drawn ticks) that keeps
 * labels from colliding at the measured width. `0` draws every tick.
 */
export function autoTickInterval(
  count: number,
  width: number,
  approxLabelPx = 48
): number {
  if (!width || count <= 1) return 0
  const fits = Math.max(1, Math.floor(width / approxLabelPx))
  if (count <= fits) return 0
  return Math.ceil(count / fits) - 1
}

/**
 * Width a category axis gutter needs so its labels don't wrap into each
 * other.
 *
 * Recharts wraps tick text to the axis `width`, so a constant gutter turns
 * "TATA CONSULTANCY SERVICES LTD" into three stacked lines that collide
 * with the neighbouring row — the labels are drawn, they're just
 * unreadable. Size the gutter to the longest label instead.
 *
 * Estimated, not measured: a canvas measurement would be exact but needs a
 * DOM, re-runs on every data change, and is wrong during SSR. ~0.58em per
 * character is close enough for the sans stack these charts ship with, and
 * erring wide only costs plot width.
 *
 * `maxFraction` is the escape hatch: one 80-character outlier must not eat
 * the plot, so the gutter is capped at a share of the container and that
 * label wraps (into a row that now has the width to hold two lines).
 */
export function categoryAxisWidth(
  labels: ReadonlyArray<unknown>,
  containerWidth: number,
  {
    fontSize = 12,
    min = 48,
    maxFraction = 0.34,
  }: { fontSize?: number; min?: number; maxFraction?: number } = {}
): number {
  let longest = 0
  for (const l of labels) {
    const len = l == null ? 0 : String(l).length
    if (len > longest) longest = len
  }
  if (!longest) return min
  const wanted = Math.ceil(longest * fontSize * 0.58) + 12
  // Before the first measurement `containerWidth` is 0 — cap on a
  // desktop-ish assumption rather than letting `wanted` run unbounded.
  const ceiling = Math.round((containerWidth || 640) * maxFraction)
  return Math.min(Math.max(min, wanted), Math.max(min, ceiling))
}

/**
 * What to do when the categories outnumber the pixels.
 *
 * `compress` squeezes them into the container (the default, and what every
 * chart did before). `scroll` gives each category a floor width and lets
 * the plot overflow, which is the only honest option once bars are thinner
 * than the gaps between them.
 */
export type ChartOverflow = "compress" | "scroll"

export interface ChartScrollAreaProps {
  /** Which way the categories run. `x` scrolls sideways, `y` down. */
  axis?: "x" | "y"
  /** Floor size of the plot along `axis`, px. Below this it just fits. */
  minSize: number
  /** Cap on the visible box along `axis` when scrolling down. */
  maxHeight?: number
  className?: string
  children: React.ReactNode
}

/**
 * Scroll container for an oversized plot.
 *
 * `overscroll-contain` matters more than it looks: without it a sideways
 * swipe on iOS runs past the end of the chart and triggers back-navigation.
 */
export function ChartScrollArea({
  axis = "x",
  minSize,
  maxHeight,
  className,
  children,
}: ChartScrollAreaProps) {
  const horizontal = axis === "x"
  return (
    <div
      className={cn(
        "relative",
        horizontal
          ? "overflow-x-auto overflow-y-hidden overscroll-x-contain"
          : "overflow-x-hidden overflow-y-auto overscroll-y-contain",
        // Thin, unobtrusive scrollbar; still a real one, so the affordance
        // survives for anyone who needs it.
        "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5",
        "[&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        className
      )}
      style={{
        maxHeight: horizontal ? undefined : maxHeight,
        touchAction: horizontal ? "pan-x pan-y" : "pan-y",
      }}
    >
      <div style={horizontal ? { minWidth: minSize } : { minHeight: minSize }}>
        {children}
      </div>
    </div>
  )
}

export interface CategoryLayout {
  /** Width the plot renders at — the container's, unless it overflows. */
  plotWidth: number
  /** Height the plot renders at. */
  plotHeight: number
  /** True when the plot is larger than its container along `axis`. */
  scrolls: boolean
  /** Screen axis the categories run along. */
  axis: "x" | "y"
  /** Height of the visible box when the plot scrolls downwards. */
  viewportHeight: number
}

/**
 * How big a category chart should draw itself, and whether that overflows.
 *
 * `minCategorySize` is the room one bar/point needs to stay legible. Below
 * it, `compress` keeps squeezing — which is how forty bars become a smear —
 * and `scroll` starts overflowing instead.
 */
export function useCategoryLayout({
  count,
  containerWidth,
  aspectRatio,
  minHeight,
  overflow,
  minCategorySize,
  axis = "x",
}: {
  count: number
  containerWidth: number
  aspectRatio: Responsive<number> | undefined
  minHeight: number
  overflow: ChartOverflow
  minCategorySize: number
  axis?: "x" | "y"
}): CategoryLayout {
  const aspect = resolveResponsive(aspectRatio, containerWidth, 2) || 2
  // Before the first measurement, assume a desktop-ish width rather than
  // rendering a zero-height chart for one frame.
  const width = containerWidth || 640
  const height = Math.max(minHeight, Math.round(width / aspect))
  const wanted = count * minCategorySize

  if (
    overflow === "scroll" &&
    axis === "x" &&
    containerWidth &&
    wanted > width
  ) {
    return {
      plotWidth: wanted,
      plotHeight: height,
      scrolls: true,
      axis,
      viewportHeight: height,
    }
  }
  if (overflow === "scroll" && axis === "y" && wanted > height) {
    return {
      plotWidth: width,
      plotHeight: wanted,
      scrolls: true,
      axis,
      viewportHeight: height,
    }
  }
  return {
    plotWidth: width,
    plotHeight: height,
    scrolls: false,
    axis,
    viewportHeight: height,
  }
}

/** Wraps a plot in a scroll container only when it actually overflows. */
export function ChartPlotArea({
  layout,
  className,
  children,
}: {
  layout: CategoryLayout
  className?: string
  children: React.ReactNode
}) {
  if (!layout.scrolls) return <>{children}</>
  return (
    <ChartScrollArea
      axis={layout.axis}
      minSize={layout.axis === "x" ? layout.plotWidth : layout.plotHeight}
      maxHeight={layout.axis === "y" ? layout.viewportHeight : undefined}
      className={className}
    >
      {children}
    </ChartScrollArea>
  )
}

/** Props every category chart shares for fitting itself to its container. */
export interface CategoryChartLayoutProps {
  /**
   * Width ÷ height. A plain number, or one per container-width breakpoint
   * (`{ base: 1.2, md: 2 }`) — measured on the chart's own box, so a chart
   * in a narrow card gets the narrow treatment on a desktop too.
   */
  aspectRatio?: Responsive<number>
  /** Floor on the plot height, px. Stops a phone-width chart collapsing. */
  minHeight?: number
  /**
   * What to do when the categories outnumber the pixels. `compress` (the
   * default) squeezes them in; `scroll` gives each one `minCategorySize`
   * and lets the plot overflow — sideways for a category X-axis, downwards
   * for a category Y-axis.
   */
  overflow?: ChartOverflow
  /** Room each category needs before `scroll` starts overflowing, px. */
  minCategorySize?: number
  /** Drag / pinch / wheel zoom. Ignored while the plot is scrolling. */
  zoomable?: boolean
  /** Let a bare wheel zoom, rather than only ⌘/ctrl + wheel. */
  wheelZoom?: boolean
  /** Draw the +/−/reset buttons. */
  showZoomControls?: boolean
}
