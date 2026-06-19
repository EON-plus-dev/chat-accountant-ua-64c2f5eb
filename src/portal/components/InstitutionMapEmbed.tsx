import { MapPin, ExternalLink } from 'lucide-react';
import type { InstitutionBranch } from '@/portal/data/institutionProfiles';

interface Props {
  branch: InstitutionBranch;
  institutionName: string;
}

function getCurrentStatus(hours: InstitutionBranch['workingHours'], is24h: boolean): {
  isOpen: boolean;
  label: string;
  todaySchedule: string;
} {
  if (is24h) return { isOpen: true, label: 'Відкрито цілодобово', todaySchedule: '24/7' };

  const day = new Date().getDay(); // 0=Sun
  let schedule: string | undefined;

  if (day === 0) schedule = hours.sunday;
  else if (day === 6) schedule = hours.saturday;
  else schedule = hours.weekdays;

  if (!schedule) {
    const dayNames = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];
    return {
      isOpen: false,
      label: `${dayNames[day]} — вихідний`,
      todaySchedule: 'Вихідний',
    };
  }

  const match = schedule.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!match) return { isOpen: true, label: schedule, todaySchedule: schedule };

  const [, oh, om, ch, cm] = match.map(Number);
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  const isOpen = currentMins >= openMins && currentMins < closeMins;

  const closeStr = `${String(ch).padStart(2, '0')}:${String(cm).padStart(2, '0')}`;
  const openStr = `${String(oh).padStart(2, '0')}:${String(om).padStart(2, '0')}`;

  return {
    isOpen,
    label: isOpen ? `Відкрито до ${closeStr}` : `Зачинено · відкриється о ${openStr}`,
    todaySchedule: schedule,
  };
}

export function InstitutionMapEmbed({ branch, institutionName }: Props) {
  const status = getCurrentStatus(branch.workingHours, branch.isOpen24h);
  const coords = branch.address.coordinates;
  const mapUrl = branch.address.mapUrl;

  const embedSrc = coords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`
    : null;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* MAP */}
      {embedSrc ? (
        <iframe
          title={`${institutionName} — ${branch.name}`}
          src={embedSrc}
          width="100%"
          height="200"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="h-[120px] bg-muted flex items-center justify-center">
          {mapUrl ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <MapPin className="w-8 h-8" />
              <span className="text-sm">Відкрити на Google Maps</span>
            </a>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <MapPin className="w-8 h-8" />
              <span className="text-sm">Карта недоступна</span>
            </div>
          )}
        </div>
      )}

      {/* INFO BAR */}
      <div className="p-3 space-y-2">
        {/* Name + map link */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">{branch.name}</p>
            {branch.type === 'main' && (
              <span className="text-xs text-muted-foreground">Головний офіс</span>
            )}
          </div>
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1 shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              Карта
            </a>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {branch.address.street}, {branch.address.city}
          </p>
        </div>

        {/* Open/Closed status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              status.isOpen ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              status.isOpen
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-700 dark:text-red-400'
            }`}
          >
            {status.label}
          </span>
          <span className="text-xs text-muted-foreground">
            · Сьогодні: {status.todaySchedule}
          </span>
        </div>

        {/* Phone */}
        {branch.phone && (
          <a
            href={`tel:${branch.phone}`}
            className="text-xs text-primary hover:underline block"
          >
            📞 {branch.phone}
          </a>
        )}

        {/* Services */}
        {branch.services.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {branch.services.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
              >
                {s}
              </span>
            ))}
            {branch.services.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{branch.services.length - 4} ще
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
