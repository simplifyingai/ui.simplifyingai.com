"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import type { ChartConfig } from "./chart-config"
import { useChart } from "./chart-container"

/**
 * The one tooltip surface every chart draws on.
 *
 * Matches the app's Radix tooltip (`components/ui/tooltip.tsx`) so a hover
 * over a chart looks like a hover over anything else: popover ground, 1px
 * border, `rounded-lg`, `px-3 py-1.5`, `text-xs`. Charts used to inline
 * five near-identical variants of this, which is why no two of them agreed.
 *
 * Responsive/clean guards, all load-bearing:
 *   - `w-fit` + `max-w-xs` — a long category name wraps instead of running
 *     off a phone screen. Only STOCK utility classes here: these bundles
 *     are loaded remotely, so the consuming app's Tailwind never scans
 *     them and an arbitrary value like `max-w-[min(16rem,80vw)]` would
 *     silently compile to nothing.
 *   - `break-words` — browsers won't break underscore-joined tokens
 *     (`total_market_cap_inr`) without it, so `max-w` alone doesn't hold.
 *   - `pointer-events-none` — the tooltip can never swallow the hover that
 *     produced it, which is what makes a cursor-following tooltip flicker.
 */
export const CHART_TOOLTIP_SURFACE =
  "bg-popover text-popover-foreground border-border pointer-events-none " +
  "w-fit max-w-xs break-words rounded-lg border px-3 py-1.5 " +
  "text-xs shadow-md"

/** Square edge of the tail, px. Matches the app's Radix arrow (`size-2.5`). */
const TAIL = 10
/**
 * How far the tail's centre sits INSIDE the panel edge. The square's
 * half-diagonal is ~7.07px, so the visible point is `7.07 - TAIL_INSET`.
 * Push it out further and the shoulders leave the panel, which reads as a
 * floating chip instead of a tail.
 */
// NB: `left`/`top` on the tail resolve against the panel's PADDING box, so
// this is measured from inside the 1px border — the point that actually
// shows is ~7.07 - TAIL_INSET - 1. At 2 that is ~4px, matching the app's
// Radix arrow. Much less and the point vanishes into the panel's shadow.
const TAIL_INSET = 2

/**
 * Last pointer position, viewport coords. One passive listener for every
 * chart on the page — the tooltip is `pointer-events-none`, so moves over
 * it still reach the window.
 */
const pointer = { x: 0, y: 0, seen: false }
let pointerBound = false
function bindPointer() {
  if (pointerBound || typeof window === "undefined") return
  pointerBound = true
  window.addEventListener(
    "pointermove",
    (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.seen = true
    },
    { passive: true, capture: true }
  )
}

type TailSide = "left" | "right" | "top" | "bottom"

/**
 * Where the tail sits, and which two of the square's edges end up exposed.
 *
 * `rotate(45deg)` turns the square's corners into the compass points: the
 * original bottom-left corner becomes the LEFT tip, top-left becomes TOP,
 * bottom-right becomes BOTTOM, top-right becomes RIGHT. The two edges
 * meeting at the tip are the ones that must carry the border — get this
 * pairing wrong and the tail's border crosses the panel's instead of
 * continuing it.
 */
/**
 * Inline CSS for the tail on a given side.
 *
 * Every value is a STRING WITH UNITS on purpose. React's `style` prop adds
 * `px` to bare numbers; `Object.assign(el.style, …)` — which is how this
 * gets applied, from a layout effect — does not, it silently drops them.
 * A numeric `width`/`left` here leaves a zero-size span pinned to the
 * panel's top-left corner, which is a nick, not a tail.
 */
