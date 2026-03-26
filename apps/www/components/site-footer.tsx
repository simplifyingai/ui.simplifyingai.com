import Link from "next/link"

import { siteConfig } from "@/lib/config"

export function SiteFooter() {
  return (
    <footer className="group-has-[.section-soft]/body:bg-surface/40 3xl:fixed:bg-transparent group-has-[.docs-nav]/body:pb-20 group-has-[.docs-nav]/body:sm:pb-0 dark:bg-transparent">
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-(--footer-height) flex-col items-center justify-center gap-2 py-4">
          <div className="text-muted-foreground w-full px-1 text-center text-xs leading-loose sm:text-sm">
            <strong>Simplify Charts</strong> is free and open source by{" "}
            <Link
              href={siteConfig.utm.main}
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Simplifying AI
            </Link>
            . Source on{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </div>
          <div className="text-muted-foreground/70 text-center text-xs">
            Want AI-powered data analysis?{" "}
            <Link
              href={siteConfig.utm.platform}
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              Try Simplify Platform
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
