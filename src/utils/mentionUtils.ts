/**
 * Утиліти для парсингу та рендерингу @mentions
 */

import type { MentionMember } from "@/hooks/useMentionInput";

export interface ParsedMentionPart {
  text: string;
  isMention: boolean;
  userId?: string;
  memberName?: string;
}

/**
 * Парсить текст та виділяє @mentions
 */
export function parseMentions(
  content: string,
  teamMembers: MentionMember[]
): ParsedMentionPart[] {
  if (!content) return [];
  
  const parts: ParsedMentionPart[] = [];
  
  // Create a map of lowercase names to members for quick lookup
  const membersByName = new Map<string, MentionMember>();
  teamMembers.forEach(m => {
    membersByName.set(m.name.toLowerCase(), m);
  });
  
  // Find @mentions pattern
  // Match @Name where Name can be multiple words until we hit another @ or end
  const regex = /@([А-ЯІЇЄҐа-яіїєґA-Za-z]+(?:\s+[А-ЯІЇЄҐа-яіїєґA-Za-z]+)*)/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const fullMatch = match[0]; // @Name
    const potentialName = match[1]; // Name without @
    const matchStart = match.index;
    
    // Add text before this match
    if (matchStart > lastIndex) {
      parts.push({
        text: content.slice(lastIndex, matchStart),
        isMention: false,
      });
    }
    
    // Try to find the member by matching the longest possible name
    let foundMember: MentionMember | undefined;
    let matchedName = "";
    
    // Try to match full name first, then progressively shorter
    const words = potentialName.split(/\s+/);
    
    for (let i = words.length; i > 0; i--) {
      const testName = words.slice(0, i).join(" ");
      const member = membersByName.get(testName.toLowerCase());
      
      if (member) {
        foundMember = member;
        matchedName = testName;
        break;
      }
    }
    
    if (foundMember) {
      // Found a valid mention
      parts.push({
        text: `@${matchedName}`,
        isMention: true,
        userId: foundMember.userId,
        memberName: foundMember.name,
      });
      
      // Add any remaining text after the matched name as regular text
      const remainingText = potentialName.slice(matchedName.length);
      if (remainingText) {
        parts.push({
          text: remainingText,
          isMention: false,
        });
      }
    } else {
      // Not a valid mention, treat as regular text
      parts.push({
        text: fullMatch,
        isMention: false,
      });
    }
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Add remaining text after last match
  if (lastIndex < content.length) {
    parts.push({
      text: content.slice(lastIndex),
      isMention: false,
    });
  }
  
  return parts;
}

/**
 * Скорочує ім'я для компактного відображення
 * "Коваленко Марія Дмитрівна" → "Коваленко М.Д."
 */
export function shortenName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 1) return parts[0];
  
  const lastName = parts[0];
  const initials = parts
    .slice(1)
    .map(p => `${p[0]}.`)
    .join("");
  
  return `${lastName} ${initials}`;
}
