/**
 * CreateTaskDialog Component
 * 
 * Dialog/Sheet for creating a new task.
 * Can be pre-filled from @mention comment context.
 */

import { useState, useEffect } from "react";
import { CalendarIcon, AtSign, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { Task, TaskPriority } from "@/config/tasksConfig";
import { taskPriorityConfig } from "@/config/tasksConfig";
import type { MentionMember } from "@/components/ui/mention-textarea";

// Prefill data type for external consumers
export interface TaskPrefillData {
  title?: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  sourceType?: "mention" | "manual";
  sourceId?: string;
  sourceText?: string;
  documentId?: string;
  documentTitle?: string;
  mentionContext?: {
    commentContent: string;
    mentionedUserName: string;
  };
}

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  teamMembers: MentionMember[];
  cabinetId?: string;
  cabinetName?: string;
  currentUserId?: string;
  currentUserName?: string;
  prefillData?: TaskPrefillData | null;
}

export const CreateTaskDialog = ({
  open,
  onOpenChange,
  onSubmit,
  teamMembers,
  cabinetId,
  cabinetName,
  currentUserId,
  currentUserName,
  prefillData,
}: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  
  // Pre-fill when dialog opens with prefillData
  useEffect(() => {
    if (open && prefillData) {
      setTitle(prefillData.title || "");
      setDescription(prefillData.description || "");
      setAssigneeId(prefillData.assigneeId || "");
      // Don't prefill priority - let user choose
    } else if (!open) {
      // Reset form when closed
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssigneeId("");
      setDueDate(undefined);
    }
  }, [open, prefillData]);
  
  const selectedAssignee = teamMembers.find(m => m.userId === assigneeId);
  
  const handleSubmit = () => {
    if (!title.trim() || !assigneeId) return;
    
    const assignee = teamMembers.find(m => m.userId === assigneeId);
    if (!assignee) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: "open",
      assigneeId,
      assigneeName: assignee.name,
      createdById: currentUserId || "current-user",
      createdByName: currentUserName || "Поточний користувач",
      dueDate: dueDate?.toISOString(),
      sourceType: prefillData?.sourceType || "manual",
      sourceId: prefillData?.sourceId,
      sourceText: prefillData?.sourceText,
      cabinetId: cabinetId || "",
      cabinetName: cabinetName || "",
      documentId: prefillData?.documentId,
      documentTitle: prefillData?.documentTitle,
    });
    
    onOpenChange(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Нове завдання
            {prefillData?.sourceType === "mention" && (
              <Badge variant="secondary" className="text-xs gap-1">
                <AtSign className="w-3 h-3" />
                Зі згадки
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Створіть завдання для члена команди
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 py-4">
          {/* Source context */}
          {prefillData?.documentTitle && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Документ:</span>
              <span className="font-medium truncate">{prefillData.documentTitle}</span>
            </div>
          )}
          
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Назва завдання *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Що потрібно зробити?"
              autoFocus
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Детальний опис завдання..."
              rows={3}
            />
          </div>
          
          {/* Assignee */}
          <div className="space-y-2">
            <Label>Виконавець *</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть виконавця">
                  {selectedAssignee && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedAssignee.name}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                      {member.roleLabel && (
                        <span className="text-muted-foreground text-xs">
                          ({member.roleLabel})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Priority */}
          <div className="space-y-2">
            <Label>Пріоритет</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(taskPriorityConfig) as [TaskPriority, typeof taskPriorityConfig.low][]).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className={cn("w-4 h-4", config.color)} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Due Date */}
          <div className="space-y-2">
            <Label>Дедлайн</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "d MMMM yyyy", { locale: uk }) : "Оберіть дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  locale={uk}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim() || !assigneeId}
          >
            Створити завдання
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