function tailStyle(side: TailSide): Record<string, string> {
  const edge = "1px solid var(--border)"
  const base: Record<string, string> = {
    position: "absolute",
    width: `${TAIL}px`,
    height: `${TAIL}px`,
    background: "var(--popover)",
    boxSizing: "border-box",
    transform: "translate(-50%, -50%) rotate(45deg)",
  }
  // rotate(45deg) turns the square's corners into the compass points: the
  // original bottom-left corner becomes the LEFT tip, top-left becomes TOP,
  // bottom-right BOTTOM, top-right RIGHT. Only the two edges meeting at the
  // tip carry the border, so it continues the panel's border rather than
  // crossing it.
  if (side === "left")
    return {
      ...base,
      left: `${TAIL_INSET}px`,
      top: "50%",
      borderLeft: edge,
      borderBottom: edge,
      borderBottomLeftRadius: "2px",
    }
  if (side === "right")
    return {
      ...base,
      left: `calc(100% - ${TAIL_INSET}px)`,
      top: "50%",
      borderTop: edge,
      borderRight: edge,
      borderTopRightRadius: "2px",
    }
  if (side === "top")
    return {
      ...base,
      top: `${TAIL_INSET}px`,
      left: "50%",
      borderTop: edge,
      borderLeft: edge,
      borderTopLeftRadius: "2px",
    }
  return {
    ...base,
    top: `calc(100% - ${TAIL_INSET}px)`,
    left: "50%",
    borderBottom: edge,
    borderRight: edge,
    borderBottomRightRadius: "2px",
  }
}

/**
 * Which edge the tail grows from, or `null` when the cursor is under the
 * panel and no edge faces it.
 *
 * Horizontal wins whenever the cursor is outside the panel's x-span.
 * Recharts offsets the tooltip DIAGONALLY from the cursor, so on a normal
 * hover the cursor is off a corner with near-equal overshoot on both axes
 * — picking the larger one there makes the tail flip between two sides as
 * the cursor creeps along a bar. Reading order puts the tooltip beside the
 * cursor anyway, so the horizontal edges are the honest default.
 *
 * The tail is CENTRED on whichever edge it lands on, like the app's Radix
 * tooltip. Tracking the cursor along the edge sounds better and isn't:
 * with a diagonal offset it spends its whole life clamped against a
 * rounded corner, where the panel edge curves away, nothing covers the
 * tail's own border, and it reads as a chevron nicked out of the corner.
 */
export function tailSide(
  r: { left: number; top: number; width: number; height: number },
  p: { x: number; y: number }
): TailSide | null {
  if (!r.width) return null
  if (p.x < r.left) return "left"
  if (p.x > r.left + r.width) return "right"
  if (p.y < r.top) return "top"
  if (p.y > r.top + r.height) return "bottom"
  return null
}

const useIsoLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

/**
 * The chart tooltip, tail and all.
 *
 * Radix gives the app's tooltips their arrow via `TooltipPrimitive.Arrow`
 * (`components/ui/tooltip.tsx`). Recharts hands `content` a bare div and
 * positions it itself — including flipping it left and/or up near the plot
 * edges, without telling `content` that it flipped — so a tail pinned to
 * one side points at nothing half the time.
 *
 * So the tail follows the POINTER instead of guessing recharts' placement:
 * whichever edge of the panel the cursor is past, that's the edge it
 * grows from, positioned along that edge at the cursor. That needs no
 * knowledge of recharts at all, which is why it also works for the D3
 * charts here that have no recharts coordinates to read.
 *
 * Written imperatively in a layout effect rather than through state: this
 * re-renders on every mousemove while hovering, and a setState per move
 * would double every one of those renders.
 */
