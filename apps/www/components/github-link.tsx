import { Suspense } from "react"
import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { Icons } from "@/components/icons"
import { Button } from "@/registry/simplifying-ai/ui/button"
import { Skeleton } from "@/registry/simplifying-ai/ui/skeleton"

export function GitHubLink() {
  return (
    <Button asChild size="sm" variant="ghost" className="h-8 shadow-none">
      <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
        <Icons.gitHub />
        <Suspense fallback={<Skeleton className="h-4 w-8" />}>
          <StarsCount />
        </Suspense>
      </Link>
    </Button>
  )
}

export async function StarsCount() {
  try {
    const data = await fetch(
      "https://api.github.com/repos/simplifyingai/ui.simplifyingai.com",
      {
        next: { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
      }
    )
    const json = await data.json()
    const count = json.stargazers_count ?? 0

    return (
      <span className="text-muted-foreground w-8 text-xs tabular-nums">
        {count >= 1000
          ? `${(count / 1000).toFixed(1)}k`
          : count.toLocaleString()}
      </span>
    )
  } catch {
    return (
      <span className="text-muted-foreground w-8 text-xs tabular-nums">-</span>
    )
  }
}
