"use client"

import * as React from "react"
import type { GeoPermissibleObjects } from "d3-geo"
import {
  geoAlbersUsa,
  geoEqualEarth,
  geoMercator,
  geoNaturalEarth1,
  geoPath,
} from "d3-geo"
import { interpolateRgb } from "d3-interpolate"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"

import { cn } from "@/lib/utils"

export interface GeoFeature {
  type: "Feature"
  properties: {
    name?: string
    iso_a2?: string
    iso_a3?: string
    [key: string]: unknown
  }
  geometry: GeoPermissibleObjects
  id?: string | number
}

export interface GeoJSON {
  type: "FeatureCollection"
  features: GeoFeature[]
}

export interface ChoroplethDataPoint {
  id: string // ISO country code (2 or 3 letter)
  value: number
  label?: string
}

export interface ChoroplethChartProps {
  data: ChoroplethDataPoint[]
  className?: string
  colorScale?: string[]
  showTooltip?: boolean
  showLegend?: boolean
  projection?: "naturalEarth" | "mercator" | "equalEarth" | "albersUsa"
  aspectRatio?: number
  legendTitle?: string
  valueFormatter?: (value: number) => string
  noDataColor?: string
  /** Custom GeoJSON/TopoJSON URL. Defaults to world countries. */
  geoUrl?: string
  /** Object name in TopoJSON (e.g., "states", "countries"). Auto-detected if not provided. */
  topojsonObject?: string
  /** Property name to use as feature ID (e.g., "name", "postal", "iso_a2") */
  idProperty?: string
}

// Default world countries GeoJSON URL
const WORLD_GEOJSON_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Country-specific GeoJSON/TopoJSON URLs (all CORS-enabled)
export const GEO_URLS = {
  world: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
  usa: "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
  india:
    "https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/INDIA/INDIA_STATES.geojson",
  china:
    "https://raw.githubusercontent.com/markmarkoh/datamaps/master/src/js/data/chn.topo.json",
  uk: "https://raw.githubusercontent.com/markmarkoh/datamaps/master/src/js/data/gbr.topo.json",
  russia:
    "https://raw.githubusercontent.com/markmarkoh/datamaps/master/src/js/data/rus.topo.json",
  germany:
    "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/master/2_bundeslaender/4_niedrig.geo.json",
  france:
    "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions-version-simplifiee.geojson",
  brazil:
    "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson",
} as const

