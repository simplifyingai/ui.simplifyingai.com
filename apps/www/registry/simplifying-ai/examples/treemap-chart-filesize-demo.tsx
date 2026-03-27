"use client"

import { TreemapChart } from "@/registry/simplifying-ai/ui/charts"

// Disk usage by folder
const data = {
  name: "Disk",
  children: [
    {
      name: "Applications",
      children: [
        { name: "Xcode", value: 45, color: "#1e40af" },
        { name: "Chrome", value: 12, color: "#2563eb" },
        { name: "Slack", value: 8, color: "#3b82f6" },
        { name: "VS Code", value: 6, color: "#60a5fa" },
        { name: "Spotify", value: 4, color: "#93c5fd" },
      ],
    },
    {
      name: "Documents",
      children: [
        { name: "Projects", value: 25, color: "#1e40af" },
        { name: "Archives", value: 18, color: "#2563eb" },
        { name: "Downloads", value: 15, color: "#3b82f6" },
        { name: "Screenshots", value: 5, color: "#60a5fa" },
      ],
    },
    {
      name: "Media",
      children: [
        { name: "Videos", value: 85, color: "#1e40af" },
        { name: "Photos", value: 55, color: "#2563eb" },
        { name: "Music", value: 30, color: "#3b82f6" },
      ],
    },
    {
      name: "System",
      children: [
        { name: "Cache", value: 12, color: "#1e40af" },
        { name: "Logs", value: 5, color: "#2563eb" },
        { name: "Other", value: 8, color: "#3b82f6" },
      ],
    },
  ],
}

export default function TreemapChartFilesizeDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <TreemapChart
        data={data}
        width={420}
        height={350}
        showLabels
        labelMinSize={28}
        tile="binary"
      />
    </div>
  )
}
