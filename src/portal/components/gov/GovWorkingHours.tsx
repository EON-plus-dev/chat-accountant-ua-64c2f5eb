import { parseWorkingHours, getCurrentStatus, type WorkingHoursJson } from '@/portal/utils/workingHours';
import type { Json } from '@/integrations/supabase/types';
import { Clock } from 'lucide-react';

interface Props {
  workingHours: Json | null;
  isOpen24h: boolean;
  compact?: boolean;
}

export function GovWorkingHours({ workingHours, isOpen24h, compact }: Props) {
  const hours = parseWorkingHours(workingHours);
  const status = getCurrentStatus(hours, isOpen24h);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${status.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <span className={`text-xs font-medium ${status.isOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
          {status.label}
        </span>
      </div>
    );
  }

  const rows: { day: string; time: string | null }[] = [
    { day: 'Пн–Пт', time: hours.weekdays || null },
    { day: 'Субота', time: hours.saturday || null },
    { day: 'Неділя', time: hours.sunday || null },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${status.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <span className={`text-sm font-semibold ${status.isOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
          {status.label}
        </span>
      </div>
      <div className="space-y-1 pl-1">
        {isOpen24h ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Цілодобово, без вихідних
          </p>
        ) : (
          rows.map((r) => (
            <div key={r.day} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-muted-foreground">{r.day}</span>
              <span className={r.time ? 'text-foreground' : 'text-muted-foreground'}>
                {r.time || 'Вихідний'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
