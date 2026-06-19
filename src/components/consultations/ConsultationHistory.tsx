import { useState } from "react";
import { History, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatDate, getDaysWord } from "@/lib/formatters";
import type { ConsultationHistoryEntry } from "@/config/consultationMockData";

interface ConsultationHistoryProps {
  currentDate: string;
  history: ConsultationHistoryEntry[];
}

const ConsultationHistory = ({ currentDate, history }: ConsultationHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const allVersions = [
    { date: currentDate, note: "Поточна версія", answer: null, isCurrent: true },
    ...history.map((h) => ({ ...h, isCurrent: false })),
  ];

  return (
    <div className="mt-8 border rounded-xl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors rounded-xl"
      >
        <span className="flex items-center gap-2">
          <History className="w-4 h-4" />
          Історія оновлень ({allVersions.length} {allVersions.length === 1 ? "версія" : allVersions.length < 5 ? "версії" : "версій"})
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: "hidden" }}
            animate={{ height: "auto", opacity: 1, overflow: "visible" }}
            exit={{ height: 0, opacity: 0, overflow: "hidden" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 space-y-3">
              {allVersions.map((v, i) => {
                const nextVersionDate = i > 0 ? allVersions[i - 1].date : null;
                const days = !v.isCurrent && nextVersionDate
                  ? differenceInDays(new Date(nextVersionDate), new Date(v.date))
                  : null;

                return (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(v.date)} — {v.note}
                      </span>
                      {v.isCurrent && (
                        <Badge variant="success" size="sm">Актуально</Badge>
                      )}
                    </div>
                    {!v.isCurrent && days !== null && (
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Діяло: {formatDate(v.date)} – {formatDate(nextVersionDate!)} ({days} {getDaysWord(days)})
                      </p>
                    )}
                    {!v.isCurrent && v.answer && (
                      <>
                        {expandedIndex !== i && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{v.answer}</p>
                        )}
                        {v.answer.length > 120 && (
                          <button
                            type="button"
                            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                            className="text-xs text-primary hover:underline mt-1"
                          >
                            {expandedIndex === i ? "Згорнути" : "Показати повний текст"}
                          </button>
                        )}
                        <AnimatePresence initial={false}>
                          {expandedIndex === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                              animate={{ height: "auto", opacity: 1, overflow: "visible" }}
                              exit={{ height: 0, opacity: 0, overflow: "hidden" }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="mt-2 text-sm text-muted-foreground space-y-2"
                            >
                              {v.answer.split("\n\n").map((p, j) => (
                                <p key={j}>{p}</p>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsultationHistory;
