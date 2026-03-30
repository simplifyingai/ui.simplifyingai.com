export function CardsDemo() {
  return (
    <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="bg-card text-card-foreground flex h-48 items-center justify-center rounded-xl border shadow">
        <p className="text-muted-foreground">Chart Components</p>
      </div>
      <div className="bg-card text-card-foreground flex h-48 items-center justify-center rounded-xl border shadow">
        <p className="text-muted-foreground">Coming Soon</p>
      </div>
      <div className="bg-card text-card-foreground flex h-48 items-center justify-center rounded-xl border shadow">
        <p className="text-muted-foreground">40+ Chart Types</p>
      </div>
    </div>
  )
}
