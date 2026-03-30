import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import {
  Announcement as AnnouncementBase,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/kibo-ui/announcement"

export function Announcement() {
  return (
    <AnnouncementBase asChild>
      <Link href="/docs/components" className="inline-flex items-center">
        <AnnouncementTag>Introducing</AnnouncementTag>
        <AnnouncementTitle>
          40+ Chart Components <ArrowRightIcon className="size-3.5" />
        </AnnouncementTitle>
      </Link>
    </AnnouncementBase>
  )
}
