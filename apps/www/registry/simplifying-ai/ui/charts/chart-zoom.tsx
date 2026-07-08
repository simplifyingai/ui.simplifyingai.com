"use client"

import * as React from "react"
import type { ScaleBand } from "d3-scale"

import { cn } from "@/lib/utils"

export interface ChartDragRange {
  x0: number
  x1: number
}

export interface UseChartZoomOptions {
  /** Ref to the chart's root <svg> — needed to convert client coords to
   * local plot-area coords via getScreenCTM, since the SVG may be scaled
   * by CSS relative to its viewBox. */
  svgRef: React.RefObject<SVGSVGElement | null>
  /** Left margin of the plot area (chart's `margin.left`). */
  marginLeft: number
  /** Width of the plot area (chart's `innerWidth`). */
  innerWidth: number
  disabled?: boolean
  /** Minimum drag distance (px) before a drag counts as a zoom selection
   * instead of a click. */
  minDragPx?: number
  onZoom: (range: ChartDragRange) => void
  onReset: () => void
}

export interface UseChartZoomResult {
  /** Current in-progress drag selection, in plot-area-local pixels. */
  dragRange: ChartDragRange | null
  isDragging: boolean
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void
    onMouseMove: (e: React.MouseEvent) => void
    onMouseUp: (e: React.MouseEvent) => void
    onMouseLeave: (e: React.MouseEvent) => void
    onDoubleClick: (e: React.MouseEvent) => void
  }
}

function getLocalX(
  svg: SVGSVGElement | null,
  clientX: number,
  clientY: number,
  marginLeft: number
): number | null {
  if (!svg) return null
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const local = pt.matrixTransform(ctm.inverse())
  return local.x - marginLeft
}

/**
 * Drag-to-zoom for D3/SVG charts — mirrors Plotly.js's click-drag box
 * zoom: drag horizontally across the plot area to zoom the x-domain into
 * the selected range, double-click to reset. Consumers are responsible
 * for turning the emitted pixel range into a data-domain range (via
 * `scale.invert()` for continuous scales, or `getBandScaleIndexRange`
 * below for band scales) and re-filtering their data.
 */
export function useChartZoom({
  svgRef,
  marginLeft,
  innerWidth,
  disabled = false,
  minDragPx = 6,
  onZoom,
  onReset,
}: UseChartZoomOptions): UseChartZoomResult {
  const [dragStart, setDragStart] = React.useState<number | null>(null)
  const [dragRange, setDragRange] = React.useState<ChartDragRange | null>(
    null
  )

  const clamp = React.useCallback(
    (x: number) => Math.min(Math.max(x, 0), innerWidth),
    [innerWidth]
  )

  const onMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (disabled || e.button !== 0) return
      const x = getLocalX(svgRef.current, e.clientX, e.clientY, marginLeft)
      if (x === null) return
      const clamped = clamp(x)
      setDragStart(clamped)
      setDragRange({ x0: clamped, x1: clamped })
    },
    [disabled, svgRef, marginLeft, clamp]
  )

  const onMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (dragStart === null) return
      const x = getLocalX(svgRef.current, e.clientX, e.clientY, marginLeft)
      if (x === null) return
      setDragRange({ x0: dragStart, x1: clamp(x) })
    },
    [dragStart, svgRef, marginLeft, clamp]
  )

  const endDrag = React.useCallback(() => {
    setDragStart((start) => {
      if (start !== null) {
        setDragRange((range) => {
          if (range) {
            const width = Math.abs(range.x1 - range.x0)
            if (width >= minDragPx) {
              onZoom({
                x0: Math.min(range.x0, range.x1),
                x1: Math.max(range.x0, range.x1),
              })
            }
          }
          return null
        })
      }
      return null
    })
  }, [minDragPx, onZoom])

  const onMouseUp = React.useCallback(() => endDrag(), [endDrag])
  const onMouseLeave = React.useCallback(() => endDrag(), [endDrag])

  const onDoubleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      e.preventDefault()
      onReset()
    },
    [disabled, onReset]
  )

  return {
    dragRange: dragStart !== null ? dragRange : null,
    isDragging: dragStart !== null,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onDoubleClick,
    },
  }
}

/**
 * Translates a pixel drag range into a [startIndex, endIndex] window over
 * a band scale's domain — used to zoom categorical/band-scale x-axes
 * (e.g. candlestick dates, bar categories) by index rather than value.
 */
export function getBandScaleIndexRange(
  scale: ScaleBand<string>,
  x0: number,
  x1: number
): [number, number] {
  const domain = scale.domain()
  const step = scale.step() || 1
  let start = Math.floor(x0 / step)
  let end = Math.ceil(x1 / step) - 1
  start = Math.max(0, Math.min(start, domain.length - 1))
  end = Math.max(0, Math.min(end, domain.length - 1))
  if (end < start) end = start
  return [start, end]
}

/** The translucent selection rectangle drawn while dragging. Render as a
 * direct child of the chart's inner `<g transform="translate(margin...)">`. */
export function ChartZoomSelectionRect({
  range,
  height,
  className,
}: {
  range: ChartDragRange | null
  height: number
  className?: string
}) {
  if (!range) return null
  const x = Math.min(range.x0, range.x1)
  const width = Math.abs(range.x1 - range.x0)
  return (
    <rect
      x={x}
      y={0}
      width={width}
      height={height}
      className={cn("fill-primary/10 stroke-primary/50", className)}
      strokeWidth={1}
      style={{ pointerEvents: "none" }}
    />
  )
}

/** Small floating "Reset zoom" pill — only render when the chart is
 * currently zoomed. Position the containing element `relative`. */
export function ChartZoomResetButton({
  visible,
  onReset,
  className,
}: {
  visible: boolean
  onReset: () => void
  className?: string
}) {
  if (!visible) return null
  return (
    <button
      type="button"
      onClick={onReset}
      className={cn(
        "border-border/50 bg-background/95 text-muted-foreground hover:text-foreground absolute top-2 right-2 z-20 rounded-md border px-2 py-1 text-xs font-medium shadow-sm transition-colors",
        className
      )}
    >
      Reset zoom
    </button>
  )
}