export function ChartTooltipSurface({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const tailRef = React.useRef<HTMLSpanElement>(null)

  bindPointer()

  useIsoLayoutEffect(() => {
    // Measured on the NEXT frame, not in this commit. Recharts positions
    // its tooltip wrapper in a second render — it measures its own box,
    // stores it in state, then translates — so a rect read during this
    // commit is one render stale: it describes where the tooltip WAS,
    // which put the cursor inside the old box (tail hidden) or past the
    // wrong edge (tail pointing at nothing).
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current
      const tail = tailRef.current
      if (!panel || !tail) return
      const side = pointer.seen
        ? tailSide(panel.getBoundingClientRect(), pointer)
        : null
      if (!side) {
        // Cursor under the panel: no edge faces it. Keep whatever the last
        // good frame drew rather than blinking the tail off — recharts
        // offsets the tooltip clear of the cursor, so this is a transient
        // of the tooltip settling into place, not a resting state.
        return
      }
      // Wipe the previous side's borders/offsets before applying the new
      // ones, or a left tail keeps the bottom tail's border edges.
      tail.style.cssText = ""
      Object.assign(tail.style, tailStyle(side))
      tail.style.opacity = "1"
    })
    return () => cancelAnimationFrame(frame)
  })

  return (
    <div ref={panelRef} className={cn(CHART_TOOLTIP_SURFACE, "relative")}>
      <span aria-hidden ref={tailRef} style={{ opacity: 0 }} />
      <div className={cn("relative", className)}>{children}</div>
    </div>
  )
}

export interface TooltipData {
  label: string
  value: number | string
  color?: string
  category?: string
  [key: string]: unknown
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipData | TooltipData[]
  position?: { x: number; y: number }
  className?: string
  formatter?: (value: number | string, name: string) => React.ReactNode
  labelFormatter?: (label: string) => React.ReactNode
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "dot" | "line" | "dashed"
}

export function ChartTooltip({
  active = true,
  payload,
  position,
  className,
  formatter,
  labelFormatter,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
}: ChartTooltipProps) {
  const { config } = useChart()

  if (!active || !payload) return null

  const items = Array.isArray(payload) ? payload : [payload]

  return (
    <div
      className={cn(
        "absolute z-50",
        CHART_TOOLTIP_SURFACE,
        "min-w-[8rem]",
        className
      )}
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      {/* Label */}
      {!hideLabel && items[0]?.label && (
        <div className="mb-1 font-medium">
          {labelFormatter ? labelFormatter(items[0].label) : items[0].label}
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-1">
        {items.map((item, index) => {
          const itemConfig = config[item.category ?? item.label] ?? {}
          const color =
            item.color ?? itemConfig.color ?? `var(--chart-${index + 1})`

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-1.5">
                {/* Indicator */}
                {!hideIndicator && (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px]",
                      indicator === "dot" && "h-2.5 w-2.5",
                      indicator === "line" && "h-2.5 w-1",
                      indicator === "dashed" &&
                        "h-2.5 w-0 border-l-[1.5px] border-dashed"
                    )}
                    style={{
                      backgroundColor:
                        indicator !== "dashed" ? color : undefined,
                      borderColor: color,
                    }}
                  />
                )}

                {/* Name */}
                <span className="text-muted-foreground">
                  {itemConfig.label ?? item.category ?? item.label}
                </span>
              </div>

              {/* Value */}
              <span className="text-foreground font-mono font-medium tabular-nums">
                {formatter
                  ? formatter(item.value, item.label)
                  : typeof item.value === "number"
                    ? item.value.toLocaleString()
                    : item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Tooltip wrapper that tracks mouse position
export interface ChartTooltipWrapperProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
}

export function ChartTooltipWrapper({
  children,
  content,
  className,
}: ChartTooltipWrapperProps) {
  const [position, setPosition] = React.useState<{
    x: number
    y: number
  } | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 10,
    })
  }

  const handleMouseLeave = () => {
    setPosition(null)
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {position && (
        <div
          className="pointer-events-none absolute z-50"
          style={{ left: position.x, top: position.y }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

// Simple tooltip content component
export interface ChartTooltipContentProps {
  label?: string
  value?: number | string
  color?: string
  className?: string
}

export function ChartTooltipContent({
  label,
  value,
  color,
  className,
}: ChartTooltipContentProps) {
  return (
    <div
      className={cn(
        CHART_TOOLTIP_SURFACE,
        className
      )}
    >
      <div className="flex items-center gap-2">
        {color && (
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="text-muted-foreground">{label}</span>
        {value !== undefined && (
          <span className="text-foreground font-mono font-medium tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        )}
      </div>
    </div>
  )
}
