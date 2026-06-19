import type { Json } from '@/integrations/supabase/types';

export interface WorkingHoursJson {
  weekdays?: string | null;
  saturday?: string | null;
  sunday?: string | null;
}

export interface WorkingStatus {
  isOpen: boolean;
  label: string;
  todaySchedule: string;
}

const DAY_NAMES = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];

export function parseWorkingHours(raw: Json | null): WorkingHoursJson {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { weekdays: null, saturday: null, sunday: null };
  }
  const obj = raw as Record<string, Json | undefined>;
  return {
    weekdays: typeof obj.weekdays === 'string' ? obj.weekdays : null,
    saturday: typeof obj.saturday === 'string' ? obj.saturday : null,
    sunday: typeof obj.sunday === 'string' ? obj.sunday : null,
  };
}

export function getCurrentStatus(hours: WorkingHoursJson, is24h: boolean): WorkingStatus {
  if (is24h) return { isOpen: true, label: 'Відкрито цілодобово', todaySchedule: '24/7' };

  const day = new Date().getDay();
  let schedule: string | null | undefined;

  if (day === 0) schedule = hours.sunday;
  else if (day === 6) schedule = hours.saturday;
  else schedule = hours.weekdays;

  if (!schedule) {
    return {
      isOpen: false,
      label: `${DAY_NAMES[day]} — вихідний`,
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
