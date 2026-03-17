export function PageLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-lg" />
      <div className="h-4 w-64 bg-muted/60 rounded" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted/60 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
