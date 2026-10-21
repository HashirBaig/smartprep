import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type PropsWithChildren = {
  children: ReactNode;
  classnames?: string;
};

function Wrapper({ children, classnames }: PropsWithChildren) {
  return (
    <div className={cn("w-full px-4 py-5 relative text-green-50", classnames)}>
      {children}
    </div>
  );
}

export default Wrapper;
