import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { InfoBannerData } from "@/portal/types/hub";

interface Props {
  data: InfoBannerData;
}

export const InfoBannerSection = ({ data }: Props) => (
  <Card className="border-primary/20 bg-primary/5">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">{data.text}</p>
        <p className="text-xs text-muted-foreground">{data.subtext}</p>
      </div>
      <Link to={data.link} className="text-xs text-primary hover:underline shrink-0">
        {data.linkLabel}
      </Link>
    </CardContent>
  </Card>
);
