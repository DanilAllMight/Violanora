import { useEffect, useRef } from "react";

export const VideoPlayer = ({ stream, muted = false, className }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    if (video.srcObject === stream) return;

    video.srcObject = stream;

    const enableAudio = () => {
      video.play().then(() => {
        if (!muted) {
          video.muted = false;
          video.volume = 1;
        }
      });
    };

    video.onloadedmetadata = enableAudio;
  }, [stream, muted]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`h-full w-full object-cover ${className}`}
      onCanPlay={(e) => e.currentTarget.play()}
    />
  );
};
