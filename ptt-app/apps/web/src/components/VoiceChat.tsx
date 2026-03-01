import { useEffect, useRef, useState } from "react";

interface Props {
  channelId: string;
}

export default function VoiceChat({ channelId }: Props) {
  const [isTalking, setIsTalking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  function handleTalkStart() {
    if (!streamRef.current) return;

    streamRef.current.getAudioTracks().forEach(track => {
      track.enabled = true;
    });

    setIsTalking(true);
  }

  function handleTalkEnd() {
    if (!streamRef.current) return;

    streamRef.current.getAudioTracks().forEach(track => {
      track.enabled = false;
    });

    setIsTalking(false);
  }

  // Mic connection
  useEffect(() => {
    async function connectMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        stream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });

        setIsConnected(true);
      } catch (err) {
        console.error(err);
      }
    }

    connectMic();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsConnected(false);
      setIsTalking(false);
    };
  }, [channelId]);

  // ✅ Keyboard PTT (SAFE VERSION)
  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault(); // stops page scrolling
        handleTalkStart();
      }
    }

    function up(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        handleTalkEnd();
      }
    }

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return (
    <div className="voice-chat">
      <h3>Connected to: {channelId}</h3>

      {isConnected && (
        <>
          <button
            className={isTalking ? "talk-btn active" : "talk-btn"}
            onMouseDown={handleTalkStart}
            onMouseUp={handleTalkEnd}
            onMouseLeave={handleTalkEnd}
          >
            {isTalking ? "Talking..." : "Hold to Talk"}
          </button>
        </>
      )}
    </div>
  );
}