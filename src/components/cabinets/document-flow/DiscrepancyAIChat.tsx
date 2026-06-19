import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowUp, 
  Plus, 
  Loader2,
  Bot,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiscrepancyCard, DiscrepancyAIChatMessage } from "@/types/discrepancy";
import { getDemoAIResponse } from "@/types/discrepancy";

interface DiscrepancyAIChatProps {
  selectedText?: string;
  onAddCard: (card: Partial<DiscrepancyCard>) => void;
  className?: string;
}

export const DiscrepancyAIChat = ({
  selectedText,
  onAddCard,
  className,
}: DiscrepancyAIChatProps) => {
  const [messages, setMessages] = useState<DiscrepancyAIChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Привіт! Я допоможу сформулювати розбіжності. Опишіть, що вас не влаштовує в документі, або виділіть текст та натисніть \"До розбіжностей\".",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Add context when text is selected
  useEffect(() => {
    if (selectedText) {
      const contextMessage: DiscrepancyAIChatMessage = {
        id: `context-${Date.now()}`,
        role: "assistant",
        content: `Ви виділили текст: "${selectedText.slice(0, 100)}${selectedText.length > 100 ? "..." : ""}". Опишіть, що саме вас не влаштовує, і я запропоную формулювання.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, contextMessage]);
    }
  }, [selectedText]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: DiscrepancyAIChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = getDemoAIResponse(inputValue);
      
      const assistantMessage: DiscrepancyAIChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiResponse.response,
        timestamp: new Date().toISOString(),
        suggestedCard: aiResponse.proposedText ? {
          originalText: selectedText || inputValue.slice(0, 50),
          proposedText: aiResponse.proposedText,
          aiComment: aiResponse.response,
          status: "draft",
        } : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddSuggestedCard = (message: DiscrepancyAIChatMessage) => {
    if (message.suggestedCard) {
      onAddCard({
        ...message.suggestedCard,
        originalText: selectedText || message.suggestedCard.originalText || "",
        createdAt: new Date().toISOString(),
      });
      
      // Add confirmation message
      const confirmMessage: DiscrepancyAIChatMessage = {
        id: `confirm-${Date.now()}`,
        role: "assistant",
        content: "✓ Картку розбіжності додано! Ви можете редагувати її праворуч.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <Sparkles className="w-4 h-4 text-violet-500" />
        <span className="text-sm font-medium">AI-асистент</span>
        <Badge variant="secondary" className="text-[10px]">Demo</Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-3" ref={scrollRef}>
        <div className="space-y-3 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                  message.role === "assistant" 
                    ? "bg-violet-100 dark:bg-violet-900/30" 
                    : "bg-primary/10"
                )}
              >
                {message.role === "assistant" ? (
                  <Bot className="w-3 h-3 text-violet-600" />
                ) : (
                  <User className="w-3 h-3 text-primary" />
                )}
              </div>
              
              <div 
                className={cn(
                  "flex-1 max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  message.role === "assistant" 
                    ? "bg-muted/50" 
                    : "bg-primary text-primary-foreground ml-auto"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {/* Add as card button */}
                {message.suggestedCard && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-xs gap-1 bg-background"
                    onClick={() => handleAddSuggestedCard(message)}
                  >
                    <Plus className="w-3 h-3" />
                    Додати як картку
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Bot className="w-3 h-3 text-violet-600" />
              </div>
              <div className="bg-muted/50 rounded-lg px-3 py-2 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Друкує...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="pt-2 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Опишіть, що вас не влаштовує..."
            className="min-h-[60px] max-h-[120px] text-sm resize-none"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={cn("m-1.5 p-2 rounded-xl transition-all duration-200 shrink-0 disabled:opacity-40", inputValue.trim() && !isTyping ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground/40 cursor-default")}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Спробуйте: "форс-мажор", "штраф", "термін", "оплата"
        </p>
      </div>
    </div>
  );
};
