import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-8">
      <Skeleton className="mx-auto h-7 w-full max-w-md" />
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
