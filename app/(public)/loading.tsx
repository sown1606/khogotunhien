export default function PublicLoading() {
  return (
    <div className="space-y-8 py-2">
      <div className="h-56 animate-pulse rounded-3xl bg-stone-200/80" />
      <div className="h-20 animate-pulse rounded-2xl bg-stone-200/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3">
            <div className="aspect-[5/4] animate-pulse rounded-xl bg-stone-200/80" />
            <div className="h-4 animate-pulse rounded bg-stone-200/70" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-stone-200/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
