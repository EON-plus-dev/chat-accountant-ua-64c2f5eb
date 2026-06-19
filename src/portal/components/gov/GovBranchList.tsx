import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GovBranchCard } from './GovBranchCard';
import { useGovBranches } from '@/portal/hooks/useGovBranches';

interface GovBranchListProps {
  agency?: string;
  city?: string;
  search?: string;
  onReset?: () => void;
}

export function GovBranchList({ agency, city, search, onReset }: GovBranchListProps) {
  const { data: branches = [], isLoading } = useGovBranches({
    agencySlug: agency || undefined,
    city: city || undefined,
    search: search || undefined,
  });

  const hasFilters = !!agency || !!city || !!search;

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Нічого не знайдено. Спробуйте змінити фільтри.</p>
        {hasFilters && onReset && (
          <Button variant="outline" size="sm" onClick={onReset}>Скинути фільтри</Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {branches.map((b) => (
        <GovBranchCard key={b.id} branch={b} />
      ))}
      <p className="text-xs text-muted-foreground text-center tabular-nums pt-2">
        {branches.length} відділень
      </p>
    </div>
  );
}
