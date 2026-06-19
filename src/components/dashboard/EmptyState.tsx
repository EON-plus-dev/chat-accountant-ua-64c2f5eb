import { Button } from "@/components/ui/button";
import emptyReferences from "@/assets/empty-references.png";
import emptyEvents from "@/assets/empty-events.png";

interface EmptyStateProps {
  type: "references" | "events";
  onAction?: () => void;
}

const emptyStateConfig = {
  references: {
    image: emptyReferences,
    title: "Довідники порожні",
    description: "Тут будуть зберігатися ваші контрагенти, товари, послуги та категорії. Почніть додавати записи, щоб спростити облік.",
    actionLabel: "Додати запис",
  },
  events: {
    image: emptyEvents,
    title: "Поки що немає подій",
    description: "Тут відображатиметься стрічка всіх системних подій: створення документів, зміна статусів, нагадування та важливі оновлення.",
    actionLabel: "Переглянути можливості",
  },
};

const EmptyState = ({ type, onAction }: EmptyStateProps) => {
  const config = emptyStateConfig[type];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-12 text-center animate-in fade-in duration-500">
      <div className="w-48 h-48 mb-6 relative">
        <img 
          src={config.image} 
          alt={config.title}
          className="w-full h-full object-contain opacity-90"
        />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-3">
        {config.title}
      </h3>
      
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        {config.description}
      </p>
      
      <Button 
        onClick={onAction}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {config.actionLabel}
      </Button>
    </div>
  );
};

export default EmptyState;
