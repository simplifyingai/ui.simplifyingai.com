"use client"

import * as React from "react"

import type { ChartPatternKind } from "./chart-theme"

/**
 * SVG `<pattern>` fills — the diagonal hatch / dot textures that give
 * dashboard bars their material feel instead of a flat wash of colour.
 *
 * Recharts renders unrecognised children verbatim, so `<ChartPatternDefs>`
 * can sit directly inside a `<BarChart>` next to the axes and the marks
 * reference it through `patternFill()`.
 */

export interface ChartPatternSpec {
  id: string
  kind: ChartPatternKind
  /** Stroke/dot colour drawn on top of `background`. */
  color: string
  /** Fill behind the texture. Defaults to `color` at low opacity. */
  background?: string
  /** Tile size in px — smaller means denser. */
  size?: number
  strokeWidth?: number
  /** Rotation of the tile, degrees. 45 gives the classic hatch. */
  angle?: number
  /** Opacity of the texture strokes (not the background). */
  opacity?: number
}

const TILE: Record<Exclude<ChartPatternKind, "none">, number> = {
  hatch: 7,
  "hatch-dense": 4,
  dots: 6,
  grid: 8,
}

/** One `<pattern>`. Render inside a `<defs>`; use `ChartPatternDefs` for that. */
export function ChartPattern({
  id,
  kind,
  color,
  background,
  size,
  strokeWidth = 1.5,
  angle = 45,
  opacity = 1,
}: ChartPatternSpec) {
  if (kind === "none") return null

  const tile = size ?? TILE[kind]
  const bg = background ?? "transparent"

  return (
    <pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width={tile}
      height={tile}
      patternTransform={kind === "dots" ? undefined : `rotate(${angle})`}
    >
      <rect width={tile} height={tile} fill={bg} />
      {kind === "dots" ? (
        <circle
          cx={tile / 2}
          cy={tile / 2}
          r={strokeWidth}
          fill={color}
          opacity={opacity}
        />
      ) : (
        <>
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={tile}
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
          {kind === "grid" && (
            <line
              x1={0}
              y1={0}
              x2={tile}
              y2={0}
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          )}
        </>
      )}
    </pattern>
  )
}

/**
 * Every pattern a chart needs, as a `<defs>` element.
 *
 * A *function*, not a component, because Recharts walks its children by
 * type and silently drops the ones it doesn't recognise — a wrapper
 * component never reaches the SVG, and every `url(#…)` fill then resolves
 * to nothing (invisible marks). Calling it inlines a real `<defs>` into the
 * children array, which Recharts passes through:
 *
 * ```tsx
 * <BarChart>{chartPatternDefs([{ id, kind: "hatch", color, background }])}</BarChart>
 * ```
 *
 * Paint servers must live in the *same* SVG root as the marks that use
 * them, so this cannot be hoisted into a sprite elsewhere on the page.
 * Returns `null` when nothing needs a texture.
 */
export function chartPatternDefs(
  patterns: Array<ChartPatternSpec | null | undefined>
) {
  const active = patterns.filter(
    (p): p is ChartPatternSpec => !!p && p.kind !== "none"
  )
  if (!active.length) return null

  return (
    <defs key="chart-patterns">
      {active.map((p) => (
        <ChartPattern key={p.id} {...p} />
      ))}
    </defs>
  )
}

/** The `fill` value for a mark: the pattern when one applies, else the
 *  plain colour. Keeps call sites free of `url(#…)` string-building. */
export function patternFill(
  color: string,
  kind: ChartPatternKind | undefined,
  id: string | undefined
): string {
  if (!kind || kind === "none" || !id) return color
  return `url(#${id})`
}

/** Collision-free pattern ids for one chart instance. */
export function useChartPatternIds(...keys: string[]): Record<string, string> {
  const uid = React.useId().replace(/:/g, "")
  return React.useMemo(
    () => Object.fromEntries(keys.map((k) => [k, `sc-${k}-${uid}`])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid, keys.join("|")]
  )
}
