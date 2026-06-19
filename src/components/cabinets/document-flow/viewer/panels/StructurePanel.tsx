/**
 * StructurePanel - Вкладка "Структура" бокової панелі
 * Показує навігаційне дерево розділів документа
 * 
 * Функціонал:
 * - Автоматичне підсвічування активної секції при скролі (ScrollSpy)
 * - Авто-скрол до активного елемента в панелі
 */

import { useMemo, useEffect, useRef } from "react";
import { FileText, ChevronRight, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  parseDocumentStructure, 
  generateDemoStructure,
  type DocumentSection 
} from "../utils/documentStructureParser";

interface StructurePanelProps {
  documentHtml?: string;
  documentType?: string;
  activeSection?: string;
  onScrollToSection: (sectionId: string) => void;
  className?: string;
}

export const StructurePanel = ({
  documentHtml,
  documentType = "contract",
  activeSection,
  onScrollToSection,
  className,
}: StructurePanelProps) => {
  // Парсимо структуру з HTML або генеруємо демо
  const structure = useMemo(() => {
    if (documentHtml) {
      const parsed = parseDocumentStructure(documentHtml);
      if (parsed.length > 0) return parsed;
    }
    return generateDemoStructure(documentType);
  }, [documentHtml, documentType]);
  
  if (structure.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full p-6 text-center", className)}>
        <FileText className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          Структура документа недоступна
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Документ не містить розділів або заголовків
        </p>
      </div>
    );
  }
  
  // Ref для авто-скролу до активного елемента
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Авто-скрол до активного елемента коли він змінюється
  useEffect(() => {
    if (activeSection && scrollAreaRef.current) {
      const activeElement = scrollAreaRef.current.querySelector(
        `[data-section-nav="${activeSection}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest' 
        });
      }
    }
  }, [activeSection]);
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Структура документа
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {structure.length} розділів
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2" ref={scrollAreaRef}>
          {structure.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              activeSection={activeSection}
              onSelect={onScrollToSection}
              depth={0}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

interface SectionItemProps {
  section: DocumentSection;
  activeSection?: string;
  onSelect: (sectionId: string) => void;
  depth: number;
}

const SectionItem = ({ section, activeSection, onSelect, depth }: SectionItemProps) => {
  const hasChildren = section.children.length > 0;
  const isActive = activeSection === section.id || activeSection === section.fragmentRef;
  
  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        data-section-nav={section.fragmentRef || section.id}
        className={cn(
          "w-full justify-start h-auto py-2 px-2 text-left font-normal",
          "hover:bg-accent/50 transition-all duration-200",
          // Активний стан з анімацією
          isActive && [
            "bg-primary/10 text-primary font-medium",
            "border-l-2 border-primary -ml-0.5 pl-2.5",
            "shadow-sm"
          ],
          depth === 0 && "font-medium",
          depth === 1 && "text-sm",
          depth >= 2 && "text-xs text-muted-foreground"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(section.fragmentRef)}
      >
        {hasChildren ? (
          <ChevronDown className="w-3.5 h-3.5 mr-1.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 mr-1.5 shrink-0 opacity-0" />
        )}
        <span className="truncate">{section.title}</span>
      </Button>
      
      {hasChildren && (
        <div>
          {section.children.map((child) => (
            <SectionItem
              key={child.id}
              section={child}
              activeSection={activeSection}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
