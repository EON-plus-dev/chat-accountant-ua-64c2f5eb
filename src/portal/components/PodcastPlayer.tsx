import { useRef, useState, useCallback, useEffect } from "react";
import { Play, Pause, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  audioUrl: string;
  duration?: string;
}

const SPEEDS = [1, 1.5, 2, 0.75];

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const parseDuration = (d?: string): number => {
  if (!d) return 0;
  const parts = d.split(":").map(Number);
  return parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
};

export const PodcastPlayer = ({ audioUrl, duration }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(parseDuration(duration));
  const [speedIdx, setSpeedIdx] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => { if (audio.duration && isFinite(audio.duration)) setTotalDuration(audio.duration); };
    const onEnd = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => { audio.removeEventListener("timeupdate", onTime); audio.removeEventListener("loadedmetadata", onMeta); audio.removeEventListener("ended", onEnd); };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); } else { audio.play().catch(() => {}); }
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const cycleSpeed = useCallback(() => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  }, [speedIdx]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = ratio * totalDuration;
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  }, [totalDuration]);

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex items-center gap-4 mt-6">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <Button variant="outline" size="icon" onClick={togglePlay} className="shrink-0 h-10 w-10">
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </Button>

      <Headphones className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="h-2 rounded-full bg-secondary cursor-pointer" onClick={seek}>
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{fmt(currentTime)}</span>
          <span>{totalDuration > 0 ? fmt(totalDuration) : duration || "--:--"}</span>
        </div>
      </div>

      <button
        onClick={cycleSpeed}
        className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
      >
        {SPEEDS[speedIdx]}x
      </button>
    </div>
  );
};
