import { ReactNode } from "react";
import { PortalHeader } from "./PortalHeader";
import { BreakingTicker } from "@/portal/sections/breaking-ticker/BreakingTicker";
import { PortalFooter } from "@/portal/components/PortalFooter";
import { PortalMeta } from "@/portal/seo/PortalMeta";
import { BackToTop } from "@/portal/components/BackToTop";
import { FloatingChatButton } from "@/components/landing/FloatingChatButton";


interface PortalLayoutProps {
  children: ReactNode;
  showTicker?: boolean;
  meta: {
    title: string;
    description: string;
    canonical: string;
    ogImage?: string;
    type?: 'website' | 'article' | 'video.other';
    publishedAt?: string;
    updatedAt?: string;
    authorName?: string;
  };
}

export const PortalLayout = ({ children, meta, showTicker = false }: PortalLayoutProps) => {
  return (
      <div className="min-h-screen bg-background">
        <PortalMeta {...meta} />
        <PortalHeader />
        {showTicker && <BreakingTicker />}
        <main>{children}</main>
        <PortalFooter />
        <BackToTop />
        <FloatingChatButton />
      </div>
  );
};
