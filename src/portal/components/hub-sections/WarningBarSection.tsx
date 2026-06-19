import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import type { WarningBarData } from "@/portal/types/hub";

interface Props {
  data: WarningBarData;
}

export const WarningBarSection = ({ data }: Props) => (
  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg">
    <div className="px-4 py-3 flex items-center gap-3">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <p className="text-sm text-amber-800 dark:text-amber-300">
        ⚡ {data.text}{' '}
        <Link to={data.linkHref} className="font-medium underline">{data.linkText}</Link>
      </p>
    </div>
  </div>
);
