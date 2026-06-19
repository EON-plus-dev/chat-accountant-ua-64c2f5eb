import { CheckCircle2, Clock, UserMinus, Shield, ShieldOff, ShieldCheck, ShieldAlert, ShieldMinus, type LucideIcon } from "lucide-react";
import { isDemoCabinet, getDemoEmployeesForCabinet } from "@/config/demoCabinetsData";
import { differenceInDays, parseISO } from "date-fns";

// Типи договорів
export type ContractType = "labor" | "civil" | "fop-contractor";

// Статуси працівника
export type EmployeeStatus = "active" | "probation" | "terminated";

// Режим зайнятості
export type EmploymentMode = "full-time" | "part-time" | "hourly";

// Локація
export type WorkLocation = "office" | "remote" | "hybrid";

// Статус військового обліку
export type MilitaryStatus = 
  | "liable"           // Військовозобов'язаний
  | "exempt"           // Звільнений від обліку
  | "reserved"         // Заброньований
  | "not-applicable";  // Не застосовується (жінки без ВОС, іноземці)

// Історія змін
export interface EmployeeHistoryItem {
  date: string;
  action: string;
  user?: string;
  role?: string;
}

// Основний інтерфейс працівника
export interface Employee {
  id: string;
  cabinetId: string;
  
  // Основна інформація
  fullName: string;
  position: string;
  contractType: ContractType;
  status: EmployeeStatus;
  startDate: string;
  endDate?: string;
  
  // Умови праці
  employmentMode: EmploymentMode;
  fte?: number;
  schedule?: string;
  location: WorkLocation;
  comments?: string;
  
  // Договір та документи
  contractNumber?: string;
  contractDate?: string;
  documentIds?: string[];
  
  // Військовий облік
  militaryStatus?: MilitaryStatus;
  militaryDocumentDate?: string;  // Дата останнього оновлення документа
  militaryRegistrationNumber?: string; // Номер облікової картки
  
  // Історія змін
  history?: EmployeeHistoryItem[];
}

// Конфігурація типів договорів
export const contractTypeConfig: Record<ContractType, { 
  label: string; 
  shortLabel: string; 
  color: string;
}> = {
  labor: { 
    label: "Трудовий договір", 
    shortLabel: "Трудовий", 
    color: "emerald" 
  },
  civil: { 
    label: "Цивільно-правовий договір (ЦПД)", 
    shortLabel: "ЦПД", 
    color: "blue" 
  },
  "fop-contractor": { 
    label: "ФОП-підрядник", 
    shortLabel: "ФОП", 
    color: "purple" 
  },
};

// Конфігурація статусів
export const employeeStatusConfig: Record<EmployeeStatus, {
  label: string;
  icon: LucideIcon;
  className: string;
}> = {
  active: { 
    label: "Активний", 
    icon: CheckCircle2, 
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" 
  },
  probation: { 
    label: "На випробувальному", 
    icon: Clock, 
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" 
  },
  terminated: { 
    label: "Завершено", 
    icon: UserMinus, 
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400" 
  },
};

// Конфігурація режимів зайнятості
export const employmentModeConfig: Record<EmploymentMode, { label: string }> = {
  "full-time": { label: "Повна зайнятість" },
  "part-time": { label: "Часткова зайнятість" },
  hourly: { label: "Погодинна" },
};

// Конфігурація локацій
export const workLocationConfig: Record<WorkLocation, { label: string }> = {
  office: { label: "Офіс" },
  remote: { label: "Віддалено" },
  hybrid: { label: "Гібрид" },
};

// Конфігурація статусів військового обліку
export const militaryStatusConfig: Record<MilitaryStatus, {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  className: string;
}> = {
  liable: {
    label: "Військовозобов'язаний",
    shortLabel: "ВЗ",
    icon: Shield,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
  },
  exempt: {
    label: "Звільнений від обліку",
    shortLabel: "Звіл.",
    icon: ShieldOff,
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400"
  },
  reserved: {
    label: "Заброньований",
    shortLabel: "Бронь",
    icon: ShieldCheck,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
  },
  "not-applicable": {
    label: "Не застосовується",
    shortLabel: "Н/З",
    icon: ShieldMinus,
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400"
  },
};

