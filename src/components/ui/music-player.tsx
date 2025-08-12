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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const suppressAutoplayRef = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUserToggled, setIsUserToggled] = useState(false);

  // Ensure we don't load the audio file until we actually intend to play
  const ensureSrcLoaded = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src) {
      audio.src = src;
      // Hint the browser to start fetching now that we've set src
      try {
        audio.load();
      } catch {
        // no-op
      }
    }
  };

  // Keep UI state in sync with the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    return () => {
      // Stop playback and fully detach source to avoid ghost playback on unmount/StrictMode re-mounts
      try {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      } catch {}
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  // Attempt autoplay; if blocked, start on first user interaction
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!autoPlayMusic || isUserToggled) return;

    const tryPlay = async () => {
      if (suppressAutoplayRef.current) return false;
      ensureSrcLoaded();
      try {
        await audio.play();
        setIsPlaying(true);
        return true;
      } catch {
        setIsPlaying(false);
        return false;
      }
    };

    let cleaned = false;
    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
    ];
    const cleanup = () => {
      if (cleaned) return;
      events.forEach((evt) => window.removeEventListener(evt, unlock, listenerOptions));
      cleaned = true;
    };
    const unlock = async (event: Event) => {
      // Ignore interactions originating inside the player UI (e.g., clicking the toggle)
      const targetNode = event.target as Node | null;
      if (targetNode && containerRef.current && containerRef.current.contains(targetNode)) {
        cleanup();
        return;
      }
      await tryPlay();
      cleanup();
    };
    const listenerOptions: AddEventListenerOptions = { once: true, passive: true };

    // Kick off an autoplay attempt; if blocked, wait for first interaction
    tryPlay().then((success) => {
      if (!success) {
        events.forEach((evt) => window.addEventListener(evt, unlock, listenerOptions));
      }
    });

    return cleanup;
  }, [autoPlayMusic, isUserToggled, src]);

  const toggle = () => {
    setIsUserToggled(true);
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const currentlyPlaying = !audio.paused;
    if (currentlyPlaying) {
      // User chose to pause; prevent any pending autoplay resume from overriding this
      suppressAutoplayRef.current = true;
      audio.pause();
      setIsPlaying(false);
    } else {
      suppressAutoplayRef.current = false;
      ensureSrcLoaded();
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed left-3 z-[60] md:bottom-3 bottom-24",
        "bg-background/80 backdrop-blur-md border border-border/60",
        "rounded-full shadow-lg",
        "p-2",
        className
      )}
      aria-label="Background music player"
    >
      <audio ref={audioRef} loop preload="none" playsInline />
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


