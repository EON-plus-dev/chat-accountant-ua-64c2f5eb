import { ReactNode } from "react";
import { EntrySiblingsSidebar, SiblingItem } from "./EntrySiblingsSidebar";

interface Props {
  items: SiblingItem[];
  currentSlug: string;
  basePath: string;
  title: string;
  backHref: string;
  backLabel?: string;
  children: ReactNode;
}

export const EntryWithSiblingsLayout = ({
  items,
  currentSlug,
  basePath,
  title,
  backHref,
  backLabel,
  children,
}: Props) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
    <EntrySiblingsSidebar
      items={items}
      currentSlug={currentSlug}
      basePath={basePath}
      title={title}
      backHref={backHref}
      backLabel={backLabel}
    />
    <div className="flex-1 min-w-0 lg:max-w-4xl">{children}</div>
  </div>
);
