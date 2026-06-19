import { useState } from "react";
import { Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  content: string;
}

export const MessageActions = ({ content }: MessageActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Скопійовано", { duration: 1500 });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-0.5 mt-2 ml-9">
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={handleCopy} className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Копіювати</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setFeedback(feedback === "up" ? null : "up")}
            className={cn("p-1.5 rounded-lg transition-colors", feedback === "up" ? "text-primary bg-primary/10" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted")}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Корисно</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setFeedback(feedback === "down" ? null : "down")}
            className={cn("p-1.5 rounded-lg transition-colors", feedback === "down" ? "text-destructive bg-destructive/10" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted")}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Не корисно</TooltipContent>
      </Tooltip>
    </div>
  );
};
