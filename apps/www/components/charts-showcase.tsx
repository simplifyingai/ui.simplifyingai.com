"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Index } from "@/registry/__index__"

interface BentoChart {
  name: string
  title: string
  description: string
  href: string
  /** Explicit grid area for bento layout: "row-start / col-start / row-end / col-end" */
  area: string
  /** Same for lg (3-col) breakpoint - applied via className */
  areaLg: string
}

// Bento grid with explicit placement — zero gaps guaranteed.
//
// XL (4 columns, rows ~180px each):
//  ┌──────────────┬─────────┬─────────┐
//  │  Sankey 2×2   │Sunburst │Treemap  │
//  │               │  1×2    │  1×2    │
//  ├───────┬───────┤         │         │
//  │ Radar │ Gauge │         │         │
//  ├───────┴───────┼─────────┴─────────┤
//  │ Choropleth 2×2│Candlestk│ Violin  │
//  │               │  1×2    │  1×2    │
//  ├───────┬───────┤         │         │
//  │Funnel │ Donut │         │         │
//  ├───────┴───────┼─────────┼─────────┤
//  │ Heatmap  1×2  │ Scatter    2×2    │
//  │               │                   │
//  └───────────────┴───────────────────┘
const BENTO_CHARTS: BentoChart[] = [
  {
    name: "sankey-chart-demo",
    title: "Sankey Chart",
    description: "Flow visualization",
    href: "/docs/components/sankey-chart",
    area: "1 / 1 / 3 / 3",
    areaLg: "1 / 1 / 3 / 3",
  },
  {
    name: "sunburst-chart-demo",
    title: "Sunburst Chart",
    description: "Hierarchical data",
    href: "/docs/components/sunburst-chart",
    area: "1 / 3 / 3 / 4",
    areaLg: "1 / 3 / 3 / 4",
  },
  {
    name: "treemap-chart-demo",
    title: "Treemap Chart",
    description: "Nested rectangles",
    href: "/docs/components/treemap-chart",
    area: "1 / 4 / 3 / 5",
    areaLg: "3 / 1 / 5 / 2",
  },
  {
    name: "radar-chart-demo",
    title: "Radar Chart",
    description: "Multi-variable",
    href: "/docs/components/radar-chart",
    area: "3 / 1 / 4 / 2",
    areaLg: "3 / 2 / 4 / 3",
  },
  {
    name: "gauge-chart-demo",
    title: "Gauge Chart",
    description: "KPI indicators",
    href: "/docs/components/gauge-chart",
    area: "3 / 2 / 4 / 3",
    areaLg: "3 / 3 / 4 / 4",
  },
  {
    name: "choropleth-chart-demo",
    title: "Choropleth Map",
    description: "Geographic data",
    href: "/docs/components/choropleth-chart",
    area: "4 / 1 / 6 / 3",
    areaLg: "4 / 2 / 6 / 4",
  },
  {
    name: "candlestick-chart-demo",
    title: "Candlestick Chart",
    description: "Financial OHLC",
    href: "/docs/components/candlestick-chart",
    area: "4 / 3 / 6 / 4",
    areaLg: "5 / 1 / 7 / 2",
  },
  {
    name: "violin-chart-demo",
    title: "Violin Chart",
    description: "Distribution density",
    href: "/docs/components/violin-chart",
    area: "4 / 4 / 6 / 5",
    areaLg: "6 / 2 / 8 / 3",
  },
  {
    name: "funnel-chart-demo",
    title: "Funnel Chart",
    description: "Conversion flow",
    href: "/docs/components/funnel-chart",
    area: "6 / 1 / 7 / 2",
    areaLg: "7 / 1 / 8 / 2",
  },
  {
    name: "donut-chart-demo",
    title: "Donut Chart",
    description: "Part-to-whole",
    href: "/docs/components/donut-chart",
    area: "6 / 2 / 7 / 3",
    areaLg: "6 / 3 / 7 / 4",
  },
  {
    name: "heatmap-chart-demo",
    title: "Heatmap Chart",
    description: "2D intensity",
    href: "/docs/components/heatmap-chart",
    area: "7 / 1 / 9 / 3",
    areaLg: "7 / 3 / 9 / 4",
  },
  {
    name: "scatter-chart-demo",
    title: "Scatter Chart",
    description: "Point distribution",
    href: "/docs/components/scatter-chart",
    area: "7 / 3 / 9 / 5",
    areaLg: "8 / 1 / 10 / 3",
  },
]

function ChartCard({ name, title, description, href, area, areaLg }: BentoChart) {
  const Component = Index[name]?.component

  return (
    <Link
      href={href}
      className="group bg-card text-card-foreground hover:border-primary/50 relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-lg"
      style={
        {
          "--bento-area-xl": area,
          "--bento-area-lg": areaLg,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        {Component ? (
          <React.Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
              </div>
            }
          >
            <div className="flex h-full w-full origin-center scale-[0.85] transform items-center justify-center">
              <Component />
            </div>
          </React.Suspense>
        ) : (
          <div className="text-muted-foreground text-sm">Loading...</div>
        )}
      </div>
      <div className="bg-muted/30 border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="group-hover:text-primary text-sm font-semibold transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
          <svg
            className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-all group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
}

export function ChartsShowcase() {
  return (
    <>
      <style>{`
        .bento-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
          grid-auto-rows: minmax(200px, auto);
        }
        @media (min-width: 640px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(3, 1fr);
            grid-auto-rows: minmax(180px, auto);
          }
          .bento-grid > a {
            grid-area: var(--bento-area-lg);
          }
        }
        @media (min-width: 1280px) {
          .bento-grid {
            grid-template-columns: repeat(4, 1fr);
            grid-auto-rows: minmax(170px, auto);
          }
          .bento-grid > a {
            grid-area: var(--bento-area-xl);
          }
        }
      `}</style>
      <div className="bento-grid">
        {BENTO_CHARTS.map((chart) => (
          <ChartCard key={chart.name} {...chart} />
        ))}
      </div>
    </>
  )
}
