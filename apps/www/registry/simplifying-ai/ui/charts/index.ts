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
export {
  DotPlotChart,
  type DotPlotChartProps,
  type DotPlotDataPoint,
} from "./basic/dot-plot-chart"
export { LollipopChart, type LollipopChartProps } from "./basic/lollipop-chart"
export { DumbbellChart, type DumbbellChartProps } from "./basic/dumbbell-chart"
export { SlopeChart, type SlopeChartProps } from "./basic/slope-chart"
export {
  RangeChart,
  type RangeChartProps,
  type RangeDataPoint,
} from "./basic/range-chart"

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
export {
  PolarChart,
  type PolarChartProps,
  type PolarDataPoint,
} from "./statistical/polar-chart"
export {
  ParallelCoordinates,
  type ParallelCoordinatesProps,
  type ParallelCoordinatesDataPoint,
} from "./statistical/parallel-coordinates"
export {
  SplomChart,
  type SplomChartProps,
  type SplomDataPoint,
} from "./statistical/splom-chart"
export {
  ParcatsChart,
  type ParcatsChartProps,
  type ParcatsDataPoint,
} from "./statistical/parcats-chart"

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
export { OHLCChart, type OHLCChartProps } from "./financial/ohlc-chart"

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
export {
  DensityChart,
  type DensityChartProps,
  type DensityDataPoint,
} from "./scientific/density-chart"
export {
  TernaryChart,
  type TernaryChartProps,
  type TernaryDataPoint,
} from "./scientific/ternary-chart"

// Specialized Charts
export {
  RadarChart,
  type RadarChartProps,
  type RadarChartDataPoint,
  type RadarChartSeries,
  type RadarChartVariant,
} from "./specialized/radar-chart"
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
export { BulletChart, type BulletChartProps } from "./specialized/bullet-chart"
export { IcicleChart, type IcicleChartProps } from "./specialized/icicle-chart"
export {
  NetworkGraph,
  type NetworkGraphProps,
  type NetworkNode,
  type NetworkLink,
} from "./specialized/network-graph"
export {
  Dendrogram,
  type DendrogramProps,
  type DendrogramNode,
} from "./specialized/dendrogram"

// Map Charts
export {
  ChoroplethChart,
  type ChoroplethChartProps,
} from "./maps/choropleth-chart"
