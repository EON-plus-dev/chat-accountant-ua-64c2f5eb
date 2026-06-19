import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ComparisonTableData } from "@/portal/types/hub";

interface Props {
  data: ComparisonTableData;
}

export const ComparisonTableSection = ({ data }: Props) => (
  <div className="overflow-x-auto rounded-lg border border-border">
    <Table>
      <TableHeader>
        <TableRow>
          {data.headers.map((h, i) => (
            <TableHead key={i} className={i === 0 ? "min-w-[120px]" : "text-xs"}>
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.rows.map((row, i) => (
          <TableRow key={i} className={i % 2 === 0 ? "bg-muted/20" : ""}>
            <TableCell className="font-medium text-foreground text-xs">{row.label}</TableCell>
            {row.values.map((v, j) => (
              <TableCell key={j} className="text-xs text-muted-foreground font-mono">{v}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
