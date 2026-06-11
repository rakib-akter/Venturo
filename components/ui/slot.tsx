import * as React from "react";

/**
 * Minimal `asChild` slot: merges the component's props (including className and
 * ref) onto its single React element child. A dependency-free stand-in for
 * @radix-ui/react-slot, sufficient for our Button/links use cases.
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

    return React.cloneElement(child, {
      ...slotProps,
      ...childProps,
      className: [className, childProps.className as string]
        .filter(Boolean)
        .join(" "),
      ref: mergeRefs(ref, (child as unknown as { ref?: React.Ref<HTMLElement> }).ref),
    } as Record<string, unknown>);
  },
);
Slot.displayName = "Slot";

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T>).current = node;
      }
    }
  };
}
