import { Play, Video } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Props {
  videoUrl: string;
  duration?: string;
}

const isYouTube = (url: string) => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

export const VideoPlayer = ({ videoUrl, duration }: Props) => {
  const isPlaceholder = !videoUrl || videoUrl === "#";

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 overflow-hidden mt-6">
      <AspectRatio ratio={16 / 9}>
        {isPlaceholder ? (
          <div className="flex flex-col items-center justify-center h-full bg-muted/50 gap-3">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
              <Play className="h-7 w-7 text-primary ml-1" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Відео буде доступне незабаром
            </p>
            {duration && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Video className="h-3.5 w-3.5" /> {duration}
              </span>
            )}
          </div>
        ) : isYouTube(videoUrl) ? (
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <video
            src={videoUrl}
            controls
            className="h-full w-full object-cover"
            preload="metadata"
          />
        )}
      </AspectRatio>
    </div>
  );
};
