import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { ModeSwitcher } from "@/components/mode-switcher"

const footerLinks = {
  docs: {
    title: "Docs",
    links: [
      { label: "Introduction", href: "/docs" },
      { label: "Components", href: "/docs/components" },
      { label: "Setup", href: "/docs/setup" },
      { label: "Usage", href: "/docs/usage" },
      { label: "Troubleshooting", href: "/docs/troubleshooting" },
    ],
  },
  basicCharts: {
    title: "Basic Charts",
    links: [
      { label: "Line Chart", href: "/docs/components/line-chart" },
      { label: "Bar Chart", href: "/docs/components/bar-chart" },
      { label: "Area Chart", href: "/docs/components/area-chart" },
      { label: "Scatter Chart", href: "/docs/components/scatter-chart" },
      { label: "Pie Chart", href: "/docs/components/pie-chart" },
      { label: "Donut Chart", href: "/docs/components/donut-chart" },
      { label: "Dot Plot Chart", href: "/docs/components/dot-plot-chart" },
      { label: "Lollipop Chart", href: "/docs/components/lollipop-chart" },
      { label: "Dumbbell Chart", href: "/docs/components/dumbbell-chart" },
      { label: "Slope Chart", href: "/docs/components/slope-chart" },
      { label: "Range Chart", href: "/docs/components/range-chart" },
    ],
  },
  statisticalCharts: {
    title: "Statistical",
    links: [
      { label: "Histogram", href: "/docs/components/histogram-chart" },
      { label: "Box Plot", href: "/docs/components/box-plot-chart" },
      { label: "Violin Chart", href: "/docs/components/violin-chart" },
      { label: "Polar Chart", href: "/docs/components/polar-chart" },
      { label: "Parallel Coordinates", href: "/docs/components/parallel-coordinates" },
      { label: "SPLOM Chart", href: "/docs/components/splom-chart" },
      { label: "Parcats Chart", href: "/docs/components/parcats-chart" },
    ],
  },
  financialCharts: {
    title: "Financial",
    links: [
      { label: "Candlestick", href: "/docs/components/candlestick-chart" },
      { label: "OHLC Chart", href: "/docs/components/ohlc-chart" },
      { label: "Waterfall Chart", href: "/docs/components/waterfall-chart" },
      { label: "Funnel Chart", href: "/docs/components/funnel-chart" },
    ],
  },
  scientificCharts: {
    title: "Scientific",
    links: [
      { label: "Heatmap", href: "/docs/components/heatmap-chart" },
      { label: "Contour Chart", href: "/docs/components/contour-chart" },
      { label: "Density Chart", href: "/docs/components/density-chart" },
      { label: "Ternary Chart", href: "/docs/components/ternary-chart" },
    ],
  },
  specializedCharts: {
    title: "Specialized",
    links: [
      { label: "Radar Chart", href: "/docs/components/radar-chart" },
      { label: "Treemap", href: "/docs/components/treemap-chart" },
      { label: "Sunburst", href: "/docs/components/sunburst-chart" },
      { label: "Sankey Chart", href: "/docs/components/sankey-chart" },
      { label: "Gauge Chart", href: "/docs/components/gauge-chart" },
      { label: "Bullet Chart", href: "/docs/components/bullet-chart" },
      { label: "Icicle Chart", href: "/docs/components/icicle-chart" },
      { label: "Network Graph", href: "/docs/components/network-graph" },
      { label: "Dendrogram", href: "/docs/components/dendrogram" },
      { label: "Choropleth", href: "/docs/components/choropleth-chart" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "GitHub", href: siteConfig.links.github, external: true },
      { label: "Simplifying AI", href: siteConfig.utm.main, external: true },
      { label: "Examples", href: "/blocks" },
    ],
  },
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-border/40 border-t">
      <div className="container-wrapper px-4 py-12 xl:px-6">
        {/* Header row with title and theme toggle */}
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-base font-medium lowercase">
            simplify charts
          </Link>
          <ModeSwitcher />
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          <FooterLinkGroup {...footerLinks.docs} />
          <FooterLinkGroup {...footerLinks.basicCharts} />
          <FooterLinkGroup {...footerLinks.statisticalCharts} />
          <FooterLinkGroup {...footerLinks.financialCharts} />
          <FooterLinkGroup {...footerLinks.scientificCharts} />
          <FooterLinkGroup {...footerLinks.specializedCharts} />
          <FooterLinkGroup {...footerLinks.resources} />
        </div>

        {/* Bottom text */}
        <div className="text-muted-foreground mt-12 border-t border-border/40 pt-8 text-center text-xs">
          <p>
            Built by{" "}
            <a
              href={siteConfig.utm.main}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              Simplifying AI
            </a>
            . Source available on{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
