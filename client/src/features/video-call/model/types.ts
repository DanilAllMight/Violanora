// features/video-call/model/types.ts
export interface WebRTCSignal {
  type: "offer" | "answer" | "ice-candidate";
  payload: any; // Можно уточнить: RTCSessionDescriptionInit | RTCIceCandidate
  to: string;
  from?: string;
}
