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
      className={`bg-background/95 border-border sticky top-0 z-20 border-b backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default PageHeader;
