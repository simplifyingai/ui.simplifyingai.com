"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Index } from "@/registry/__index__"

type ChartSize = "small" | "medium" | "large"

interface PremiumChart {
  name: string
  title: string
  description: string
  href: string
  size: ChartSize
  /** Explicit grid placement class for bento layout */
  gridClass?: string
}

// Premium charts with explicit bento grid placement
// Layout on 4-col grid (xl):
//   Row 1-2: [Sankey 2x2]       [Sunburst 1x2] [Treemap 1x2]
//   Row 3:   [Radar 1x1]        [Gauge 1x1]    (Sunburst/Treemap continue)
//   Row 4-5: [Choropleth 2x2]   [Candlestick 1x2] [Violin 1x2]
//   Row 6:   (Choropleth cont)  [Funnel 1x1]    [Donut 1x1]
//   Row 7-8: [Heatmap 1x2]      [Scatter 1x2]  (empty or balanced)
const PREMIUM_CHARTS: PremiumChart[] = [
  {
    name: "sankey-chart-demo",
    title: "Sankey Chart",
    description: "Flow visualization",
    href: "/docs/components/sankey-chart",
    size: "large",
    gridClass: "xl:col-span-2 xl:row-span-2 lg:col-span-2 lg:row-span-2",
  },
  {
    name: "sunburst-chart-demo",
    title: "Sunburst Chart",
    description: "Hierarchical data",
    href: "/docs/components/sunburst-chart",
    size: "medium",
    gridClass: "xl:row-span-2 lg:row-span-2",
  },
  {
    name: "treemap-chart-demo",
    title: "Treemap Chart",
    description: "Nested rectangles",
    href: "/docs/components/treemap-chart",
    size: "medium",
    gridClass: "xl:row-span-2 lg:row-span-2",
  },
  {
    name: "radar-chart-demo",
    title: "Radar Chart",
    description: "Multi-variable",
    href: "/docs/components/radar-chart",
    size: "small",
  },
  {
    name: "gauge-chart-demo",
    title: "Gauge Chart",
    description: "KPI indicators",
    href: "/docs/components/gauge-chart",
    size: "small",
  },
  {
    name: "choropleth-chart-demo",
    title: "Choropleth Map",
    description: "Geographic data",
    href: "/docs/components/choropleth-chart",
    size: "large",
    gridClass: "xl:col-span-2 xl:row-span-2 lg:col-span-2 lg:row-span-2",
  },
  {
    name: "candlestick-chart-demo",
    title: "Candlestick Chart",
    description: "Financial OHLC",
    href: "/docs/components/candlestick-chart",
    size: "medium",
    gridClass: "xl:row-span-2 lg:row-span-2",
  },
  {
    name: "violin-chart-demo",
    title: "Violin Chart",
    description: "Distribution density",
    href: "/docs/components/violin-chart",
    size: "medium",
    gridClass: "xl:row-span-2 lg:row-span-2",
  },
  {
    name: "funnel-chart-demo",
    title: "Funnel Chart",
    description: "Conversion flow",
    href: "/docs/components/funnel-chart",
    size: "small",
  },
  {
    name: "donut-chart-demo",
    title: "Donut Chart",
    description: "Part-to-whole",
    href: "/docs/components/donut-chart",
    size: "small",
  },
  {
    name: "heatmap-chart-demo",
    title: "Heatmap Chart",
    description: "2D intensity",
    href: "/docs/components/heatmap-chart",
    size: "medium",
    gridClass: "xl:row-span-2 lg:row-span-2",
  },
  {
    name: "scatter-chart-demo",
    title: "Scatter Chart",
    description: "Point distribution",
    href: "/docs/components/scatter-chart",
    size: "medium",
    gridClass: "xl:row-span-2 lg:row-span-2 xl:col-span-2 lg:col-span-1",
  },
]

function ChartCard({
  name,
  title,
  description,
  href,
  size,
  gridClass,
}: PremiumChart) {
  const Component = Index[name]?.component

  return (
    <Link
      href={href}
      className={cn(
        "group bg-card text-card-foreground hover:border-primary/50 relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-lg",
        gridClass
      )}
    >
      <div
        className={cn(
          "flex flex-1 items-center justify-center overflow-hidden p-4",
          size === "large" && "min-h-[300px]",
          size === "medium" && "min-h-[260px]",
          size === "small" && "min-h-[200px]"
        )}
      >
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
    <div className="grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {PREMIUM_CHARTS.map((chart) => (
        <ChartCard key={chart.name} {...chart} />
      ))}
    </div>
  )
}
