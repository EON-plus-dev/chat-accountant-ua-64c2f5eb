/**
 * useMentionInput - Hook для @mentions автокомпліту
 * 
 * Виявляє @-символ у тексті та надає фільтрований список користувачів
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";

export interface MentionMember {
  id: string;
  userId: string;
  name: string;
  role?: string;
  roleLabel?: string;
  avatar?: string;
}

interface UseMentionInputOptions {
  teamMembers: MentionMember[];
  enabled?: boolean;
}

interface UseMentionInputReturn {
  // Popover state
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  
  // Search query (text after @)
  searchQuery: string;
  
  // Filtered members
  filteredMembers: MentionMember[];
  
  // Selected index for keyboard navigation
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  
  // Handlers
  handleInputChange: (value: string, cursorPosition: number) => void;
  handleSelectMember: (member: MentionMember, currentValue: string) => string;
  handleKeyDown: (e: React.KeyboardEvent) => boolean; // Returns true if handled
  
  // Position info
  mentionStartIndex: number | null;
}

export function useMentionInput({
  teamMembers,
  enabled = true,
}: UseMentionInputOptions): UseMentionInputReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery && !isOpen) return teamMembers.slice(0, 5);
    
    const query = searchQuery.toLowerCase().trim();
    
    return teamMembers.filter(member => {
      const name = member.name.toLowerCase();
      const role = (member.roleLabel || member.role || "").toLowerCase();
      
      return name.includes(query) || role.includes(query);
    }).slice(0, 8); // Limit to 8 results
  }, [teamMembers, searchQuery, isOpen]);
  
  // Reset selected index when filtered members change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredMembers.length]);
  
  const handleInputChange = useCallback((value: string, cursorPosition: number) => {
    if (!enabled) return;
    
    // Find @ before cursor
    const textBeforeCursor = value.slice(0, cursorPosition);
    
    // Find last @ that starts a potential mention
    let atIndex = -1;
    for (let i = textBeforeCursor.length - 1; i >= 0; i--) {
      const char = textBeforeCursor[i];
      if (char === '@') {
        // Check if @ is at start or preceded by whitespace
        if (i === 0 || /\s/.test(textBeforeCursor[i - 1])) {
          atIndex = i;
          break;
        }
      }
      // Stop if we hit whitespace (no active mention)
      if (char === ' ' || char === '\n') break;
    }
    
    if (atIndex !== -1) {
      const query = textBeforeCursor.slice(atIndex + 1);
      
      // Check if query doesn't contain spaces (active mention)
      if (!/\s/.test(query)) {
        setSearchQuery(query);
        setMentionStartIndex(atIndex);
        setIsOpen(true);
        return;
      }
    }
    
    // No active mention
    setIsOpen(false);
    setSearchQuery("");
    setMentionStartIndex(null);
  }, [enabled]);
  
  const handleSelectMember = useCallback((member: MentionMember, currentValue: string): string => {
    if (mentionStartIndex === null) return currentValue;
    
    const beforeMention = currentValue.slice(0, mentionStartIndex);
    const afterQuery = currentValue.slice(mentionStartIndex + 1 + searchQuery.length);
    
    // Insert @Name with space
    const newValue = `${beforeMention}@${member.name} ${afterQuery}`;
    
    // Close popover
    setIsOpen(false);
    setSearchQuery("");
    setMentionStartIndex(null);
    setSelectedIndex(0);
    
    return newValue;
  }, [mentionStartIndex, searchQuery]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent): boolean => {
    if (!isOpen || filteredMembers.length === 0) return false;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredMembers.length - 1 ? prev + 1 : 0
        );
        return true;
        
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredMembers.length - 1
        );
        return true;
        
      case "Enter":
      case "Tab":
        if (filteredMembers[selectedIndex]) {
          e.preventDefault();
          return true; // Signal to select current member
        }
        return false;
        
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        setMentionStartIndex(null);
        return true;
        
      default:
        return false;
    }
  }, [isOpen, filteredMembers, selectedIndex]);
  
  return {
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
  };
}

// Helper to extract mentioned user IDs from text
export function extractMentionedUserIds(
  text: string,
  teamMembers: MentionMember[]
): string[] {
  const mentionedIds: string[] = [];
  
  // Find all @Name patterns
  const mentionRegex = /@([^\s@]+(?:\s+[^\s@]+)*)/g;
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    const potentialName = match[1];
    
    // Find member by name (case-insensitive partial match from start)
    const member = teamMembers.find(m => {
      const memberName = m.name.toLowerCase();
      const matchName = potentialName.toLowerCase();
      return memberName === matchName || memberName.startsWith(matchName);
    });
    
    if (member && !mentionedIds.includes(member.userId)) {
      mentionedIds.push(member.userId);
    }
  }
  
  return mentionedIds;
}
