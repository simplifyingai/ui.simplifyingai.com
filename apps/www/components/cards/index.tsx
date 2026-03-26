export function CardsDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
      <div className="flex items-center justify-center h-48 rounded-xl border bg-card text-card-foreground shadow">
        <p className="text-muted-foreground">Chart Components</p>
      </div>
      <div className="flex items-center justify-center h-48 rounded-xl border bg-card text-card-foreground shadow">
        <p className="text-muted-foreground">Coming Soon</p>
      </div>
      <div className="flex items-center justify-center h-48 rounded-xl border bg-card text-card-foreground shadow">
        <p className="text-muted-foreground">40+ Chart Types</p>
      </div>
    </div>
  )
}
