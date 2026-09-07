"use client"

import * as React from "react"

/**
 * One place to restyle every chart.
 *
 * The registry components read their *visual* defaults from here instead of
 * hard-coding them, so a host (the docs site, a customer app, chatplotdb)
 * can flip the whole surface to a different look with one provider rather
 * than threading twenty props through every chart payload. Explicit props
 * always win over the theme; the theme only supplies defaults.
 */

/** Shape of a reference-line label. */
export type ChartTagVariant = "plain" | "pill" | "flag"

/** How the emphasised category tick is marked out. */
export type ChartTickVariant = "plain" | "pill" | "underline"

/** Fill treatment for a mark. `none` is a flat fill. */
export type ChartPatternKind =
  | "none"
  | "hatch"
  | "hatch-dense"
  | "dots"
  | "grid"

export interface ChartTheme {
  /** Series colours, in order. */
  palette: string[]
  /** Fill for de-emphasised marks (the grey bars behind the active one). */
  mutedColor: string
  /** Texture painted over de-emphasised marks. */
  mutedPattern: ChartPatternKind
  /** Texture painted over emphasised marks. */
  activePattern: ChartPatternKind
  /** Corner radius for bars and segments, in px. */
  barRadius: number
  /** `round` caps a bar at half its width — the pill-top look. */
  barCap: "flat" | "round"
  maxBarSize: number
  /** Grid dash array; `""` draws solid lines. */
  gridDash: string
  gridOpacity: number
  tickFontSize: number
  /** How the emphasised category tick is marked out. */
  activeTickVariant: ChartTickVariant
  /** Colours for the `pill` and `underline` tick variants. */
  activeTickBackground: string
  activeTickForeground: string
  /** Shape of the reference-line label ("Avg 6.8%"). */
  tagVariant: ChartTagVariant
  /** Colours for the `flag` and `pill` tag variants. */
  tagBackground: string
  tagForeground: string
  animate: boolean
  animationDuration: number
}

/** Current library look. Changing these changes every chart's default. */
export const defaultChartTheme: ChartTheme = {
  palette: [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ],
  mutedColor: "var(--muted)",
  mutedPattern: "none",
  activePattern: "none",
  barRadius: 4,
  barCap: "flat",
  maxBarSize: 50,
  gridDash: "3 3",
  gridOpacity: 0.5,
  tickFontSize: 12,
  activeTickVariant: "plain",
  activeTickBackground: "color-mix(in oklab, var(--chart-3) 15%, transparent)",
  activeTickForeground: "var(--chart-3)",
  // `plain` by default, and deliberately: a filled chip floating over the
  // plot reads as a tooltip someone forgot to dismiss. Presets opt in.
  tagVariant: "plain",
  tagBackground: "var(--foreground)",
  tagForeground: "var(--background)",
  animate: true,
  animationDuration: 600,
}

/** The fintech-dashboard look: hatched grey bars, one vivid active mark,
 *  generous pill radii, dotted grid, pill axis tick. */
export const dashboardChartTheme: ChartTheme = {
  ...defaultChartTheme,
  mutedColor: "color-mix(in oklab, var(--muted-foreground) 14%, transparent)",
  mutedPattern: "hatch",
  activePattern: "hatch",
  barRadius: 10,
  barCap: "round",
  maxBarSize: 64,
  gridDash: "2 6",
  gridOpacity: 0.35,
  activeTickVariant: "pill",
  tagVariant: "flag",
}

/** Quietest possible: thin marks, faint grid, no annotation chrome. */
export const minimalChartTheme: ChartTheme = {
  ...defaultChartTheme,
  barRadius: 2,
  gridDash: "",
  gridOpacity: 0.25,
  tagVariant: "plain",
  activeTickVariant: "plain",
}

export const chartThemePresets = {
  default: defaultChartTheme,
  dashboard: dashboardChartTheme,
  minimal: minimalChartTheme,
} satisfies Record<string, ChartTheme>

export type ChartThemePreset = keyof typeof chartThemePresets

const ChartThemeContext = React.createContext<ChartTheme | null>(null)

export interface ChartThemeProviderProps {
  /** A named preset, or the theme to merge onto the inherited one. */
  preset?: ChartThemePreset
  theme?: Partial<ChartTheme>
  children: React.ReactNode
}

/** Providers nest: an inner one merges onto whatever is already in scope,
 *  so a single card can deviate without redefining the whole theme. */
export function ChartThemeProvider({
  preset,
  theme,
  children,
}: ChartThemeProviderProps) {
  const inherited = React.useContext(ChartThemeContext) ?? defaultChartTheme
  const base = preset ? chartThemePresets[preset] : inherited
  const value = React.useMemo(
    () => (theme ? { ...base, ...theme } : base),
    // `theme` is usually an object literal; hashing its entries keeps the
    // context value stable across renders so charts don't re-render for free.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, JSON.stringify(theme ?? null)]
  )

  return (
    <ChartThemeContext.Provider value={value}>
      {children}
    </ChartThemeContext.Provider>
  )
}

/**
 * Read the active theme, with per-call overrides layered on top.
 * `undefined` overrides are dropped, so `useChartTheme({ barRadius })` with
 * an unset prop still yields the themed value.
 */
export function useChartTheme(overrides?: Partial<ChartTheme>): ChartTheme {
  const theme = React.useContext(ChartThemeContext) ?? defaultChartTheme
  return React.useMemo(() => {
    if (!overrides) return theme
    const merged = { ...theme }
    for (const [key, value] of Object.entries(overrides)) {
      if (value !== undefined) {
        ;(merged as Record<string, unknown>)[key] = value
      }
    }
    return merged
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, JSON.stringify(overrides ?? null)])
}
