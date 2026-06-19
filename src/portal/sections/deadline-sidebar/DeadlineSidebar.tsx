import { useState } from "react";
import { DeadlineCard } from "@/portal/components/DeadlineCard";
import { PortalSidebar } from "@/portal/components/PortalSidebar";
import { DEADLINES } from "@/portal/data/deadlines";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const FILTER_OPTIONS = [
  { value: "all", label: "Всі" },
  { value: "fop1", label: "ФОП 1" },
  { value: "fop2", label: "ФОП 2" },
  { value: "fop3", label: "ФОП 3" },
  { value: "tov", label: "ТОВ" },
];

export const DeadlineSidebar = () => {
  const [filter, setFilter] = useState("all");

  const filtered = DEADLINES.filter((d) => filter === "all" || d.taxType === filter || d.taxType === "all");

  return (
    <PortalSidebar>
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        📅 Найближчі дедлайни
      </h3>

      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {FILTER_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filtered.map((d) => (
        <DeadlineCard key={d.id} deadline={d} />
      ))}

      <Link to="/tools" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" /> Відкрити повний календар →
      </Link>

      <Button variant="outline" size="sm" className="w-full">
        <ExternalLink className="h-3.5 w-3.5" /> Додати у Google Calendar
      </Button>
    </PortalSidebar>
  );
};
