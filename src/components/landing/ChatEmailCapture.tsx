import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateEmail } from "@/lib/validators";

interface ChatEmailCaptureProps {
  onSubmit: (email: string) => void;
  disabled?: boolean;
}

export const ChatEmailCapture = ({ onSubmit, disabled }: ChatEmailCaptureProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!validateEmail(trimmed)) {
      setError("Введіть коректний email");
      return;
    }
    setError("");
    onSubmit(trimmed);
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <div className="flex-1 min-w-0">
        <Input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="your@email.com"
          disabled={disabled}
          className="h-8 text-xs"
          autoFocus
        />
        {error && <p className="text-[10px] text-destructive mt-0.5">{error}</p>}
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={disabled || !email.trim()}
        className="h-8 px-3 text-xs gap-1"
      >
        <Send className="w-3 h-3" />
        Надіслати
      </Button>
    </form>
  );
};
