import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer";
import { PhoneOff } from "lucide-react";

interface CallOverlayProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onHangUp: () => void;
}

export const CallOverlay = ({
  localStream,
  remoteStream,
  onHangUp,
}: CallOverlayProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 p-4">
      <div className="relative grid h-[70vh] w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        {/* 1. Видео собеседника — УБИРАЕМ muted (по умолчанию в VideoPlayer он false, но здесь важно не поставить true) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <p className="absolute bottom-4 left-4 z-10 rounded bg-black/40 px-2 py-1 text-sm text-white">
            Собеседник
          </p>
          <VideoPlayer stream={remoteStream} muted={false} />
        </div>

        {/* 2. Ваше видео — muted={true} ОБЯЗАТЕЛЬНО, чтобы не было эха */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <p className="absolute bottom-4 left-4 z-10 rounded bg-black/40 px-2 py-1 text-sm text-white">
            Вы (Локально)
          </p>
          <VideoPlayer stream={localStream} muted={true} />
        </div>
      </div>

      {/* Кнопка сброса */}
      <button
        aria-label="Закончить звонок"
        onClick={onHangUp}
        className="mt-12 rounded-full bg-red-600 p-4 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-700 active:scale-95"
      >
        <PhoneOff size={32} />
      </button>
    </div>
  );
};
