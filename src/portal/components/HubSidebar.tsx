import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const HubSidebar = ({ children }: Props) => (
  <div className="space-y-5">{children}</div>
);