// Демо-дані для працівників
export const demoEmployees: Employee[] = [
  // ФОП Іваненко (cabinetId: "2")
  {
    id: "emp-001",
    cabinetId: "2",
    fullName: "Петренко Олег Іванович",
    position: "Менеджер з продажу",
    contractType: "labor",
    status: "active",
    startDate: "2025-02-01",
    employmentMode: "full-time",
    fte: 1.0,
    schedule: "Пн-Пт 9:00-18:00",
    location: "office",
    contractNumber: "ТД-2025-001",
    contractDate: "2025-02-01",
    documentIds: ["doc-emp-001"],
    history: [
      { date: "2025-02-01", action: "Працівника додано", role: "Бухгалтер" },
      { date: "2025-03-01", action: "Пройшов випробувальний термін", role: "Система" },
    ],
  },
  {
    id: "emp-002",
    cabinetId: "2",
    fullName: "Коваленко Марія Сергіївна",
    position: "Маркетолог",
    contractType: "civil",
    status: "active",
    startDate: "2025-03-01",
    employmentMode: "part-time",
    fte: 0.5,
    schedule: "Пн-Ср 10:00-16:00",
    location: "remote",
    contractNumber: "ЦПД-2025-003",
    contractDate: "2025-03-01",
    documentIds: ["doc-emp-002"],
    comments: "Працює над проєктами маркетингу",
    history: [
      { date: "2025-03-01", action: "Працівника додано", role: "Власник" },
    ],
  },
  {
    id: "emp-003",
    cabinetId: "2",
    fullName: "Бондар Андрій Петрович",
    position: "Асистент",
    contractType: "labor",
    status: "terminated",
    startDate: "2025-01-15",
    endDate: "2025-04-30",
    employmentMode: "hourly",
    fte: 0.3,
    schedule: "За потреби",
    location: "office",
    contractNumber: "ТД-2025-002",
    contractDate: "2025-01-15",
    history: [
      { date: "2025-01-15", action: "Працівника додано", role: "Бухгалтер" },
      { date: "2025-04-30", action: "Договір завершено", role: "Власник" },
    ],
  },
];

// Перевірка чи документ військового обліку прострочений (>30 днів)
export const isMilitaryDocumentOutdated = (employee: Employee): boolean => {
  // Якщо статус не потребує відслідковування — не прострочено
  if (!employee.militaryStatus || 
      employee.militaryStatus === "not-applicable" || 
      employee.militaryStatus === "exempt") {
    return false;
  }
  
  // Якщо немає дати документа — вважаємо простроченим
  if (!employee.militaryDocumentDate) {
    return true;
  }
  
  return differenceInDays(new Date(), parseISO(employee.militaryDocumentDate)) > 30;
};

// Хелпер для отримання працівників кабінету
export const getEmployeesForCabinet = (cabinetId: string): Employee[] => {
  // Check for specialized demo cabinets first
  if (isDemoCabinet(cabinetId)) {
    return getDemoEmployeesForCabinet(cabinetId);
  }
  // Fallback to filtering base demo employees
  return demoEmployees.filter(emp => emp.cabinetId === cabinetId);
};

// Хелпер для статистики
export const getEmployeeStats = (employees: Employee[]) => {
  const active = employees.filter(e => e.status === "active" || e.status === "probation").length;
  const terminated = employees.filter(e => e.status === "terminated").length;
  const laborCount = employees.filter(e => e.contractType === "labor" && e.status !== "terminated").length;
  const civilCount = employees.filter(e => e.contractType === "civil" && e.status !== "terminated").length;
  const fopCount = employees.filter(e => e.contractType === "fop-contractor" && e.status !== "terminated").length;
  
  // Зміни за місяць (демо: останні 30 днів)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentNew = employees.filter(e => {
    const startDate = new Date(e.startDate);
    return startDate >= thirtyDaysAgo && e.status !== "terminated";
  }).length;
  
  const recentTerminated = employees.filter(e => {
    if (!e.endDate) return false;
    const endDate = new Date(e.endDate);
    return endDate >= thirtyDaysAgo;
  }).length;
  
  return {
    active,
    terminated,
    laborCount,
    civilCount,
    fopCount,
    recentNew,
    recentTerminated,
  };
};
