"use client";

import * as React from "react";

/**
 * Returns `true` only after the first client mount. Used to gate rendering of
 * browser-only state (localStorage-backed trips, etc.) so server and client
 * markup match on the first pass and avoid hydration mismatches.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time post-mount flag
    setMounted(true);
  }, []);
  return mounted;
}
