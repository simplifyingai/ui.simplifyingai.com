import { type Registry } from "shadcn/schema"

export const ui: Registry["items"] = [
  // Core Chart Infrastructure
  {
    name: "chart",
    type: "registry:ui",
    dependencies: [
      "d3-scale",
      "d3-shape",
      "d3-array",
      "d3-hierarchy",
      "d3-geo",
      "d3-sankey",
      "d3-force",
      "d3-interpolate",
    ],
    files: [
      { path: "ui/charts/chart-config.ts", type: "registry:ui" },
      { path: "ui/charts/chart-container.tsx", type: "registry:ui" },
      { path: "ui/charts/chart-axis.tsx", type: "registry:ui" },
      { path: "ui/charts/chart-grid.tsx", type: "registry:ui" },
      { path: "ui/charts/chart-tooltip.tsx", type: "registry:ui" },
      { path: "ui/charts/chart-legend.tsx", type: "registry:ui" },
      { path: "ui/charts/chart-utils.ts", type: "registry:ui" },
      { path: "ui/charts/index.ts", type: "registry:ui" },
    ],
  },

  // Basic Charts
  {
    name: "line-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [{ path: "ui/charts/basic/line-chart.tsx", type: "registry:ui" }],
  },
  {
    name: "bar-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [{ path: "ui/charts/basic/bar-chart.tsx", type: "registry:ui" }],
  },
  {
    name: "area-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [{ path: "ui/charts/basic/area-chart.tsx", type: "registry:ui" }],
  },
  {
    name: "scatter-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [{ path: "ui/charts/basic/scatter-chart.tsx", type: "registry:ui" }],
  },
  {
    name: "pie-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [{ path: "ui/charts/basic/pie-chart.tsx", type: "registry:ui" }],
  },
  {
    name: "donut-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [{ path: "ui/charts/basic/donut-chart.tsx", type: "registry:ui" }],
  },

  // Statistical Charts
  {
    name: "histogram-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      {
        path: "ui/charts/statistical/histogram-chart.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "box-plot-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/statistical/box-plot-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "violin-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/statistical/violin-chart.tsx", type: "registry:ui" },
    ],
  },

  // Financial Charts
  {
    name: "candlestick-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      {
        path: "ui/charts/financial/candlestick-chart.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "waterfall-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/financial/waterfall-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "funnel-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/financial/funnel-chart.tsx", type: "registry:ui" },
    ],
  },

  // Scientific Charts
  {
    name: "heatmap-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/scientific/heatmap-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "contour-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/scientific/contour-chart.tsx", type: "registry:ui" },
    ],
  },

  // Specialized Charts
  {
    name: "radar-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/specialized/radar-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "treemap-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/specialized/treemap-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "sunburst-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/specialized/sunburst-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "sankey-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/specialized/sankey-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "gauge-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/specialized/gauge-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "bullet-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/specialized/bullet-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "icicle-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/specialized/icicle-chart.tsx", type: "registry:ui" },
    ],
  },

  // Basic Charts (Additional)
  {
    name: "dot-plot-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/basic/dot-plot-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "lollipop-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/basic/lollipop-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "dumbbell-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/basic/dumbbell-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "slope-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [{ path: "ui/charts/basic/slope-chart.tsx", type: "registry:ui" }],
  },

  // Financial Charts (Additional)
  {
    name: "ohlc-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/financial/ohlc-chart.tsx", type: "registry:ui" },
    ],
  },

  // Map Charts
  {
    name: "choropleth-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/maps/choropleth-chart.tsx", type: "registry:ui" },
    ],
  },

  // Phase 2 Charts - Statistical
  {
    name: "polar-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/statistical/polar-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "parallel-coordinates",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      {
        path: "ui/charts/statistical/parallel-coordinates.tsx",
        type: "registry:ui",
      },
    ],
  },

  // Phase 2 Charts - Scientific
  {
    name: "density-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    dependencies: ["d3-contour"],
    files: [
      { path: "ui/charts/scientific/density-chart.tsx", type: "registry:ui" },
    ],
  },

  // Phase 2 Charts - Specialized
  {
    name: "network-graph",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/specialized/network-graph.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "dendrogram",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/specialized/dendrogram.tsx", type: "registry:ui" },
    ],
  },

  // Phase 3 Charts - Statistical
  {
    name: "splom-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/statistical/splom-chart.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "parcats-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/statistical/parcats-chart.tsx", type: "registry:ui" },
    ],
  },

  // Phase 3 Charts - Scientific
  {
    name: "ternary-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [
      { path: "ui/charts/scientific/ternary-chart.tsx", type: "registry:ui" },
    ],
  },

  // Phase 3 Charts - Basic
  {
    name: "range-chart",
    type: "registry:ui",
    registryDependencies: ["chart"],
    files: [{ path: "ui/charts/basic/range-chart.tsx", type: "registry:ui" }],
  },
]
