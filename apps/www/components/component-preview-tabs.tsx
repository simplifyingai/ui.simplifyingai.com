"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export function ComponentPreviewTabs({
  className,
  align = "center",
  hideCode = false,
  component,
  source,
  marginOff = false,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "center" | "start" | "end"
  hideCode?: boolean
  component: React.ReactNode
  source: React.ReactNode
  marginOff?: boolean
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")

  return (
    <div
      className={cn(
        "group relative mt-4 mb-12 flex w-full flex-col not-prose",
        className
      )}
      {...props}
    >
      {/* Outer container - theme aware */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted">
        {/* Tab header - inside the container */}
        {!hideCode && (
          <div className="flex items-center gap-2 px-5 pt-2">
            <button
              onClick={() => setTab("preview")}
              className={cn(
                "relative px-1 pb-2 text-base font-medium transition-colors",
                tab === "preview"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Preview
              {tab === "preview" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
              )}
            </button>
            <button
              onClick={() => setTab("code")}
              className={cn(
                "relative px-1 pb-2 text-base font-medium transition-colors",
                tab === "code"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Code
              {tab === "code" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
              )}
            </button>
          </div>
        )}

        {/* Content area */}
        <div className="relative">
          {/* Preview panel */}
          <div
            data-slot="preview"
            className={cn(
              "transition-opacity duration-200",
              tab === "preview" ? "opacity-100" : "opacity-0 absolute inset-x-3 top-0 pointer-events-none"
            )}
          >
            {/* Inner preview container - theme aware */}
            <div
              data-align={align}
              className={cn(
                "flex min-h-[450px] w-full justify-center rounded-xl border border-border/50 bg-background",
                align === "center" && "items-center",
                align === "start" && "items-start pt-2",
                align === "end" && "items-end pb-2",
                marginOff ? "p-0" : "p-2"
              )}
            >
              {component}
            </div>
          </div>

          {/* Code panel */}
          <div
            data-slot="code"
            className={cn(
              "transition-opacity duration-200",
              tab === "code" ? "opacity-100" : "opacity-0 absolute inset-x-3 top-0 pointer-events-none"
            )}
          >
            <div className="overflow-hidden rounded-xl **:[figure]:!m-0 **:[pre]:min-h-[450px] **:[pre]:max-h-[550px] **:[pre]:overflow-auto **:[pre]:rounded-xl">
              {source}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
