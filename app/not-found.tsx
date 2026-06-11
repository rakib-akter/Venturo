import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Compass className="size-8" />
      </span>
      <h1 className="font-display text-3xl font-semibold">Off the map</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t find that page. Let&apos;s get you back on route.
      </p>
      <div className="mt-2 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/plan">Plan a trip</Link>
        </Button>
      </div>
    </div>
  );
}
