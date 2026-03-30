import { NextResponse } from "next/server"

import { siteConfig } from "@/lib/config"

export const revalidate = false

const LLMS_TXT = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} is a comprehensive chart library built on shadcn/ui. It provides 40+ chart components for React applications with beautiful, interactive data visualizations.

## Documentation

- [Getting Started](${siteConfig.url}/docs): Introduction and overview
- [Setup](${siteConfig.url}/docs/setup): Installation instructions
- [Usage](${siteConfig.url}/docs/usage): How to use chart components
- [Troubleshooting](${siteConfig.url}/docs/troubleshooting): Common issues and solutions

## Chart Components

### Basic Charts
- [Line Chart](${siteConfig.url}/docs/components/line-chart): Time series and trend visualization
- [Bar Chart](${siteConfig.url}/docs/components/bar-chart): Categorical comparisons
- [Area Chart](${siteConfig.url}/docs/components/area-chart): Stacked area and trends
- [Scatter Chart](${siteConfig.url}/docs/components/scatter-chart): Point distributions
- [Pie Chart](${siteConfig.url}/docs/components/pie-chart): Part-to-whole relationships
- [Donut Chart](${siteConfig.url}/docs/components/donut-chart): Ring charts with center content
- [Dot Plot Chart](${siteConfig.url}/docs/components/dot-plot-chart): Cleveland dot plots
- [Lollipop Chart](${siteConfig.url}/docs/components/lollipop-chart): Lollipop style comparisons
- [Dumbbell Chart](${siteConfig.url}/docs/components/dumbbell-chart): Range comparisons
- [Slope Chart](${siteConfig.url}/docs/components/slope-chart): Change between two points
- [Range Chart](${siteConfig.url}/docs/components/range-chart): Value ranges and confidence intervals

### Statistical Charts
- [Histogram Chart](${siteConfig.url}/docs/components/histogram-chart): Distribution analysis
- [Box Plot Chart](${siteConfig.url}/docs/components/box-plot-chart): Statistical summaries
- [Violin Chart](${siteConfig.url}/docs/components/violin-chart): Density distributions
- [Polar Chart](${siteConfig.url}/docs/components/polar-chart): Radial/polar visualizations
- [Parallel Coordinates](${siteConfig.url}/docs/components/parallel-coordinates): Multi-dimensional data
- [SPLOM Chart](${siteConfig.url}/docs/components/splom-chart): Scatter plot matrix
- [Parcats Chart](${siteConfig.url}/docs/components/parcats-chart): Parallel categories diagram

### Financial Charts
- [Candlestick Chart](${siteConfig.url}/docs/components/candlestick-chart): OHLC financial data
- [OHLC Chart](${siteConfig.url}/docs/components/ohlc-chart): Open-high-low-close bars
- [Waterfall Chart](${siteConfig.url}/docs/components/waterfall-chart): Cumulative changes
- [Funnel Chart](${siteConfig.url}/docs/components/funnel-chart): Conversion funnels

### Scientific Charts
- [Heatmap Chart](${siteConfig.url}/docs/components/heatmap-chart): 2D intensity maps
- [Contour Chart](${siteConfig.url}/docs/components/contour-chart): Density contours
- [Density Chart](${siteConfig.url}/docs/components/density-chart): 2D density visualization
- [Ternary Chart](${siteConfig.url}/docs/components/ternary-chart): Three-component composition

### Specialized Charts
- [Radar Chart](${siteConfig.url}/docs/components/radar-chart): Multi-variable comparison
- [Treemap Chart](${siteConfig.url}/docs/components/treemap-chart): Hierarchical data
- [Sunburst Chart](${siteConfig.url}/docs/components/sunburst-chart): Nested hierarchies
- [Sankey Chart](${siteConfig.url}/docs/components/sankey-chart): Flow diagrams
- [Gauge Chart](${siteConfig.url}/docs/components/gauge-chart): KPI indicators
- [Bullet Chart](${siteConfig.url}/docs/components/bullet-chart): Performance metrics
- [Icicle Chart](${siteConfig.url}/docs/components/icicle-chart): Hierarchical partitions
- [Network Graph](${siteConfig.url}/docs/components/network-graph): Node-link diagrams
- [Dendrogram](${siteConfig.url}/docs/components/dendrogram): Tree diagrams

### Map Charts
- [Choropleth Chart](${siteConfig.url}/docs/components/choropleth-chart): Geographic data visualization

## Installation

Install any chart component using the shadcn CLI:

\`\`\`bash
npx shadcn@latest add ${siteConfig.url}/r/<component-name>.json
\`\`\`

Example:
\`\`\`bash
npx shadcn@latest add ${siteConfig.url}/r/line-chart.json
\`\`\`

## Links

- Website: ${siteConfig.url}
- GitHub: ${siteConfig.links.github}
- Full Documentation: ${siteConfig.url}/llms-full.txt
`

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
