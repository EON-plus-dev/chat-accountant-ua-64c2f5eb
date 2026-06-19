import { Button } from "@/components/ui/button";

export type AudienceFilter = 'business' | 'personal' | 'accountant' | 'all';

interface Props {
  value: AudienceFilter;
  onChange: (v: AudienceFilter) => void;
}

const OPTIONS: { value: AudienceFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'business', label: '🏢 Для бізнесу' },
  { value: 'personal', label: '👤 Для фізосіб' },
  { value: 'accountant', label: '📒 Для бухгалтерів' },
];

export const AudienceToggle = ({ value, onChange }: Props) => (
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
      {OPTIONS.map((o) => (
        <Button
          key={o.value}
          variant={value === o.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange(o.value)}
          className="text-sm"
        >
          {o.label}
        </Button>
      ))}
    </div>
  </div>
);
