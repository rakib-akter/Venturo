"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A photographic frame for cards and heroes: shows a real photo when one is
 * available, fading it in over the brand gradient, and gracefully keeps the
 * gradient if the image is missing or fails to load. Overlay content (badges,
 * titles, buttons) renders on top via children.
 */
export function PhotoFrame({
  imageUrl,
  gradient,
  alt,
  className,
  rounded,
  overlay = true,
  priority = false,
  children,
}: {
  imageUrl?: string;
  /** Tailwind `from-… to-…` gradient classes used as the fallback. */
  gradient?: string;
  alt: string;
  className?: string;
  rounded?: string;
  /** Darken the bottom for legible overlay text. */
  overlay?: boolean;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        gradient ?? "from-slate-300 to-slate-400",
        rounded,
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}

      {overlay && showImage ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      ) : null}

      {children}
    </div>
  );
}
