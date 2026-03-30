"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"
import { arc } from "d3-shape"

import { cn } from "@/lib/utils"

export interface PolarDataPoint {
  category: string
  value: number
  color?: string
}

export interface PolarChartProps {
  data: PolarDataPoint[]
  className?: string
  variant?: "rose" | "coxcomb" | "radar-area"
  innerRadius?: number
  showLabels?: boolean
  showValues?: boolean
  showGrid?: boolean
  valueFormatter?: (value: number) => string
  colorScheme?: string[]
}

export function PolarChart({
  data,
  className,
  variant = "rose",
  innerRadius = 0,
  showLabels = true,
  showValues = false,
  showGrid = true,
  valueFormatter = (value) => value.toLocaleString(),
  colorScheme = [
    "#1e40af",
    "#2563eb",
    "#3b82f6",
    "#60a5fa",
    "#93c5fd",
    "#bfdbfe",
  ],
}: PolarChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const width = 400
  const height = 400
  const centerX = width / 2
  const centerY = height / 2
  const outerRadius = Math.min(width, height) / 2 - 40

  const maxValue = Math.max(...data.map((d) => d.value))

  // Angle scale (categories around the circle)
  const angleScale = scaleBand<string>()
    .domain(data.map((d) => d.category))
    .range([0, 2 * Math.PI])

  // Radius scale (values from center to edge)
  const radiusScale = scaleLinear()
    .domain([0, maxValue])
    .range([innerRadius, outerRadius])

  // Grid circles
  const gridCircles = radiusScale.ticks(4)

  // Arc generator
  const arcGenerator = arc<{
    startAngle: number
    endAngle: number
    innerRadius: number
    outerRadius: number
  }>()

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Grid circles */}
          {showGrid &&
            gridCircles.map((tick, i) => (
              <g key={`grid-${i}`}>
                <circle
                  r={radiusScale(tick)}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <text
                  x={4}
                  y={-radiusScale(tick) - 2}
                  className="fill-muted-foreground text-[10px]"
                >
                  {valueFormatter(tick)}
                </text>
              </g>
            ))}

          {/* Grid lines (spokes) */}
          {showGrid &&
            data.map((d, i) => {
              const angle =
                (angleScale(d.category) ?? 0) +
                angleScale.bandwidth() / 2 -
                Math.PI / 2
              const x2 = Math.cos(angle) * outerRadius
              const y2 = Math.sin(angle) * outerRadius
              return (
                <line
                  key={`spoke-${i}`}
                  x1={0}
                  y1={0}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.3}
                />
              )
            })}

          {/* Rose/Coxcomb segments */}
          {data.map((d, index) => {
            const startAngle = angleScale(d.category) ?? 0
            const endAngle = startAngle + angleScale.bandwidth()
            const color = d.color ?? colorScheme[index % colorScheme.length]
            const isHovered = hoveredIndex === index

            let segmentRadius: number
            if (variant === "coxcomb") {
              // Coxcomb: equal angles, radius varies with sqrt(value) for equal area
              segmentRadius = radiusScale(
                Math.sqrt(d.value / maxValue) * maxValue
              )
            } else {
              // Rose: equal angles, radius varies linearly with value
              segmentRadius = radiusScale(d.value)
            }

            const pathData = arcGenerator({
              startAngle: startAngle - Math.PI / 2,
              endAngle: endAngle - Math.PI / 2,
              innerRadius: innerRadius,
              outerRadius: segmentRadius,
            })

            return (
              <g key={d.category}>
                <path
                  d={pathData ?? ""}
                  fill={color}
                  fillOpacity={isHovered ? 0.9 : 0.7}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    hoveredIndex !== null && !isHovered && "opacity-50"
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            )
          })}

          {/* Labels */}
          {showLabels &&
            data.map((d, index) => {
              const angle =
                (angleScale(d.category) ?? 0) +
                angleScale.bandwidth() / 2 -
                Math.PI / 2
              const labelRadius = outerRadius + 20
              const x = Math.cos(angle) * labelRadius
              const y = Math.sin(angle) * labelRadius

              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-xs font-medium"
                  style={{
                    transform: `rotate(${angle > Math.PI / 2 && angle < (3 * Math.PI) / 2 ? 180 : 0}deg)`,
                    transformOrigin: `${x}px ${y}px`,
                  }}
                >
                  {d.category}
                </text>
              )
            })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="mt-2 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
            <div className="font-medium">{data[hoveredIndex].category}</div>
            <div className="text-muted-foreground">
              {valueFormatter(data[hoveredIndex].value)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
