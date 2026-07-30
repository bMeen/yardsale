import type { ReactNode } from "react";

function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-1 scrollbar-none flex-col overflow-y-auto pb-20 ${className}`}
    >
      {children}
    </div>
  );
}

export default PageContainer;
