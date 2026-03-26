// Core components
export {
  ChartContainer,
  ResponsiveChartContainer,
  useChart,
  ChartContext,
} from "./chart-container"

export {
  type ChartConfig,
  type ChartDataPoint,
  type ChartSeries,
  type BaseChartProps,
  type AxisOrientation,
  type AxisScale,
  THEMES,
  DEFAULT_CHART_DIMENSIONS,
  DEFAULT_CHART_COLORS,
  getChartColor,
  generateChartStyles,
} from "./chart-config"

export { ChartAxis } from "./chart-axis"

export { ChartGrid, ChartHorizontalGrid, ChartVerticalGrid } from "./chart-grid"

export {
  ChartTooltip,
  ChartTooltipWrapper,
  ChartTooltipContent,
  type TooltipData,
} from "./chart-tooltip"

export {
  ChartLegend,
  ChartLegendInline,
  ChartLegendContent,
  type LegendItem,
} from "./chart-legend"

export * from "./chart-utils"

// Basic Charts
export { LineChart, type LineChartProps } from "./basic/line-chart"
export {
  BarChart,
  MultiBarChart,
  type BarChartProps,
  type BarChartDataPoint,
  type MultiBarChartProps,
  type MultiBarChartSeries,
  type MultiBarChartDataPoint,
} from "./basic/bar-chart"
export {
  AreaChart,
  MultiAreaChart,
  generateAreaChartData,
  type AreaChartProps,
  type AreaChartDataPoint,
  type MultiAreaChartProps,
  type MultiAreaChartSeries,
  type MultiAreaChartDataPoint,
} from "./basic/area-chart"
export { ScatterChart, type ScatterChartProps } from "./basic/scatter-chart"
export { PieChart, type PieChartProps } from "./basic/pie-chart"
export { DonutChart, type DonutChartProps } from "./basic/donut-chart"

// Statistical Charts
export {
  HistogramChart,
  type HistogramChartProps,
} from "./statistical/histogram-chart"
export {
  BoxPlotChart,
  type BoxPlotChartProps,
  type BoxPlotDataPoint,
  type BoxPlotStats,
} from "./statistical/box-plot-chart"
export { ViolinChart, type ViolinChartProps } from "./statistical/violin-chart"

// Financial Charts
export {
  CandlestickChart,
  type CandlestickChartProps,
} from "./financial/candlestick-chart"
export {
  WaterfallChart,
  type WaterfallChartProps,
} from "./financial/waterfall-chart"
export {
  FunnelChart,
  type FunnelChartProps,
  type FunnelDataPoint,
  type FunnelSeries,
} from "./financial/funnel-chart"

// Scientific Charts
export {
  HeatmapChart,
  type HeatmapChartProps,
} from "./scientific/heatmap-chart"
export {
  ContourChart,
  CONTOUR_COLOR_SCALES,
  type ContourChartProps,
  type ContourPoint,
} from "./scientific/contour-chart"

// Specialized Charts
export { RadarChart, type RadarChartProps } from "./specialized/radar-chart"
export {
  TreemapChart,
  type TreemapChartProps,
} from "./specialized/treemap-chart"
export {
  SunburstChart,
  type SunburstChartProps,
} from "./specialized/sunburst-chart"
export { SankeyChart, type SankeyChartProps } from "./specialized/sankey-chart"
export { GaugeChart, type GaugeChartProps } from "./specialized/gauge-chart"

// Map Charts
export {
  ChoroplethChart,
  type ChoroplethChartProps,
} from "./maps/choropleth-chart"
