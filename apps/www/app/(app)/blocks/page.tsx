import { BlockDisplay } from "@/components/block-display"

export const dynamic = "force-static"
export const revalidate = false

const FEATURED_BLOCKS: string[] = []

export default async function BlocksPage() {
  if (FEATURED_BLOCKS.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Blocks Coming Soon</h1>
        <p className="text-muted-foreground">
          Check out our chart components in the{" "}
          <a href="/docs/components" className="text-primary underline">
            documentation
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12 md:gap-24">
      {FEATURED_BLOCKS.map((name) => (
        <BlockDisplay name={name} key={name} />
      ))}
    </div>
  )
}
