"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import type { BaseChartProps } from "../chart-config"
import { ChartContainer } from "../chart-container"

export interface GaugeChartProps extends BaseChartProps {
  /** Current value to display */
  value: number
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Label text below value */
  label?: string
  /** Units to display after value */
  units?: string
  /** Show the numeric value */
  showValue?: boolean
  /** Gauge variant style */
  variant?:
    | "modern"
    | "speedometer"
    | "segmented"
    | "radial"
    | "minimal"
    | "gradient"
    | "meter"
    | "dashboard"
  /** Arc thickness (as percentage of radius, 0-1) */
  thickness?: number
  /** Primary color or color for filled arc */
  color?: string
  /** Secondary color for gradient */
  colorSecondary?: string
  /** Background arc color */
  bgColor?: string
  /** Segments for segmented variant */
  segments?: Array<{ value: number; color: string; label?: string }>
  /** Show tick marks */
  showTicks?: boolean
  /** Number of tick marks */
  tickCount?: number
  /** Animate on mount */
  animate?: boolean
  /** Animation duration in ms */
  animationDuration?: number
  /** Value formatter */
  valueFormatter?: (value: number) => string
  /** Show percentage instead of value */
  showPercentage?: boolean
}

// Default colors using CSS variables for theme support
const COLORS = {
  primary: "var(--chart-1)",
  success: "var(--chart-2)",
  warning: "var(--chart-3)",
  danger: "var(--chart-4)",
  muted: "var(--muted)",
  purple: "var(--chart-5)",
  pink: "var(--chart-3)",
}

