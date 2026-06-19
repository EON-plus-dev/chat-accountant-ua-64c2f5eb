import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  email?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 45%)`;
};

const UserAvatar = ({ name, email, imageUrl, size = "md", className }: UserAvatarProps) => {
  const initials = getInitials(name);
  const bgColor = stringToColor(email || name);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={name} />
      ) : null}
      <AvatarFallback style={{ backgroundColor: bgColor }} className="text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
