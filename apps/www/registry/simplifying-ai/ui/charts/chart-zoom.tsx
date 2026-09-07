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
  const [dragRange, setDragRange] = React.useState<ChartDragRange | null>(null)

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

// ============================================
// Category window — pointer, wheel and pinch
// ============================================

export interface UseChartWindowOptions {
  /** Categories in the full dataset. */
  length: number
  /** Fewest categories a zoom may leave visible. */
  minSpan?: number
  disabled?: boolean
  /** Screen axis the categories run along. */
  orientation?: "x" | "y"
  /**
   * Plot-area insets inside the bound element, px. Without them a pointer
   * over the third bar maps to the second, because the axis gutter and
   * margins are part of the element but not part of the plot.
   */
  insetStart?: number
  insetEnd?: number
  /**
   * Let a bare wheel zoom. Off by default: a chart that swallows scroll is
   * a trap halfway down a page, so ⌘/ctrl+wheel is the opt-in.
   */
  wheelZoom?: boolean
}

export interface ChartWindowSelection {
  /** Fractions of the plot area, 0–1, in gesture order. */
  from: number
  to: number
}

export interface UseChartWindowResult {
  start: number
  end: number
  span: number
  isZoomed: boolean
  /** The visible slice of the caller's data. */
  slice: <T>(data: T[]) => T[]
  /** In-progress drag selection, for the overlay. */
  selection: ChartWindowSelection | null
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  setWindow: (start: number, end: number) => void
  /** Spread onto the element wrapping the plot. */
  bind: {
    ref: React.RefObject<HTMLDivElement | null>
    style: React.CSSProperties
  }
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi)

/**
 * One window over a categorical dataset, driven by every input a chart
 * gets: mouse drag to box-select, wheel (with ⌘/ctrl) to zoom at the
 * cursor, two-finger pinch, one-finger pan once zoomed, double-tap to
 * reset — plus imperative `zoomIn`/`zoomOut` for the on-screen buttons.
 *
 * Listeners are attached natively rather than through React props for two
 * reasons: Recharts overwrites a chart's `onTouch*` props with its own
 * tooltip handlers, so touch gestures can never reach it that way; and
 * React's wheel listener is passive, so `preventDefault` on it does
 * nothing and the page scrolls away underneath the zoom.
 */
export function useChartWindow({
  length,
  minSpan = 2,
  disabled = false,
  orientation = "x",
  insetStart = 0,
  insetEnd = 0,
  wheelZoom = false,
}: UseChartWindowOptions): UseChartWindowResult {
  const ref = React.useRef<HTMLDivElement>(null)
  const last = Math.max(0, length - 1)

  // The window lives in a ref so a gesture can read the value it just
  // wrote; state is only the render trigger.
  const win = React.useRef<[number, number]>([0, last])
  const [, bump] = React.useReducer((n: number) => n + 1, 0)
  const [selection, setSelection] = React.useState<ChartWindowSelection | null>(
    null
  )

  const setWin = React.useCallback((next: [number, number]) => {
    if (next[0] === win.current[0] && next[1] === win.current[1]) return
    win.current = next
    bump()
  }, [])

  // A new dataset invalidates any window over the old one.
  React.useEffect(() => {
    win.current = [0, Math.max(0, length - 1)]
    setSelection(null)
    bump()
  }, [length])

  const zoomAround = React.useCallback(
    (factor: number, focal: number, from?: [number, number]) => {
      const [s, e] = from ?? win.current
      const span = e - s + 1
      const next = clamp(
        Math.round(span * factor),
        Math.min(minSpan, length),
        length
      )
      if (next === span) return
      const anchor = s + focal * (span - 1)
      const start = clamp(
        Math.round(anchor - focal * (next - 1)),
        0,
        length - next
      )
      setWin([start, start + next - 1])
    },
    [length, minSpan, setWin]
  )

  const reset = React.useCallback(() => {
    setWin([0, Math.max(0, length - 1)])
  }, [length, setWin])

  const zoomIn = React.useCallback(() => zoomAround(0.6, 0.5), [zoomAround])
  const zoomOut = React.useCallback(
    () => zoomAround(1 / 0.6, 0.5),
    [zoomAround]
  )

  const setWindow = React.useCallback(
    (start: number, end: number) => {
      const lo = clamp(Math.min(start, end), 0, Math.max(0, length - 1))
      const hi = clamp(Math.max(start, end), lo, Math.max(0, length - 1))
      setWin([lo, hi])
    },
    [length, setWin]
  )

  React.useEffect(() => {
    const el = ref.current
    if (!el || disabled || length === 0) return

    const pointers = new Map<number, { x: number; y: number }>()
    let drag: {
      mode: "select" | "pan"
      at: number
      from: [number, number]
    } | null = null
    let pinch: {
      distance: number
      focal: number
      from: [number, number]
    } | null = null

    const fractionOf = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect()
      const total =
        (orientation === "x" ? rect.width : rect.height) - insetStart - insetEnd
      if (total <= 0) return 0
      const pos =
        (orientation === "x" ? clientX - rect.left : clientY - rect.top) -
        insetStart
      return clamp(pos / total, 0, 1)
    }

    const spread = () => {
      const [a, b] = [...pointers.values()]
      return Math.hypot(a.x - b.x, a.y - b.y) || 1
    }

    const onPointerDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.size === 2) {
        drag = null
        setSelection(null)
        const [a, b] = [...pointers.values()]
        pinch = {
          distance: spread(),
          focal: fractionOf((a.x + b.x) / 2, (a.y + b.y) / 2),
          from: win.current,
        }
        return
      }
      if (pointers.size !== 1) return

      const at = fractionOf(e.clientX, e.clientY)
      if (e.pointerType === "mouse") {
        if (e.button !== 0) return
        drag = { mode: "select", at, from: win.current }
        setSelection({ from: at, to: at })
      } else if (win.current[1] - win.current[0] + 1 < length) {
        // One finger pans, but only while zoomed — otherwise it belongs to
        // the page, which is still trying to scroll.
        drag = { mode: "pan", at, from: win.current }
      }
      if (drag) el.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pinch && pointers.size >= 2) {
        e.preventDefault()
        zoomAround(pinch.distance / spread(), pinch.focal, pinch.from)
        return
      }
      if (!drag) return

      const at = fractionOf(e.clientX, e.clientY)
      if (drag.mode === "select") {
        setSelection({ from: drag.at, to: at })
        return
      }
      e.preventDefault()
      const [s0, e0] = drag.from
      const span = e0 - s0 + 1
      const shift = Math.round((drag.at - at) * span)
      const start = clamp(s0 + shift, 0, length - span)
      setWin([start, start + span - 1])
    }

    const endPointer = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinch = null

      if (drag?.mode === "select") {
        // Read the window off the drag *now*: the updater below runs on a
        // later render, by which point `drag` has already been cleared.
        const [from, to] = drag.from
        setSelection((current) => {
          if (current && Math.abs(current.to - current.from) > 0.02) {
            const span = to - from + 1
            const a = Math.round(
              from + Math.min(current.from, current.to) * (span - 1)
            )
            const b = Math.round(
              from + Math.max(current.from, current.to) * (span - 1)
            )
            if (b - a + 1 >= minSpan) setWin([a, b])
          }
          return null
        })
      }
      if (pointers.size === 0) drag = null
    }

    const onWheel = (e: WheelEvent) => {
      if (!wheelZoom && !e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      zoomAround(e.deltaY > 0 ? 1.25 : 0.8, fractionOf(e.clientX, e.clientY))
    }

    const onDoubleClick = () => reset()

    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove, { passive: false })
    el.addEventListener("pointerup", endPointer)
    el.addEventListener("pointercancel", endPointer)
    el.addEventListener("wheel", onWheel, { passive: false })
    el.addEventListener("dblclick", onDoubleClick)
    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", endPointer)
      el.removeEventListener("pointercancel", endPointer)
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("dblclick", onDoubleClick)
    }
  }, [
    disabled,
    length,
    minSpan,
    orientation,
    insetStart,
    insetEnd,
    wheelZoom,
    zoomAround,
    reset,
    setWin,
  ])

  const [start, end] = win.current
  const isZoomed = start > 0 || end < last

  return {
    start,
    end,
    span: end - start + 1,
    isZoomed,
    slice: React.useCallback(
      <T,>(data: T[]) => data.slice(start, end + 1),
      [start, end]
    ),
    selection,
    zoomIn,
    zoomOut,
    reset,
    setWindow,
    bind: {
      ref,
      style: {
        // While zoomed the chart owns the gesture; before that the page
        // keeps its scroll along the cross axis.
        touchAction: isZoomed
          ? "none"
          : orientation === "x"
            ? "pan-y"
            : "pan-x",
        WebkitUserSelect: selection ? "none" : undefined,
        userSelect: selection ? "none" : undefined,
      },
    },
  }
}

