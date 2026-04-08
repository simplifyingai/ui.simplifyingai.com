"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Index } from "@/registry/__index__"
import { Button } from "@/registry/simplifying-ai/ui/button"

interface ChartPreview {
  name: string
  title: string
  description: string
  href: string
  /** Card height — tall for square charts, short for wide charts */
  height: "tall" | "medium" | "short"
}

// Curated selection — visually diverse, 3 per row
// Heights tuned per chart: square charts (pie, radar, gauge) get tall cards,
// wide charts (line, bar, candlestick, area) get short cards
const FEATURED_CHARTS: ChartPreview[] = [
  {
    name: "line-chart-demo",
    title: "Line Chart",
    description: "Trends over time",
    href: "/docs/components/line-chart",
    height: "medium",
  },
  {
    name: "bar-chart-demo",
    title: "Bar Chart",
    description: "Compare categories",
    href: "/docs/components/bar-chart",
    height: "medium",
  },
  {
    name: "pie-chart-demo",
    title: "Pie Chart",
    description: "Part-to-whole",
    href: "/docs/components/pie-chart",
    height: "tall",
  },
  {
    name: "candlestick-chart-demo",
    title: "Candlestick",
    description: "Financial OHLC",
    href: "/docs/components/candlestick-chart",
    height: "medium",
  },
  {
    name: "radar-chart-demo",
    title: "Radar Chart",
    description: "Multi-variable",
    href: "/docs/components/radar-chart",
    height: "tall",
  },
  {
    name: "area-chart-demo",
    title: "Area Chart",
    description: "Volume & trends",
    href: "/docs/components/area-chart",
    height: "medium",
  },
  {
    name: "treemap-chart-demo",
    title: "Treemap",
    description: "Hierarchical data",
    href: "/docs/components/treemap-chart",
    height: "tall",
  },
  {
    name: "sankey-chart-demo",
    title: "Sankey",
    description: "Flow visualization",
    href: "/docs/components/sankey-chart",
    height: "tall",
  },
  {
    name: "gauge-chart-demo",
    title: "Gauge",
    description: "KPI indicators",
    href: "/docs/components/gauge-chart",
    height: "tall",
  },
]

const HEIGHT_MAP = {
  tall: "h-[280px]",
  medium: "h-[200px]",
  short: "h-[160px]",
}

function ChartCard({ name, title, description, href, height }: ChartPreview) {
  const Component = Index[name]?.component

  return (
    <Link
      href={href}
      className="group bg-card text-card-foreground relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md"
    >
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden",
          HEIGHT_MAP[height]
        )}
      >
        {Component ? (
          <React.Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            }
          >
            <div className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden p-2">
              <Component />
            </div>
          </React.Suspense>
        ) : (
          <div className="text-muted-foreground text-sm">Loading...</div>
        )}
      </div>
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="group-hover:text-primary text-sm font-medium transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
          <svg
            className="text-muted-foreground/50 group-hover:text-primary h-3.5 w-3.5 transition-all group-hover:translate-x-0.5"
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
    <div className="flex flex-col gap-8">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_CHARTS.map((chart) => (
          <ChartCard key={chart.name} {...chart} />
        ))}
      </div>
      <div className="flex justify-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/docs/components">
            Explore All Charts
            <svg
              className="ml-1.5 h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </Button>
      </div>
    </div>
  )
}