export function ChoroplethChart({
  data,
  className,
  colorScale = ["#bfdbfe", "#60a5fa", "#1e40af"],
  showTooltip = true,
  showLegend = true,
  projection = "naturalEarth",
  aspectRatio = 2,
  legendTitle = "Value",
  valueFormatter = (v) => v.toLocaleString(),
  noDataColor = "hsl(var(--muted))",
  geoUrl,
  topojsonObject,
  idProperty,
}: ChoroplethChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })
  const [geoData, setGeoData] = React.useState<GeoJSON | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [hoveredFeature, setHoveredFeature] = React.useState<GeoFeature | null>(
    null
  )
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })
  const gradientId = React.useId().replace(/:/g, "")

  // Responsive sizing
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setDimensions({ width, height: width / aspectRatio })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [aspectRatio])

  // Fetch GeoJSON/TopoJSON
  React.useEffect(() => {
    const fetchGeoData = async () => {
      try {
        setLoading(true)
        setError(null)
        const url = geoUrl || WORLD_GEOJSON_URL

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const jsonData = await response.json()

        // Check if it's TopoJSON (has "objects" property) or GeoJSON
        if (jsonData.type === "Topology" && jsonData.objects) {
          // Convert TopoJSON to GeoJSON
          const topoData = jsonData as Topology<{
            [key: string]: GeometryCollection
          }>

          // Use specified object or find first available (case-insensitive)
          const availableKeys = Object.keys(topoData.objects)
          let objectName = topojsonObject || availableKeys[0]

          // Try case-insensitive match if exact match fails
          if (!topoData.objects[objectName]) {
            const lowerName = objectName.toLowerCase()
            const match = availableKeys.find(
              (k) => k.toLowerCase() === lowerName
            )
            if (match) {
              objectName = match
            } else {
              throw new Error(
                `TopoJSON object "${objectName}" not found. Available: ${availableKeys.join(", ")}`
              )
            }
          }

          const geoJson = feature(
            topoData,
            topoData.objects[objectName]
          ) as unknown as GeoJSON

          setGeoData(geoJson)
        } else if (jsonData.type === "FeatureCollection") {
          // Already GeoJSON
          setGeoData(jsonData as GeoJSON)
        } else {
          throw new Error(
            `Invalid geo data format: ${jsonData.type || "unknown"}`
          )
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setError(`Failed to load map: ${message}`)
        console.error("Failed to load GeoJSON:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGeoData()
  }, [geoUrl, topojsonObject])

  const { width, height } = dimensions
  const margin = { top: 10, right: showLegend ? 80 : 20, bottom: 10, left: 10 }
  const innerWidth = Math.max(0, width - margin.left - margin.right)
  const innerHeight = Math.max(0, height - margin.top - margin.bottom)

  // Create data map for quick lookup (support various ID formats)
  const dataMap = React.useMemo(() => {
    const map = new Map<string, ChoroplethDataPoint>()
    data.forEach((d) => {
      map.set(d.id, d) // exact match
      map.set(d.id.toUpperCase(), d)
      map.set(d.id.toLowerCase(), d)
    })
    return map
  }, [data])

  // Calculate value range
  const { minValue, maxValue } = React.useMemo(() => {
    if (data.length === 0) return { minValue: 0, maxValue: 100 }
    const values = data.map((d) => d.value)
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    }
  }, [data])

  // Color scale function
  const getColor = React.useCallback(
    (value: number | undefined) => {
      if (value === undefined) return noDataColor
      const range = maxValue - minValue || 1
      const t = (value - minValue) / range

      if (colorScale.length === 2) {
        return interpolateRgb(colorScale[0], colorScale[1])(t)
      }
      if (t < 0.5) {
        return interpolateRgb(colorScale[0], colorScale[1])(t * 2)
      }
      return interpolateRgb(colorScale[1], colorScale[2])((t - 0.5) * 2)
    },
    [colorScale, minValue, maxValue, noDataColor]
  )

  // Get feature value by matching ID
  const getFeatureValue = React.useCallback(
    (feature: GeoFeature) => {
      // If idProperty is specified, use it first
      if (idProperty && feature.properties[idProperty]) {
        const id = String(feature.properties[idProperty])
        const d =
          dataMap.get(id) ||
          dataMap.get(id.toUpperCase()) ||
          dataMap.get(id.toLowerCase())
        if (d) return d.value
      }

      // Try different ID formats (various GeoJSON schemas)
      const ids = [
        feature.id,
        feature.properties.name,
        feature.properties.NAME,
        feature.properties.nom, // French regions
        feature.properties.STNAME_SH, // India states (official)
        feature.properties.iso_a2,
        feature.properties.iso_a3,
        feature.properties.postal,
        feature.properties.code,
        feature.properties.st_nm, // India states (datamaps)
        feature.properties.sigla, // Brazil states
      ].filter(Boolean) as string[]

      for (const id of ids) {
        const d =
          dataMap.get(id) ||
          dataMap.get(id.toUpperCase()) ||
          dataMap.get(id.toLowerCase())
        if (d) return d.value
      }
      return undefined
    },
    [dataMap, idProperty]
  )

  // Create projection
  const projectionFn = React.useMemo(() => {
    if (innerWidth === 0 || innerHeight === 0 || !geoData) return null

    const projections = {
      naturalEarth: geoNaturalEarth1,
      mercator: geoMercator,
      equalEarth: geoEqualEarth,
      albersUsa: geoAlbersUsa,
    }

    const proj = projections[projection]()

    // AlbersUSA has its own built-in scale, others need fitSize
    if (projection === "albersUsa") {
      // Scale to fit container - AlbersUSA is designed for ~960x600
      const scale = Math.min(innerWidth / 960, innerHeight / 600) * 1100
      return proj.scale(scale).translate([innerWidth / 2, innerHeight / 2])
    }

    return proj.fitSize([innerWidth, innerHeight], geoData as any)
  }, [projection, innerWidth, innerHeight, geoData])

  const pathGenerator = React.useMemo(() => {
    if (!projectionFn) return null
    return geoPath().projection(projectionFn)
  }, [projectionFn])

  // Show loading state (use min-height when width not yet measured)
  if (loading) {
    return (
      <div ref={containerRef} className={cn("w-full", className)}>
        <div
          className="bg-muted/20 flex animate-pulse items-center justify-center rounded-lg"
          style={{ height: width > 0 ? width / aspectRatio : 200 }}
        >
          <span className="text-muted-foreground text-sm">Loading map...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !geoData) {
    return (
      <div ref={containerRef} className={cn("w-full", className)}>
        <div
          className="bg-muted/20 flex items-center justify-center rounded-lg"
          style={{ height: width > 0 ? width / aspectRatio : 200 }}
        >
          <span className="text-muted-foreground text-sm">
            {error || "Failed to load map"}
          </span>
        </div>
      </div>
    )
  }

  // Wait for dimensions to be measured
  if (width === 0 || !pathGenerator) {
    return (
      <div
        ref={containerRef}
        className={cn("min-h-[200px] w-full", className)}
      />
    )
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="flex w-full items-center justify-center">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Map features */}
            {geoData.features.map((feature, index) => {
              const value = getFeatureValue(feature)
              const color = getColor(value)
              const isHovered = hoveredFeature === feature
              const pathD = pathGenerator(feature as any)

              if (!pathD) return null

              return (
                <path
                  key={feature.id || index}
                  d={pathD}
                  fill={color}
                  stroke="hsl(var(--background))"
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  className={cn(
                    "cursor-pointer transition-all duration-150",
                    hoveredFeature !== null && !isHovered && "opacity-70"
                  )}
                  onMouseEnter={(e) => {
                    setHoveredFeature(feature)
                    const rect = containerRef.current?.getBoundingClientRect()
                    if (rect) {
                      setTooltipPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      })
                    }
                  }}
                  onMouseMove={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect()
                    if (rect) {
                      setTooltipPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      })
                    }
                  }}
                  onMouseLeave={() => setHoveredFeature(null)}
                />
              )
            })}
          </g>

          {/* Color legend */}
          {showLegend && (
            <g
              transform={`translate(${width - margin.right + 15}, ${margin.top + 20})`}
            >
              <text
                className="fill-muted-foreground text-[10px] font-medium"
                y={-8}
              >
                {legendTitle}
              </text>
              <defs>
                <linearGradient
                  id={`gradient-${gradientId}`}
                  x1="0"
                  y1="1"
                  x2="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor={colorScale[0]} />
                  {colorScale.length === 3 && (
                    <stop offset="50%" stopColor={colorScale[1]} />
                  )}
                  <stop
                    offset="100%"
                    stopColor={colorScale[colorScale.length - 1]}
                  />
                </linearGradient>
              </defs>
              <rect
                width={15}
                height={Math.max(0, innerHeight - 40)}
                fill={`url(#gradient-${gradientId})`}
                rx={2}
              />
              <text
                x={20}
                y={0}
                dominantBaseline="hanging"
                className="fill-muted-foreground text-[10px]"
              >
                {valueFormatter(maxValue)}
              </text>
              <text
                x={20}
                y={Math.max(0, innerHeight - 40)}
                dominantBaseline="auto"
                className="fill-muted-foreground text-[10px]"
              >
                {valueFormatter(minValue)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {showTooltip &&
        hoveredFeature &&
        (() => {
          const value = getFeatureValue(hoveredFeature)
          const tooltipWidth = 160
          const tooltipHeight = 60
          const padding = 10

          const showOnLeft = tooltipPos.x + tooltipWidth + padding > width
          const showBelow = tooltipPos.y - tooltipHeight - padding < 0

          return (
            <div
              className="pointer-events-none absolute z-50"
              style={{
                left: showOnLeft
                  ? tooltipPos.x - padding
                  : tooltipPos.x + padding,
                top: showBelow
                  ? tooltipPos.y + padding
                  : tooltipPos.y - padding,
                transform: `translate(${showOnLeft ? "-100%" : "0"}, ${showBelow ? "0" : "-100%"})`,
              }}
            >
              <div className="bg-background rounded-lg border px-3 py-2 shadow-lg">
                <p className="text-foreground text-sm font-medium">
                  {String(
                    hoveredFeature.properties.name ||
                      hoveredFeature.properties.NAME ||
                      hoveredFeature.properties.nom ||
                      hoveredFeature.properties.STNAME_SH ||
                      hoveredFeature.id ||
                      "Unknown"
                  )}
                </p>
                <p className="text-muted-foreground text-sm">
                  {value !== undefined ? (
                    <>
                      {legendTitle}: {valueFormatter(value)}
                    </>
                  ) : (
                    "No data"
                  )}
                </p>
              </div>
            </div>
          )
        })()}
    </div>
  )
}
