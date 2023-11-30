"use client";

import { useState, useEffect, useRef } from "react";
import { Loader, Pause, Play } from "./assets";

interface Props {
  className?: string;
}

export default function ReadSonic({ className }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const synthesizePost = async () => {
    if (audioSrc) {
      togglePlay();
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const payload = {
      origin: window.location.origin,
      slug: window.location.pathname,
    };

    try {
      const response = await fetch("https://api.readsonic.io/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      setAudioSrc(data.content);
      setIsPlaying(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className={className}
        onClick={synthesizePost}
        aria-label="Play audio"
      >
        {isLoading ? (
          <Loader sx={{ animation: "spin 1s linear infinite" }} />
        ) : isPlaying ? (
          <Pause />
        ) : (
          <Play />
        )}
      </button>
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {audioSrc && (
          <audio id="audio" ref={audioRef} controls src={audioSrc} autoPlay>
            Your browser does not support the <code>audio</code> element.
          </audio>
        )}
      </div>
    </>
  );
}
