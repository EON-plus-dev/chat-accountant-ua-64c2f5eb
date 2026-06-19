import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { InstitutionProduct, FullInstitutionProfile } from "@/portal/data/institutionProfiles";

function getRelevantChecklists(product: InstitutionProduct, checklists?: FullInstitutionProfile["documentChecklists"]) {
  // Priority: product-level checklists first
  if (product.documentChecklist && product.documentChecklist.length > 0) {
    return product.documentChecklist;
  }
  // Fallback: filter profile-level checklists by regex (backward compat)
  if (!checklists || checklists.length === 0) return [];
  const text = `${product.name} ${product.category}`.toLowerCase();
  const matched = checklists.filter(c => {
    const scenario = c.scenario.toLowerCase();
    if (text.includes("рко") || text.includes("рахун")) return scenario.includes("рахун");
    if (text.includes("кредит")) return scenario.includes("кредит");
    if (text.includes("еквайринг")) return scenario.includes("еквайринг");
    if (text.includes("зед") || text.includes("валют")) return scenario.includes("валют") || scenario.includes("зед");
    return false;
  });
  // Don't show all checklists as fallback — better to show nothing than irrelevant
  return matched;
}

interface Props {
  product: InstitutionProduct;
  profile: FullInstitutionProfile;
}

export const ProductDocuments = ({ product, profile }: Props) => {
  const checklists = getRelevantChecklists(product, profile.documentChecklists);
  const hasChecklists = checklists.length > 0;
  const mistakes = product.commonMistakes ?? profile.commonMistakes;
  const hasMistakes = mistakes && mistakes.length > 0;

  const [activeTab, setActiveTab] = useState(0);

  if (!hasChecklists && !hasMistakes) return null;

  const showTabs = checklists.length > 1;
  const activeChecklist = hasChecklists ? checklists[activeTab] || checklists[0] : null;

  return (
    <div className="border-t border-border/50 pt-2 space-y-2">
      <p className="text-[11px] font-semibold text-foreground">📋 План дій</p>
      {/* Tab switcher for multiple scenarios */}
      {hasChecklists && showTabs && (
        <div className="flex gap-1">
          {checklists.map((checklist, i) => {
            const shortLabel = checklist.scenario.replace(/^(Відкрити |Оформити |Підключити )/, "");
            return (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  activeTab === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* Active checklist */}
      {activeChecklist && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">{activeChecklist.scenario}</p>
          <ul className="mt-0.5 space-y-0.5">
            {activeChecklist.requiredDocs.map((doc, j) => (
              <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5">{doc.isOptional ? "○" : "●"}</span>
                <span>{doc.name}{doc.note && <span className="italic"> — {doc.note}</span>}</span>
              </li>
            ))}
          </ul>
          {activeChecklist.warnings.length > 0 && (
            <div className="mt-0.5">
              {activeChecklist.warnings.map((w, j) => (
                <p key={j} className="text-[10px] text-amber-600 dark:text-amber-400">⚠ {w}</p>
              ))}
            </div>
          )}
          {activeChecklist.canDoOnline && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">✓ Онлайн · {activeChecklist.timeToComplete}</p>
          )}
        </div>
      )}

      {/* Single checklist (no tabs) */}
      {hasChecklists && !showTabs && !activeChecklist && checklists.map((checklist, i) => (
        <div key={i}>
          <p className="text-[11px] font-medium text-muted-foreground">{checklist.scenario}</p>
          <ul className="mt-0.5 space-y-0.5">
            {checklist.requiredDocs.map((doc, j) => (
              <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5">{doc.isOptional ? "○" : "●"}</span>
                <span>{doc.name}{doc.note && <span className="italic"> — {doc.note}</span>}</span>
              </li>
            ))}
          </ul>
          {checklist.warnings.length > 0 && (
            <div className="mt-0.5">
              {checklist.warnings.map((w, j) => (
                <p key={j} className="text-[10px] text-amber-600 dark:text-amber-400">⚠ {w}</p>
              ))}
            </div>
          )}
          {checklist.canDoOnline && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">✓ Онлайн · {checklist.timeToComplete}</p>
          )}
        </div>
      ))}

      {/* Common mistakes — as list with explanations */}
      {hasMistakes && (
        <div>
          <p className="text-[10px] font-semibold text-foreground mb-1">⚠ Типові помилки</p>
          <ul className="space-y-0.5">
            {mistakes!.map((m, i) => (
              <li key={i} className="text-[10px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