/** The band highlighted while dragging a zoom selection. Render inside the
 *  element bound by `useChartWindow`, which must be `relative`. */
export function ChartWindowSelectionOverlay({
  selection,
  orientation = "x",
  insetStart = 0,
  insetEnd = 0,
  className,
}: {
  selection: ChartWindowSelection | null
  orientation?: "x" | "y"
  insetStart?: number
  insetEnd?: number
  className?: string
}) {
  if (!selection) return null
  const lo = Math.min(selection.from, selection.to)
  const hi = Math.max(selection.from, selection.to)
  const track = `calc(100% - ${insetStart + insetEnd}px)`
  const offset = `calc(${insetStart}px + ${lo} * ${track})`
  const size = `calc(${hi - lo} * ${track})`

  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-foreground/[0.07] border-foreground/20 pointer-events-none absolute z-10 border-x",
        className
      )}
      style={
        orientation === "x"
          ? { left: offset, width: size, top: 0, bottom: 0 }
          : { top: offset, height: size, left: 0, right: 0 }
      }
    />
  )
}

/** Zoom in / out / reset. Touch-sized targets, always visible on coarse
 *  pointers where there is no hover to reveal them. */
export function ChartZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  isZoomed,
  className,
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  isZoomed: boolean
  className?: string
}) {
  const button =
    "flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"

  return (
    <div
      className={cn(
        "border-border/60 bg-background/90 absolute top-2 right-2 z-20 flex items-center rounded-lg border shadow-sm backdrop-blur",
        // Hidden until wanted: a permanent overlay sits on top of the
        // chart's own labels on a phone. Hover reveals it where there is a
        // hover; a pinch reveals it everywhere, which is also the only
        // moment a touch user needs the way back out.
        "opacity-0 transition-opacity group-hover/chart:opacity-100 focus-within:opacity-100",
        isZoomed && "opacity-100",
        className
      )}
    >
      <button
        type="button"
        onClick={onZoomOut}
        className={button}
        aria-label="Zoom out"
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
        >
          <path d="M4 8h8" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className={button}
        aria-label="Zoom in"
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
        >
          <path d="M8 4v8M4 8h8" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={!isZoomed}
        className={button}
        aria-label="Reset zoom"
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 8a5 5 0 1 1-1.6-3.7" />
          <path d="M13 3v2.5h-2.5" />
        </svg>
      </button>
    </div>
  )
}
