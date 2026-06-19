import { Link } from 'react-router-dom';
import { MapPin, Phone, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GovWorkingHours } from './GovWorkingHours';
import type { GovBranch } from '@/portal/hooks/useGovBranches';

const AGENCY_LABELS: Record<string, { emoji: string; name: string }> = {
  dps: { emoji: '🏛', name: 'ДПС' },
  pfu: { emoji: '🏥', name: 'ПФУ' },
  cnap: { emoji: '📋', name: 'ЦНАП' },
  dracs: { emoji: '📝', name: 'ДРАЦС' },
  court: { emoji: '⚖️', name: 'Суд' },
};

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' }> = {
  active: { label: 'Працює', variant: 'default' },
  temporarily_closed: { label: 'Тимчасово зачинено', variant: 'destructive' },
  destroyed: { label: 'Зруйновано', variant: 'destructive' },
};

interface Props {
  branch: GovBranch;
}

export function GovBranchCard({ branch }: Props) {
  const agency = AGENCY_LABELS[branch.agency_slug] || { emoji: '🏢', name: branch.agency_slug };
  const statusInfo = STATUS_LABELS[branch.status] || STATUS_LABELS.active;

  return (
    <Card className="p-3 hover:border-primary/40 transition-all">
      <Link to={`/dovidnyky/ustanovy/gov/branch/${branch.id}`} className="block">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
            {agency.emoji}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground text-sm truncate">{branch.name}</p>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" size="sm">{agency.emoji} {agency.name}</Badge>
              {branch.status !== 'active' && (
                <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>
              )}
              {branch.has_queue_system && <Badge variant="outline" size="sm">🎫 Е-черга</Badge>}
              {branch.has_accessibility && <Badge variant="outline" size="sm">♿ Доступність</Badge>}
            </div>

            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{branch.address}, {branch.city}</p>
            </div>

            <GovWorkingHours workingHours={branch.working_hours} isOpen24h={branch.is_open_24h} compact />

            {branch.phones && branch.phones.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{branch.phones[0]}</span>
              </div>
            )}

            {branch.war_note && (
              <p className="text-xs text-destructive">⚠️ {branch.war_note}</p>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
