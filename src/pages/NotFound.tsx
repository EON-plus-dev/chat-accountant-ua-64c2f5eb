import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 pb-safe animate-in fade-in duration-500">
      <div className="text-center space-y-6">
        <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/50" />
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-foreground tabular-nums">
          404
        </h1>
        <div className="space-y-2">
          <p className="text-lg sm:text-xl md:text-2xl font-medium text-foreground">
            Сторінку не знайдено
          </p>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>
        </div>
        <Button asChild size="lg" className="mt-4 min-h-[44px]">
          <Link to="/">На головну</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
