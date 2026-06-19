import { useState, useMemo } from "react";
import { Search, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface EvidenceSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  driverText: string;
  evidence: string[];
}

const PAGE_SIZE = 10;

export const EvidenceSheet = ({ open, onOpenChange, driverText, evidence }: EvidenceSheetProps) => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return evidence;
    const q = search.toLowerCase();
    return evidence.filter((e) => e.toLowerCase().includes(q));
  }, [evidence, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(0);
  };

  const content = (
    <div className="space-y-3 px-4 pb-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Пошук в evidence…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
        {search && (
          <button onClick={() => handleSearchChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} з {evidence.length} записів
      </p>

      <div className="space-y-1.5">
        {paged.map((e, i) => (
          <div key={`${page}-${i}`} className="flex items-start gap-2 p-2.5 rounded-md bg-muted/50 text-sm">
            <FileText className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
            <span>{e}</span>
          </div>
        ))}
        {paged.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Нічого не знайдено</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page === 0} onClick={() => setPage(page - 1)}>
            ← Назад
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Далі →
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-sm">Evidence</DrawerTitle>
            <DrawerDescription className="text-xs truncate">{driverText}</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Evidence</DialogTitle>
          <DialogDescription className="text-xs truncate">{driverText}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
