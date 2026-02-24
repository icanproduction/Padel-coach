export default function ProgressLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="h-72 bg-muted rounded-lg" />
      </div>
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  )
}
