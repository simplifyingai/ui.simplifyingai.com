# Simplify Charts

800+ beautiful chart components for React. Copy. Paste. Ship.

Built with [Recharts](https://recharts.org), [D3](https://d3js.org), and [Tailwind CSS](https://tailwindcss.com). Follows the [shadcn/ui](https://ui.shadcn.com/) copy-paste philosophy.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Twitter](https://img.shields.io/twitter/follow/simplaboratories?style=social)](https://twitter.com/simplaboratories)

## Features

- **20+ Chart Types** - Bar, Line, Area, Pie, Scatter, Heatmap, Sankey, Choropleth, and more
- **40 Variants Each** - 800+ total examples ready to copy
- **Zero Config** - Just copy the code and it works
- **TypeScript** - Full type safety out of the box
- **Dark Mode** - Every chart supports light and dark themes
- **Responsive** - Mobile-first design
- **Accessible** - Built with accessibility in mind

## Chart Types

| Category | Charts |
|----------|--------|
| **Basic** | Bar, Line, Area, Scatter, Pie, Donut |
| **Statistical** | Histogram, Box Plot, Violin |
| **Financial** | Candlestick, Waterfall, Funnel |
| **Scientific** | Heatmap, Contour |
| **Specialized** | Radar, Sankey, Sunburst, Treemap, Gauge |
| **Maps** | Choropleth (USA, India, China, UK, Germany, France, Brazil, World) |

## Quick Start

Visit [ui.simplifyingai.com](https://ui.simplifyingai.com) and copy any chart directly into your project.

### Using shadcn CLI

```bash
# Install a specific chart
npx shadcn@latest add https://ui.simplifyingai.com/r/bar-chart.json

# Install all charts
npx shadcn@latest add https://ui.simplifyingai.com/r/all.json
```

### Manual Installation

1. Copy the chart component from [ui.simplifyingai.com](https://ui.simplifyingai.com)
2. Paste into your project
3. Install dependencies if prompted
4. Done!

## Prerequisites

- **React 18+** or **Next.js 13+**
- **Tailwind CSS** configured
- **shadcn/ui** initialized (optional but recommended)

```bash
# Initialize shadcn/ui if you haven't
npx shadcn@latest init
```

## Examples

### Bar Chart

```tsx
import { BarChart } from "@/components/ui/charts/bar-chart"

export function MyChart() {
  const data = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 600 },
  ]

  return <BarChart data={data} xKey="name" yKey="value" />
}
```

### Candlestick Chart

```tsx
import { CandlestickChart } from "@/components/ui/charts/candlestick-chart"

export function StockChart() {
  const data = [
    { date: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
    { date: "2024-01-02", open: 105, high: 115, low: 100, close: 112 },
  ]

  return <CandlestickChart data={data} />
}
```

### Choropleth Map

```tsx
import { ChoroplethChart } from "@/components/ui/charts/choropleth-chart"

export function USAMap() {
  const data = [
    { id: "CA", value: 39538223 },
    { id: "TX", value: 29145505 },
  ]

  return <ChoroplethChart data={data} map="usa" />
}
```

## Documentation

Full documentation available at [ui.simplifyingai.com/docs](https://ui.simplifyingai.com/docs)

- [Getting Started](https://ui.simplifyingai.com/docs)
- [Chart Components](https://ui.simplifyingai.com/docs/charts)
- [Theming](https://ui.simplifyingai.com/docs/theming)
- [Examples](https://ui.simplifyingai.com/blocks)

## Chart Variants

Each chart type includes multiple variants:

| Variant Type | Description |
|--------------|-------------|
| **Default** | Standard implementation |
| **Horizontal** | Rotated orientation |
| **Stacked** | Stacked data series |
| **Grouped** | Side-by-side comparison |
| **Interactive** | With tooltips and hover states |
| **Animated** | Smooth transitions |
| **Minimal** | Clean, simplified design |
| **Gradient** | With gradient fills |

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-chart`)
3. Commit your changes (`git commit -m 'Add amazing chart'`)
4. Push to the branch (`git push origin feature/amazing-chart`)
5. Open a Pull Request

## Local Development

```bash
# Clone the repository
git clone https://github.com/simplifying-ai/charts.git

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build the registry
pnpm registry:build
```

## License

Licensed under the [MIT License](LICENSE.md).

---

## About Simplifying AI

**Simplify Charts** is a free, open-source project by [Simplifying AI](https://simplifyingai.com).

We're building the future of data analysis with AI-powered tools:

- **Simplify Platform** - Data analysis workspace with AI
- **Simplify Agents** - AI agents that understand your data
- **Simplify Chat** - Natural language data queries

[Learn more about Simplifying AI](https://simplifyingai.com) | [Try the Platform](https://simplifyingai.com/platform)

---

<p align="center">
  <strong>Simplify Charts</strong> - Data visualization, simplified.
</p>
