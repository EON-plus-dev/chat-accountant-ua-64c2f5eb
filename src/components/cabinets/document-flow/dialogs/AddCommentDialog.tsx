/**
 * AddCommentDialog - Діалог для додавання коментаря з підтримкою @mentions
 * Підтримує режим Reply (відповідь на батьківський коментар)
 */

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MentionTextarea, type MentionMember } from "@/components/ui/mention-textarea";

interface ReplyToComment {
  id: string;
  authorName: string;
  content: string;
}

interface AddCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string, mentionedUserIds: string[]) => void;
  teamMembers?: MentionMember[];
  /** Reply mode - shows parent comment preview */
  replyToComment?: ReplyToComment | null;
}

export const AddCommentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  teamMembers = [],
  replyToComment,
}: AddCommentDialogProps) => {
  const [content, setContent] = useState("");
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);

  const isReplyMode = !!replyToComment;

  const handleChange = useCallback((text: string, mentions: string[]) => {
    setContent(text);
    setMentionedUserIds(mentions);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!content.trim()) return;
    onSubmit(content.trim(), mentionedUserIds);
    setContent("");
    setMentionedUserIds([]);
    onOpenChange(false);
  }, [content, mentionedUserIds, onSubmit, onOpenChange]);

  const handleClose = useCallback(() => {
    setContent("");
    setMentionedUserIds([]);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReplyMode ? "Відповідь на коментар" : "Додати коментар"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Parent comment preview in reply mode */}
          {isReplyMode && replyToComment && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50 text-sm">
              <p className="font-medium text-muted-foreground text-xs mb-1">
                Відповідь для {replyToComment.authorName}:
              </p>
              <p className="text-foreground line-clamp-2">
                "{replyToComment.content}"
              </p>
            </div>
          )}
          
          <MentionTextarea
            value={content}
            onChange={handleChange}
            teamMembers={teamMembers}
            placeholder={
              isReplyMode 
                ? "Введіть відповідь... (@ для згадки)" 
                : "Введіть текст коментаря... (@ для згадки)"
            }
            minHeight="100px"
            autoFocus
          />
        </div>
        
        <DialogFooter className="pb-safe gap-2 sm:gap-0 flex-col-reverse sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="min-h-[44px] w-full sm:w-auto"
          >
            Скасувати
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!content.trim()}
            className="min-h-[44px] w-full sm:w-auto"
          >
            {isReplyMode ? "Відповісти" : "Додати"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};