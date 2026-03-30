"use client"

import { Dendrogram } from "@/registry/simplifying-ai/ui/charts/specialized/dendrogram"

const taxonomyData = {
  name: "Life",
  children: [
    {
      name: "Animals",
      children: [
        {
          name: "Mammals",
          children: [
            { name: "Dog", value: 85 },
            { name: "Cat", value: 72 },
            { name: "Whale", value: 95 },
          ],
        },
        {
          name: "Birds",
          children: [
            { name: "Eagle", value: 68 },
            { name: "Penguin", value: 62 },
          ],
        },
      ],
    },
    {
      name: "Plants",
      children: [
        {
          name: "Trees",
          children: [
            { name: "Oak", value: 120 },
            { name: "Pine", value: 95 },
          ],
        },
        {
          name: "Flowers",
          children: [
            { name: "Rose", value: 45 },
            { name: "Tulip", value: 38 },
          ],
        },
      ],
    },
  ],
}

export default function DendrogramDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Dendrogram
        data={taxonomyData}
        orientation="horizontal"
        showLabels
        showValues
      />
    </div>
  )
}
