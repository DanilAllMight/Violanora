import { useUserStore } from "@/entities/User/model/store";
import { useSocket } from "@/shared/api";
import { useEffect, useState, useCallback, useRef } from "react";

export const useCallConversationSocket = (targetId: string | undefined) => {
  const user = useUserStore((state) => state.authData);
  const { socket, subscribe } = useSocket(user?.id);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  const [incomingCall, setIncomingCall] = useState<{
    from: string;
    offer: any;
  } | null>(null);

  const processIceQueue = useCallback(async () => {
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      if (candidate && pc.current) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      }
    }
  }, []);

  const setupPeer = useCallback(
    (id: string) => {
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peer.onicecandidate = (event) => {
        if (event.candidate && socket?.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "ice-candidate",
              to: id,
              payload: event.candidate,
            }),
          );
        }
      };

      peer.ontrack = (event) => {
        const stream = event.streams[0];
        setRemoteStream(stream);
      };

      pc.current = peer;
      return peer;
    },
    [socket],
  );

  useEffect(() => {
    const unsubscribe = subscribe(async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "offer") {
          setIncomingCall({ from: data.from, offer: data.payload });
        }

        if (data.type === "hangup") {
          stopAllTracks();
        }

        if (data.type === "answer") {
          if (pc.current) {
            await pc.current.setRemoteDescription(
              new RTCSessionDescription(data.payload),
            );
            await processIceQueue();
          }
        }

        if (data.type === "ice-candidate") {
          if (pc.current?.remoteDescription) {
            try {
              await pc.current.addIceCandidate(
                new RTCIceCandidate(data.payload),
              );
            } catch (e) {}
          } else {
            iceCandidatesQueue.current.push(data.payload);
          }
        }
      } catch (e) {}
    });

    return () => {
      unsubscribe();
      localStream?.getTracks().forEach((t) => t.stop());
      pc.current?.close();
    };
  }, [targetId, user?.id, subscribe]);

  const acceptCall = async () => {
    if (!incomingCall) return;

    const { from, offer } = incomingCall;
    const peer = setupPeer(from);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      await processIceQueue();

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "answer",
            to: from,
            payload: answer,
          }),
        );
      }

      setIncomingCall(null);
    } catch (e) {}
  };

  const hangUp = () => {
    socket?.send(JSON.stringify({ type: "hangup", to: targetId }));
    stopAllTracks();
  };

  const rejectCall = () => {
    if (incomingCall && socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "hangup",
          to: incomingCall.from,
        }),
      );
    }
    setIncomingCall(null);
    iceCandidatesQueue.current = [];
  };

  const startCall = async () => {
    if (!targetId) return;
    const peer = setupPeer(targetId);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket?.send(
      JSON.stringify({ type: "offer", to: targetId, payload: offer }),
    );
  };

  const stopAllTracks = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (pc.current) {
      pc.current.onicecandidate = null;
      pc.current.ontrack = null;
      pc.current.close();
      pc.current = null;
    }

    iceCandidatesQueue.current = [];

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
  }, [localStream]);

  return {
    startCall,
    localStream,
    remoteStream,
    hangUp,
    acceptCall,
    rejectCall,
    incomingCall,
  };
};
