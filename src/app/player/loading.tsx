export default function PlayerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  )
}
