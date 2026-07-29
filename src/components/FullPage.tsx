import type { ReactNode } from "react";

function FullPage({ children }: { children: ReactNode }) {
  return <div className="grid min-h-screen place-items-center">{children}</div>;
}

export default FullPage;
