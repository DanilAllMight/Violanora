export interface WebRTCSignal {
  type: "offer" | "answer" | "ice-candidate";
  payload: any;
  to: string;
  from?: string;
}
