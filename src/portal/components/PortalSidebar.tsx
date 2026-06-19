import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const PortalSidebar = ({ children }: Props) => (
  <aside className="space-y-4">{children}</aside>
);
