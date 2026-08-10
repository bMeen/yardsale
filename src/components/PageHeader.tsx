import type { ReactNode } from "react";

function PageHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-background/95 border-border sticky top-0 z-20 border-b px-2 py-4 backdrop-blur-sm md:px-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default PageHeader;
