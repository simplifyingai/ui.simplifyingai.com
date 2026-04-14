import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"
import { Button } from "@/registry/simplifying-ai/ui/button"

export function DocsSidebarCta({ className }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group bg-surface text-surface-foreground relative flex flex-col gap-2 overflow-hidden rounded-lg p-6 text-sm",
        className
      )}
    >
      <div className="bg-surface/80 absolute inset-0" />

      <div className="relative z-10 text-base leading-tight font-semibold text-balance group-hover:underline">
        Ask Your Database Anything with ChatPlotDB
      </div>
      <div className="text-muted-foreground relative z-10">
        Connect your database, ask questions in plain English, and get answers
        as charts, tables, and dashboards. No SQL required.
      </div>
      <Button size="sm" className="relative z-10 mt-2 w-fit">
        Join the Waitlist
      </Button>
      <Link
        href={siteConfig.utm.chatplotdb}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 z-20"
      >
        <span className="sr-only">Join the ChatPlotDB waitlist</span>
      </Link>
    </div>
  )
}
