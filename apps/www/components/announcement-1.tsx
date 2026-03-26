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
      <Link href="/blocks#pong-01">
        <AnnouncementTag>New Example</AnnouncementTag>
        <AnnouncementTitle>
          Pong game with Matrix display <ArrowRightIcon className="size-3" />
        </AnnouncementTitle>
      </Link>
    </AnnouncementBase>
  )
}
