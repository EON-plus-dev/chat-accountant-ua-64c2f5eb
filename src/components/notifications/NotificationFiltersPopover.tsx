import UnifiedFilterPopover, { FilterSection } from "@/components/ui/UnifiedFilterPopover";

interface Cabinet {
  id: string;
  name: string;
}

interface TypeFilter {
  id: string;
  label: string;
}

interface NotificationFiltersPopoverProps {
  cabinets: Cabinet[];
  typeFilters: TypeFilter[];
  selectedCabinet: string;
  selectedType: string;
  onCabinetChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

const NotificationFiltersPopover = ({
  cabinets,
  typeFilters,
  selectedCabinet,
  selectedType,
  onCabinetChange,
  onTypeChange,
  onReset,
  activeFiltersCount,
}: NotificationFiltersPopoverProps) => {
  const sections: FilterSection[] = [
    {
      id: "notification-cabinet",
      label: "Кабінет",
      options: cabinets.map((cab) => ({ value: cab.id, label: cab.name })),
      value: selectedCabinet,
      onChange: onCabinetChange,
      placeholder: "Оберіть кабінет",
    },
    {
      id: "notification-type",
      label: "Тип сповіщення",
      options: typeFilters.map((type) => ({ value: type.id, label: type.label })),
      value: selectedType,
      onChange: onTypeChange,
      placeholder: "Оберіть тип",
    },
  ];

  return (
    <UnifiedFilterPopover
      sections={sections}
      activeFiltersCount={activeFiltersCount}
      onReset={onReset}
    />
  );
};

export default NotificationFiltersPopover;
