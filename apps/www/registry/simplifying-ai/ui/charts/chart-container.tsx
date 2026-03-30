"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import {
  DEFAULT_CHART_DIMENSIONS,
  generateChartStyles,
  type ChartConfig,
} from "./chart-config"

// Chart context for sharing config across components
interface ChartContextValue {
  config: ChartConfig
  chartId: string
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

// Style injection component
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const styles = generateChartStyles(id, config)
  if (!styles) return null

  return <style dangerouslySetInnerHTML={{ __html: styles }} />
}

// Main chart container
export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig
  children: React.ReactNode
}

export function ChartContainer({
  id,
  className,
  children,
  config = {},
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config, chartId }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-sm",
          "[&_.chart-grid-line]:stroke-border/40",
          "[&_.chart-axis-line]:stroke-border/60",
          "[&_.chart-axis-tick]:fill-muted-foreground",
          "[&_.chart-axis-label]:fill-muted-foreground",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {children}
      </div>
    </ChartContext.Provider>
  )
}

// Responsive wrapper using ResizeObserver
export interface ResponsiveChartContainerProps extends ChartContainerProps {
  aspectRatio?: number
}

export function ResponsiveChartContainer({
  aspectRatio = 16 / 9,
  children,
  ...props
}: ResponsiveChartContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number }>({
    width: DEFAULT_CHART_DIMENSIONS.width,
    height: DEFAULT_CHART_DIMENSIONS.height,
  })

  React.useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        setDimensions({
          width: Math.round(width),
          height: Math.round(width / aspectRatio),
        })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [aspectRatio])

  return (
    <div ref={containerRef} className="w-full">
      <ChartContainer {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement<{ width?: number; height?: number }>(child)) {
            return React.cloneElement(child, {
              width: dimensions.width,
              height: dimensions.height,
            })
          }
          return child
        })}
      </ChartContainer>
    </div>
  )
}

export { ChartContext }
