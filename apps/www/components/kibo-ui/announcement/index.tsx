import type { ComponentProps, HTMLAttributes } from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/registry/simplifying-ai/ui/badge"

export type AnnouncementProps = ComponentProps<typeof Badge> & {
  themed?: boolean
}

export const Announcement = ({
  variant = "outline",
  themed = false,
  className,
  ...props
}: AnnouncementProps) => (
  <Badge
    className={cn(
      "group inline-flex max-w-full flex-row items-center gap-0 rounded-full border-transparent py-1 pl-1 pr-4 font-medium transition-all",
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      "dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800",
      themed && "announcement-themed",
      className
    )}
    variant={variant}
    {...props}
  />
)

export type AnnouncementTagProps = HTMLAttributes<HTMLDivElement>

export const AnnouncementTag = ({
  className,
  ...props
}: AnnouncementTagProps) => (
  <div
    className={cn(
      "shrink-0 rounded-full px-3 py-1 text-xs",
      "bg-gray-200 text-muted-foreground",
      "dark:bg-neutral-700 dark:text-white",
      className
    )}
    {...props}
  />
)

export type AnnouncementTitleProps = HTMLAttributes<HTMLDivElement>

export const AnnouncementTitle = ({
  className,
  ...props
}: AnnouncementTitleProps) => (
  <div
    className={cn("inline-flex items-center gap-1.5 whitespace-nowrap pl-3 text-sm", className)}
    {...props}
  />
)
