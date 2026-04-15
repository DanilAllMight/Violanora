import { useEffect, useRef } from "react";

export const VideoPlayer = ({ stream, muted = false, className }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    if (video.srcObject === stream) return;

    video.srcObject = stream;

    // Хак: ждем, пока видео начнет играть, и «подталкиваем» звук
    const enableAudio = () => {
      video
        .play()
        .then(() => {
          if (!muted) {
            video.muted = false;
            video.volume = 1; // Ставим на 100%
          }
        })
        .catch(console.error);
    };

    video.onloadedmetadata = enableAudio;

    // КРИТИЧНО: Браузер может требовать клика.
    // Если после звонка звука нет — просто кликни в любое место страницы.
  }, [stream, muted]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted} // Для собеседника тут придет false
      className={`h-full w-full object-cover ${className}`}
      // Добавим это, чтобы браузер не сомневался
      onCanPlay={(e) => e.currentTarget.play()}
    />
  );
};
