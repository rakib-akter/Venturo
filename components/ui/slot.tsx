import * as React from "react";

/**
 * Minimal `asChild` slot: merges the component's props (including className and
 * ref) onto its single React element child. A dependency-free stand-in for
 * @radix-ui/react-slot, sufficient for our Button/links use cases.
 *
 * Importantly, a `ref` is only attached when one actually exists — injecting a
 * function ref unconditionally breaks when a Server Component renders an
 * `asChild` wrapper around a Client Component (e.g. <Button asChild><Link/>).
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, className, ...slotProps }, ref) => {
    if (!React.isValidElement(children)) {
      return null;
    }
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;
    const childRef = (child as unknown as { ref?: React.Ref<HTMLElement> }).ref;

    const merged: Record<string, unknown> = {
      ...slotProps,
      ...childProps,
      className: [className, childProps.className as string]
        .filter(Boolean)
        .join(" "),
    };

    const mergedRef = mergeRefs(ref, childRef);
    if (mergedRef) merged.ref = mergedRef;

    return React.cloneElement(child, merged);
  },
);
Slot.displayName = "Slot";

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> | undefined {
  const present = refs.filter(
    (r): r is React.Ref<T> => r !== null && r !== undefined,
  );
  if (present.length === 0) return undefined;
  return (node: T) => {
    for (const ref of present) {
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T>).current = node;
    }
  };
}
