import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

export const SidebarProductCard = () => (
  <Card className="border-primary/30 bg-primary/[0.03]">
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Автоматизуйте те що щойно читали</p>
      </div>
      <p className="text-xs text-muted-foreground">FINTODO веде облік замість вас</p>
      <Button size="sm" asChild className="w-full">
        <Link to={CTA_CHECKOUT_URL}>14 днів безкоштовно</Link>
      </Button>
    </CardContent>
  </Card>
);
