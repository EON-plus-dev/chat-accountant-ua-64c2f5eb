import type { FilterSection } from "@/components/ui/UnifiedFilterPopover";

interface BuildSectionsArgs {
  statusFilter: string;
  contractFilter: string;
  militaryFilter: string;
  onStatusFilterChange: (value: string) => void;
  onContractFilterChange: (value: string) => void;
  onMilitaryFilterChange: (value: string) => void;
}

export const buildEmployeesFilterSections = ({
  statusFilter,
  contractFilter,
  militaryFilter,
  onStatusFilterChange,
  onContractFilterChange,
  onMilitaryFilterChange,
}: BuildSectionsArgs): FilterSection[] => [
  {
    id: "status",
    label: "Статус",
    value: statusFilter,
    onChange: onStatusFilterChange,
    options: [
      { value: "all", label: "Усі статуси" },
      { value: "active", label: "Активні" },
      { value: "probation", label: "На випробувальному" },
      { value: "terminated", label: "Завершені" },
    ],
  },
  {
    id: "contract",
    label: "Тип договору",
    value: contractFilter,
    onChange: onContractFilterChange,
    options: [
      { value: "all", label: "Усі типи" },
      { value: "labor", label: "Трудовий" },
      { value: "civil", label: "ЦПД" },
      { value: "fop-contractor", label: "ФОП-підрядник" },
    ],
  },
  {
    id: "military",
    label: "Військовий облік",
    value: militaryFilter,
    onChange: onMilitaryFilterChange,
    options: [
      { value: "all", label: "Усі статуси" },
      { value: "liable", label: "Військовозобов'язані" },
      { value: "reserved", label: "Заброньовані" },
      { value: "exempt", label: "Звільнені" },
      { value: "mobilized", label: "Мобілізовані" },
      { value: "not-applicable", label: "Не застосовується" },
    ],
  },
];