export function GaugeChart({
  value,
  config,
  className,
  width = 280,
  height = 200,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  min = 0,
  max = 100,
  label,
  units,
  showValue = true,
  variant = "modern",
  thickness = 0.15,
  color = COLORS.primary,
  colorSecondary = COLORS.purple,
  bgColor = COLORS.muted,
  segments,
  showTicks = false,
  tickCount = 5,
  animate = true,
  animationDuration = 1000,
  valueFormatter,
  showPercentage = false,
}: GaugeChartProps) {
  const [animatedPercentage, setAnimatedPercentage] = React.useState(0)
  const gradientId = React.useId().replace(/:/g, "")

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Calculate dimensions based on variant
  const isRadial = variant === "radial"
  const centerX = innerWidth / 2
  const centerY = isRadial ? innerHeight / 2 : innerHeight * 0.75
  const radius =
    Math.min(innerWidth / 2, isRadial ? innerHeight / 2 : innerHeight * 0.7) *
    0.85
  const strokeWidth = radius * thickness

  // Clamp value and calculate percentage
  const clampedValue = Math.max(min, Math.min(max, value))
  const targetPercentage = (clampedValue - min) / (max - min)

  // Animate percentage
  React.useEffect(() => {
    if (!animate) {
      setAnimatedPercentage(targetPercentage)
      return
    }

    const startTime = Date.now()
    const startPercentage = animatedPercentage

    const animateFrame = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const newPercentage =
        startPercentage + (targetPercentage - startPercentage) * eased
      setAnimatedPercentage(newPercentage)
      if (progress < 1) requestAnimationFrame(animateFrame)
    }
    requestAnimationFrame(animateFrame)
  }, [targetPercentage, animate, animationDuration])

  // Arc calculations for semi-circle (270 degrees for gauge, 360 for radial)
  const arcAngle = isRadial ? 360 : 270
  const circumference = 2 * Math.PI * radius
  const arcLength = (arcAngle / 360) * circumference
  const dashOffset = arcLength * (1 - animatedPercentage)

  // Format value
  const formatValue = (v: number): string => {
    if (valueFormatter) return valueFormatter(v)
    if (showPercentage) return `${Math.round((v / max) * 100)}%`
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
    return Math.round(v).toString()
  }

  // Get segment color at current value
  const getSegmentColor = (): string => {
    if (!segments || segments.length === 0) return color
    const currentValue = min + (max - min) * animatedPercentage
    for (let i = segments.length - 1; i >= 0; i--) {
      if (currentValue >= segments[i].value) {
        return segments[i].color
      }
    }
    return segments[0]?.color || color
  }

  // Generate tick positions for semi-circle
  const generateTicks = () => {
    if (!showTicks) return []
    const ticks = []
    const startAngle = -225 // Start from bottom-left
    const totalAngle = 270 // Semi-circle arc

    for (let i = 0; i < tickCount; i++) {
      const angle = startAngle + (totalAngle / (tickCount - 1)) * i
      const rad = (angle * Math.PI) / 180
      const tickValue = min + ((max - min) / (tickCount - 1)) * i

      // Outer tick position
      const outerX = centerX + (radius + 10) * Math.cos(rad)
      const outerY = centerY + (radius + 10) * Math.sin(rad)

      // Inner tick position
      const innerX = centerX + (radius - strokeWidth / 2 - 5) * Math.cos(rad)
      const innerY = centerY + (radius - strokeWidth / 2 - 5) * Math.sin(rad)

      // Label position
      const labelX = centerX + (radius + 25) * Math.cos(rad)
      const labelY = centerY + (radius + 25) * Math.sin(rad)

      ticks.push({
        angle,
        innerX,
        innerY,
        outerX,
        outerY,
        labelX,
        labelY,
        value: tickValue,
      })
    }
    return ticks
  }

  const ticks = generateTicks()

  // Semi-circle arc path (for background)
  const semiCirclePath = `
    M ${centerX - radius} ${centerY}
    A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}
  `

  // Radial uses circle
  const renderRadial = () => (
    <>
      {/* Background circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      {/* Value arc */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke={segments ? getSegmentColor() : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - animatedPercentage)}
        transform={`rotate(-90 ${centerX} ${centerY})`}
        style={{ transition: animate ? "none" : "stroke-dashoffset 0.3s ease" }}
      />
      {/* Center content */}
      {showValue && (
        <g transform={`translate(${centerX}, ${centerY})`}>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-bold"
            style={{ fontSize: radius * 0.4 }}
          >
            {formatValue(min + (max - min) * animatedPercentage)}
          </text>
          {(units || label) && (
            <text
              y={radius * 0.3}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: radius * 0.14 }}
            >
              {units || label}
            </text>
          )}
        </g>
      )}
    </>
  )

  // Modern clean arc
  const renderModern = () => (
    <>
      {/* Background arc */}
      <path
        d={semiCirclePath}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Value arc */}
      <path
        d={semiCirclePath}
        fill="none"
        stroke={segments ? getSegmentColor() : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={arcLength}
        strokeDashoffset={dashOffset}
        style={{ transition: animate ? "none" : "stroke-dashoffset 0.3s ease" }}
      />
      {/* Center value */}
      {showValue && (
        <g transform={`translate(${centerX}, ${centerY - radius * 0.15})`}>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-bold"
            style={{ fontSize: radius * 0.45 }}
          >
            {formatValue(min + (max - min) * animatedPercentage)}
          </text>
          {units && (
            <text
              y={radius * 0.25}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: radius * 0.14 }}
            >
              {units}
            </text>
          )}
          {label && (
            <text
              y={radius * 0.45}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: radius * 0.12 }}
            >
              {label}
            </text>
          )}
        </g>
      )}
    </>
  )

  // Gradient arc
  const renderGradient = () => (
    <>
      <defs>
        <linearGradient
          id={`gauge-gradient-${gradientId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={colorSecondary} />
        </linearGradient>
      </defs>
      {/* Background arc */}
      <path
        d={semiCirclePath}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Gradient value arc */}
      <path
        d={semiCirclePath}
        fill="none"
        stroke={`url(#gauge-gradient-${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={arcLength}
        strokeDashoffset={dashOffset}
      />
      {/* Center value */}
      {showValue && (
        <g transform={`translate(${centerX}, ${centerY - radius * 0.15})`}>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-bold"
            style={{ fontSize: radius * 0.45 }}
          >
            {formatValue(min + (max - min) * animatedPercentage)}
          </text>
          {label && (
            <text
              y={radius * 0.35}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: radius * 0.12 }}
            >
              {label}
            </text>
          )}
        </g>
      )}
    </>
  )

  // Speedometer with needle
  const renderSpeedometer = () => {
    const needleAngle = -225 + 270 * animatedPercentage
    const needleRad = (needleAngle * Math.PI) / 180
    const needleLength = radius * 0.7
    const needleX = centerX + needleLength * Math.cos(needleRad)
    const needleY = centerY + needleLength * Math.sin(needleRad)

    return (
      <>
        {/* Background arc */}
        <path
          d={semiCirclePath}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={semiCirclePath}
          fill="none"
          stroke={segments ? getSegmentColor() : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={dashOffset}
        />
        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.innerX}
              y1={tick.innerY}
              x2={tick.innerX + (tick.outerX - tick.innerX) * 0.5}
              y2={tick.innerY + (tick.outerY - tick.innerY) * 0.5}
              stroke="currentColor"
              strokeWidth={2}
              className="text-muted-foreground"
            />
            <text
              x={tick.labelX}
              y={tick.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 9 }}
            >
              {formatValue(tick.value)}
            </text>
          </g>
        ))}
        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke={segments ? getSegmentColor() : color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* Needle center */}
        <circle
          cx={centerX}
          cy={centerY}
          r={12}
          fill={segments ? getSegmentColor() : color}
        />
        <circle cx={centerX} cy={centerY} r={6} fill="white" />
        {/* Value below */}
        {showValue && (
          <text
            x={centerX}
            y={centerY + radius * 0.35}
            textAnchor="middle"
            className="fill-foreground font-bold"
            style={{ fontSize: radius * 0.28 }}
          >
            {formatValue(min + (max - min) * animatedPercentage)}
            {units && (
              <tspan
                className="fill-muted-foreground font-normal"
                style={{ fontSize: radius * 0.12 }}
              >
                {" "}
                {units}
              </tspan>
            )}
          </text>
        )}
      </>
    )
  }

  // Segmented colored zones
  const renderSegmented = () => {
    const segs = segments || [
      { value: 0, color: COLORS.success },
      { value: 33, color: COLORS.warning },
      { value: 66, color: COLORS.danger },
    ]

    // Gap angle in degrees between segments
    const gapAngle = 3

    // Generate individual arc paths for each segment
    const generateSegmentArc = (startPercent: number, endPercent: number) => {
      const startAngle = -225 + 270 * startPercent
      const endAngle = -225 + 270 * endPercent
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = centerX + radius * Math.cos(startRad)
      const y1 = centerY + radius * Math.sin(startRad)
      const x2 = centerX + radius * Math.cos(endRad)
      const y2 = centerY + radius * Math.sin(endRad)

      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
    }

    return (
      <>
        {/* Segmented arcs - using individual arc paths for clean edges */}
        {segs.map((seg, i) => {
          const nextValue = segs[i + 1]?.value ?? max
          const segStart = (seg.value - min) / (max - min)
          const segEnd = (nextValue - min) / (max - min)

          // Add small gaps between segments
          const gapOffset = gapAngle / 270 // Convert gap angle to percentage
          const adjustedStart = i === 0 ? segStart : segStart + gapOffset / 2
          const adjustedEnd =
            i === segs.length - 1 ? segEnd : segEnd - gapOffset / 2

          const isActive = animatedPercentage >= segStart

          return (
            <path
              key={i}
              d={generateSegmentArc(adjustedStart, adjustedEnd)}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={isActive ? 1 : 0.25}
              style={{ transition: "opacity 0.3s ease" }}
            />
          )
        })}
        {/* Indicator needle */}
        {(() => {
          const needleAngle = -225 + 270 * animatedPercentage
          const needleRad = (needleAngle * Math.PI) / 180
          const needleOuterX =
            centerX + (radius + strokeWidth / 2 + 6) * Math.cos(needleRad)
          const needleOuterY =
            centerY + (radius + strokeWidth / 2 + 6) * Math.sin(needleRad)
          const needleInnerX =
            centerX + (radius - strokeWidth / 2 - 6) * Math.cos(needleRad)
          const needleInnerY =
            centerY + (radius - strokeWidth / 2 - 6) * Math.sin(needleRad)

          return (
            <g>
              {/* Needle line */}
              <line
                x1={needleInnerX}
                y1={needleInnerY}
                x2={needleOuterX}
                y2={needleOuterY}
                stroke={getSegmentColor()}
                strokeWidth={3}
                strokeLinecap="round"
              />
              {/* Needle dot on arc */}
              <circle
                cx={centerX + radius * Math.cos(needleRad)}
                cy={centerY + radius * Math.sin(needleRad)}
                r={strokeWidth / 2 + 2}
                fill={getSegmentColor()}
              />
            </g>
          )
        })()}
        {/* Center value */}
        {showValue && (
          <g transform={`translate(${centerX}, ${centerY - radius * 0.15})`}>
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-bold"
              style={{ fontSize: radius * 0.4, fill: getSegmentColor() }}
            >
              {formatValue(min + (max - min) * animatedPercentage)}
            </text>
            {label && (
              <text
                y={radius * 0.3}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: radius * 0.12 }}
              >
                {label}
              </text>
            )}
          </g>
        )}
      </>
    )
  }

  // Minimal thin arc
  const renderMinimal = () => (
    <>
      {/* Background arc */}
      <path
        d={semiCirclePath}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth * 0.5}
        strokeLinecap="round"
      />
      {/* Value arc */}
      <path
        d={semiCirclePath}
        fill="none"
        stroke={segments ? getSegmentColor() : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={arcLength}
        strokeDashoffset={dashOffset}
      />
      {/* Min label */}
      <text
        x={centerX - radius - 10}
        y={centerY + 15}
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontSize: 10 }}
      >
        {formatValue(min)}
      </text>
      {/* Max label */}
      <text
        x={centerX + radius + 10}
        y={centerY + 15}
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontSize: 10 }}
      >
        {formatValue(max)}
      </text>
      {/* Center value */}
      {showValue && (
        <g transform={`translate(${centerX}, ${centerY - radius * 0.2})`}>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-bold"
            style={{ fontSize: radius * 0.5 }}
          >
            {formatValue(min + (max - min) * animatedPercentage)}
          </text>
          {label && (
            <text
              y={radius * 0.3}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: radius * 0.12 }}
            >
              {label}
            </text>
          )}
        </g>
      )}
    </>
  )

  // Meter style with ticks outside
  const renderMeter = () => (
    <>
      {/* Outer tick marks */}
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={tick.outerX}
            y1={tick.outerY}
            x2={tick.outerX + (tick.labelX - tick.outerX) * 0.4}
            y2={tick.outerY + (tick.labelY - tick.outerY) * 0.4}
            stroke="currentColor"
            strokeWidth={i === 0 || i === tickCount - 1 ? 2.5 : 1.5}
            className="text-muted-foreground"
          />
          <text
            x={tick.labelX}
            y={tick.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground font-medium"
            style={{ fontSize: 10 }}
          >
            {formatValue(tick.value)}
          </text>
        </g>
      ))}
      {/* Background arc */}
      <path
        d={semiCirclePath}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Value arc */}
      <path
        d={semiCirclePath}
        fill="none"
        stroke={segments ? getSegmentColor() : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={arcLength}
        strokeDashoffset={dashOffset}
      />
      {/* Center value */}
      {showValue && (
        <g transform={`translate(${centerX}, ${centerY - radius * 0.1})`}>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-bold"
            style={{ fontSize: radius * 0.35 }}
          >
            {formatValue(min + (max - min) * animatedPercentage)}
          </text>
          {label && (
            <text
              y={radius * 0.25}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: radius * 0.11 }}
            >
              {label}
            </text>
          )}
        </g>
      )}
    </>
  )

  // Dashboard card style
  const renderDashboard = () => {
    const percentage = Math.round(animatedPercentage * 100)
    return (
      <>
        {/* Background arc */}
        <path
          d={semiCirclePath}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth * 1.5}
          strokeLinecap="round"
        />
        {/* Value arc with rounded gradient look */}
        <path
          d={semiCirclePath}
          fill="none"
          stroke={segments ? getSegmentColor() : color}
          strokeWidth={strokeWidth * 1.5}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={dashOffset}
        />
        {/* Large percentage in center */}
        {showValue && (
          <g transform={`translate(${centerX}, ${centerY - radius * 0.2})`}>
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground font-bold"
              style={{ fontSize: radius * 0.6 }}
            >
              {percentage}
              <tspan style={{ fontSize: radius * 0.25 }}>%</tspan>
            </text>
            {label && (
              <text
                y={radius * 0.35}
                textAnchor="middle"
                className="fill-muted-foreground font-medium"
                style={{ fontSize: radius * 0.13 }}
              >
                {label}
              </text>
            )}
          </g>
        )}
      </>
    )
  }

  const renderContent = () => {
    switch (variant) {
      case "speedometer":
        return renderSpeedometer()
      case "segmented":
        return renderSegmented()
      case "radial":
        return renderRadial()
      case "minimal":
        return renderMinimal()
      case "gradient":
        return renderGradient()
      case "meter":
        return renderMeter()
      case "dashboard":
        return renderDashboard()
      default:
        return renderModern()
    }
  }

  return (
    <ChartContainer
      config={config}
      className={cn("!aspect-auto flex-col", className)}
    >
      <div className="relative mx-auto aspect-square w-full max-w-[280px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {renderContent()}
          </g>
        </svg>
      </div>
    </ChartContainer>
  )
}
