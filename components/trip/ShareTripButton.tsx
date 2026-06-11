"use client";

import * as React from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Copies (or shares, where supported) a link to the current trip. */
export function ShareTripButton({ title }: { title: string }) {
  const [copied, setCopied] = React.useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user cancelled or clipboard unavailable */
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={share}>
      {copied ? (
        <>
          <Check className="size-4" /> Link copied
        </>
      ) : (
        <>
          <Share2 className="size-4" /> Share
        </>
      )}
    </Button>
  );
}
