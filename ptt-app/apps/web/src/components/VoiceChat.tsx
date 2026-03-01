import { useEffect, useRef, useState } from "react";

interface Props {
  channelId: string;
}

// Inline mic SVG — no external dependency needed
function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32" aria-hidden>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h-3v2h8v-2h-3v-2.06A9 9 0 0 0 21 12v-2h-2z" />
    </svg>
  );
}

export default function VoiceChat({ channelId }: Props) {
  const [isTalking, setIsTalking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  // 0–1 amplitude driven by Web Audio AnalyserNode
  const [audioLevel, setAudioLevel] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  // Ref mirror of isTalking so RAF callbacks never capture a stale closure
  const isTalkingRef = useRef(false);

  // ── Audio level polling ────────────────────────────────────────────────────
  function pollLevel() {
    if (!analyserRef.current || !isTalkingRef.current) {
      setAudioLevel(0);
      return;
    }
    const data = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(data);

    // RMS amplitude — gives a clean 0–1 energy reading
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    setAudioLevel(Math.min(rms * 6, 1));

    animFrameRef.current = requestAnimationFrame(pollLevel);
  }

  // ── PTT handlers ──────────────────────────────────────────────────────────
  function handleTalkStart() {
    if (!streamRef.current || isTalkingRef.current) return;
    // Resume AudioContext if the browser suspended it before a user gesture
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
    streamRef.current.getAudioTracks().forEach((t) => { t.enabled = true; });
    isTalkingRef.current = true;
    setIsTalking(true);
    pollLevel();
  }

  function handleTalkEnd() {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach((t) => { t.enabled = false; });
    isTalkingRef.current = false;
    setIsTalking(false);
    cancelAnimationFrame(animFrameRef.current);
    setAudioLevel(0);
  }

  // ── Mic + analyser setup ──────────────────────────────────────────────────
  useEffect(() => {
    async function connectMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        // Keep tracks muted until the user holds the button
        stream.getAudioTracks().forEach((t) => { t.enabled = false; });

        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
        analyserRef.current = analyser;
        audioCtxRef.current = ctx;

        setIsConnected(true);
      } catch (err) {
        setPermissionError("Microphone access denied.");
        console.error("VoiceChat mic error:", err);
      }
    }

    connectMic();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      isTalkingRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
      setIsConnected(false);
      setIsTalking(false);
      setAudioLevel(0);
    };
  }, [channelId]);

  // ── Spacebar PTT ──────────────────────────────────────────────────────────
  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.code === "Space") { e.preventDefault(); handleTalkStart(); }
    }
    function up(e: KeyboardEvent) {
      if (e.code === "Space") { e.preventDefault(); handleTalkEnd(); }
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived visuals ────────────────────────────────────────────────────────
  // Scale driven directly by audio level — no CSS transition so it feels instant
  const scale = isTalking ? 1 + audioLevel * 0.28 : 1;
  const glowRadius = isTalking ? Math.round(8 + audioLevel * 30) : 0;
  const glowAlpha = isTalking ? (0.35 + audioLevel * 0.65).toFixed(2) : "0";

  if (permissionError) {
    return <p className="mic-error">{permissionError}</p>;
  }

  if (!isConnected) {
    return <p className="mic-loading">Connecting microphone…</p>;
  }

  return (
    <div className="mic-widget">
      <button
        className={`mic-btn${isTalking ? " mic-btn--active" : ""}`}
        onMouseDown={handleTalkStart}
        onMouseUp={handleTalkEnd}
        onMouseLeave={handleTalkEnd}
        onTouchStart={(e) => { e.preventDefault(); handleTalkStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); handleTalkEnd(); }}
        aria-label={isTalking ? "Transmitting" : "Hold to talk"}
        style={{
          transform: `scale(${scale.toFixed(3)})`,
          boxShadow: isTalking
            ? `0 0 ${glowRadius}px rgba(239,68,68,${glowAlpha}), 0 0 ${glowRadius * 2}px rgba(239,68,68,${(Number(glowAlpha) * 0.35).toFixed(2)})`
            : "none",
        }}
      >
        <MicIcon />
      </button>
      <span className="mic-label">
        {isTalking ? "Transmitting…" : "Hold to talk · Space"}
      </span>
    </div>
  );
}
