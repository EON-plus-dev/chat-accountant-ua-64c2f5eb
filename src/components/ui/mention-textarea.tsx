/**
 * MentionTextarea - Textarea з підтримкою @mentions автокомпліту
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useMentionInput, extractMentionedUserIds, type MentionMember } from "@/hooks/useMentionInput";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string, mentionedUserIds: string[]) => void;
  teamMembers: MentionMember[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  minHeight?: string;
}

export function MentionTextarea({
  value,
  onChange,
  teamMembers,
  placeholder = "Коментар... (@ для згадки)",
  className,
  autoFocus = false,
  disabled = false,
  minHeight = "60px",
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  
  const {
    isOpen,
    setIsOpen,
    searchQuery,
    filteredMembers,
    selectedIndex,
    setSelectedIndex,
    handleInputChange,
    handleSelectMember,
    handleKeyDown,
    mentionStartIndex,
  } = useMentionInput({
    teamMembers,
    enabled: !disabled,
  });
  
  // Handle text change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    handleInputChange(newValue, cursorPosition);
    
    // Extract mentions and notify parent
    const mentionedIds = extractMentionedUserIds(newValue, teamMembers);
    onChange(newValue, mentionedIds);
  }, [handleInputChange, onChange, teamMembers]);
  
  // Handle member selection
  const selectMember = useCallback((member: MentionMember) => {
    const newValue = handleSelectMember(member, value);
    const mentionedIds = extractMentionedUserIds(newValue, teamMembers);
    onChange(newValue, mentionedIds);
    
    // Focus textarea after selection
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [handleSelectMember, value, onChange, teamMembers]);
  
  // Handle keyboard navigation
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      if (isOpen && filteredMembers[selectedIndex]) {
        e.preventDefault();
        selectMember(filteredMembers[selectedIndex]);
        return;
      }
    }
    
    handleKeyDown(e);
  }, [handleKeyDown, isOpen, filteredMembers, selectedIndex, selectMember]);
  
  // Calculate popover position based on cursor
  useEffect(() => {
    if (!isOpen || !textareaRef.current || mentionStartIndex === null) return;
    
    const textarea = textareaRef.current;
    const { offsetTop, offsetLeft, offsetHeight } = textarea;
    
    // Simple positioning - below textarea
    setPopoverPosition({
      top: offsetTop + offsetHeight + 4,
      left: offsetLeft,
    });
  }, [isOpen, mentionStartIndex]);
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };
  
  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={cn("resize-none text-sm", className)}
            style={{ minHeight }}
            autoFocus={autoFocus}
            disabled={disabled}
          />
        </PopoverAnchor>
        
        <PopoverContent 
          className="w-64 p-0" 
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">
                Не знайдено
              </CommandEmpty>
              <CommandGroup heading="Команда">
                {filteredMembers.map((member, index) => (
                  <CommandItem
                    key={member.id}
                    value={member.name}
                    onSelect={() => selectMember(member)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      index === selectedIndex && "bg-accent"
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Avatar className="w-7 h-7">
                      {member.avatar && (
                        <AvatarImage src={member.avatar} alt={member.name} />
                      )}
                      <AvatarFallback className="text-[10px] bg-primary/10">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.name}
                      </p>
                      {member.roleLabel && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.roleLabel}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export type { MentionMember };
