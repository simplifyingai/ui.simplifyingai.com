import Image from "next/image"
import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { source } from "@/lib/source"
import { CommandMenu } from "@/components/command-menu"
import { GitHubLink } from "@/components/github-link"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { ModeSwitcher } from "@/components/mode-switcher"
import blocks from "@/registry/__blocks__.json"
import { Separator } from "@/registry/simplifying-ai/ui/separator"

export function SiteHeader() {
  const pageTree = source.pageTree

  return (
    <header className="bg-background sticky top-0 z-50 w-full">
      <div className="container-wrapper 3xl:fixed:px-0 px-6">
        <div className="3xl:fixed:container flex h-(--header-height) items-center gap-2 **:data-[slot=separator]:!h-4">
          <MobileNav
            tree={pageTree}
            items={siteConfig.navItems}
            className="flex lg:hidden"
          />
          <Link href="/" className="hidden items-center gap-2 lg:flex">
            <Image
              src="/simplifyingai.png"
              alt={siteConfig.name}
              width={32}
              height={32}
              className="size-6"
            />
            <span className="font-medium">Simplify Charts</span>
          </Link>
          <MainNav items={siteConfig.navItems} className="hidden lg:flex" />
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu
                tree={pageTree}
                navItems={siteConfig.navItems}
                blocks={blocks}
              />
            </div>
            <Separator
              orientation="vertical"
              className="ml-2 hidden lg:block"
            />
            <GitHubLink />

            <ModeSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
