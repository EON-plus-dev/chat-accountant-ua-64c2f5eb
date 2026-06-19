import UnifiedFilterPopover, { FilterSection } from "@/components/ui/UnifiedFilterPopover";
import { typeOptions, roleOptions, statusOptions } from "@/config/cabinetsData";

interface CabinetFiltersPopoverProps {
  typeFilter: string;
  roleFilter: string;
  statusFilter: string;
  onTypeChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
  isMobile?: boolean;
}

const CabinetFiltersPopover = ({
  typeFilter,
  roleFilter,
  statusFilter,
  onTypeChange,
  onRoleChange,
  onStatusChange,
  onReset,
  isMobile,
}: CabinetFiltersPopoverProps) => {
  // Count active filters (not "all" and status not default "active")
  const activeFiltersCount = [
    typeFilter !== "all",
    roleFilter !== "all",
    statusFilter !== "active",
  ].filter(Boolean).length;

  const sections: FilterSection[] = [
    {
      id: "cabinet-type",
      label: "Тип кабінету",
      options: typeOptions.map((opt) => ({ value: opt.value, label: opt.label })),
      value: typeFilter,
      onChange: onTypeChange,
      placeholder: "Тип",
    },
    {
      id: "cabinet-role",
      label: "Роль",
      options: roleOptions.map((opt) => ({ value: opt.value, label: opt.label })),
      value: roleFilter,
      onChange: onRoleChange,
      placeholder: "Роль",
    },
    {
      id: "cabinet-status",
      label: "Статус",
      options: statusOptions.map((opt) => ({ value: opt.value, label: opt.label })),
      value: statusFilter,
      onChange: onStatusChange,
      placeholder: "Статус",
    },
  ];

  return (
    <UnifiedFilterPopover
      sections={sections}
      activeFiltersCount={activeFiltersCount}
      onReset={onReset}
      isMobile={isMobile}
    />
  );
};

export default CabinetFiltersPopover;
