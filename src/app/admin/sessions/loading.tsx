export default function SessionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-8 w-32 bg-muted rounded-lg" />
        <div className="h-10 w-36 bg-muted rounded-lg" />
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 h-28" />
        ))}
      </div>
    </div>
  )
}
