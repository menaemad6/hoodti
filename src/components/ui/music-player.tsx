import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentTenant } from "@/context/TenantContext";

type MusicPlayerProps = {
  className?: string;
  src?: string;
};

// Global background music player with sticky bottom-left control
const MusicPlayer: React.FC<MusicPlayerProps> = ({ className, src = "/house-music-1.mp3" }) => {
  const currentTenant = useCurrentTenant();
  const autoPlayMusic = currentTenant?.autoPlayMusic === true;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUserToggled, setIsUserToggled] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    // Respect tenant autoPlay flag, but browsers often block autoplay without interaction
    if (autoPlayMusic && !isUserToggled) {
      const playAttempt = audioRef.current.play();
      if (playAttempt && typeof (playAttempt as Promise<void>).then === "function") {
        (playAttempt as Promise<void>)
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked; show paused state until user clicks
            setIsPlaying(false);
          });
      }
    }
  }, [autoPlayMusic, isUserToggled]);

  const toggle = () => {
    setIsUserToggled(true);
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <div
      className={cn(
        "fixed left-3 z-[60] md:bottom-3 bottom-24",
        "bg-background/80 backdrop-blur-md border border-border/60",
        "rounded-full shadow-lg",
        "p-2",
        className
      )}
      aria-label="Background music player"
    >
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        onClick={toggle}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5",
          "rounded-full",
          isPlaying ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          "hover:opacity-90 transition-opacity"
        )}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-xs font-medium hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
      </button>
    </div>
  );
};

export default MusicPlayer;


