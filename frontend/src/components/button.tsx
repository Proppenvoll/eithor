import { useMemo, type ComponentProps } from "react";

export default function Button({
  children,
  ...buttonProps
}: ComponentProps<"button">) {
  const className = useMemo(() => {
    const defaultClasses =
      "p-4 bg-gray-300 rounded-full w-full text-gray-900 font-bold cursor-pointer hover:bg-gray-200 border-y-2 border-t-gray-300 hover:border-t-gray-200 border-b-gray-400 active:border-b-gray-200 active:border-t-gray-700";

    return buttonProps.className
      ? `${defaultClasses} ${buttonProps.className}`
      : defaultClasses;
  }, [buttonProps.className]);

  return (
    <button type="button" {...buttonProps} className={className}>
      {children}
    </button>
  );
}
