import React, { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';

type CallState = 'idle' | 'connecting' | 'live' | 'ending' | 'error';

interface Props {
  /** Either an assistant ID configured in the VAPI dashboard… */
  assistantId?: string;
  /** …or an inline assistant config (preferred — keeps voice + prompt in code). */
  assistantConfig?: any;
  assistantName?: string;
  headline?: string;
  sub?: string;
  compact?: boolean;
}

/**
 * In-page voice agent button. Uses VAPI Web SDK over WebRTC so audio
 * stays in the browser tab — no phone call, no page navigation.
 *
 * Requires VITE_VAPI_PUBLIC_KEY to be set at build time.
 * Configure the agent's voice, name, and system prompt in the VAPI
 * dashboard for the supplied assistantId.
 */
const VapiCallButton: React.FC<Props> = ({
  assistantId,
  assistantConfig,
  assistantName = 'Mia',
  headline = 'We’re available 24/7 to answer any questions',
  sub = 'Tap to call — a real-time voice conversation, right here in your browser.',
  compact = false,
}) => {
  const [state, setState] = useState<CallState>('idle');
  const [muted, setMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const vapiRef = useRef<Vapi | null>(null);
  const startTsRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const publicKey =
    ((import.meta as any).env?.VITE_VAPI_PUBLIC_KEY as string | undefined) ||
    '6a9a8a57-2776-4397-81b3-e9b9d9df9a9b';

  useEffect(() => {
    if (!publicKey) return;
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setState('live');
      startTsRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        if (startTsRef.current) setElapsed(Math.floor((Date.now() - startTsRef.current) / 1000));
      }, 1000);
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('trackCustom', 'VapiCallStarted', { assistantName });
      }
    });
    vapi.on('call-end', () => {
      setState('idle');
      setSpeaking(false);
      setMuted(false);
      setElapsed(0);
      startTsRef.current = null;
      if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    });
    vapi.on('speech-start', () => setSpeaking(true));
    vapi.on('speech-end', () => setSpeaking(false));
    vapi.on('error', (e: any) => {
      console.error('[Vapi]', e);
      setState('error');
      setErrorMsg(typeof e?.message === 'string' ? e.message : 'Call failed. Please try again.');
    });

    return () => {
      try { vapi.stop(); } catch {}
      if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [publicKey]);

  const startCall = async () => {
    setErrorMsg(null);
    if (!publicKey) {
      setState('error');
      setErrorMsg('Voice agent is not configured. (Missing VITE_VAPI_PUBLIC_KEY.)');
      return;
    }
    if (!vapiRef.current) return;
    try {
      setState('connecting');
      const target = assistantConfig ?? assistantId;
      if (!target) throw new Error('No assistant config or id provided.');
      await vapiRef.current.start(target);
    } catch (e: any) {
      console.error('[Vapi start]', e);
      setState('error');
      setErrorMsg(e?.message || 'Could not start the call. Check your mic permissions.');
    }
  };

  const endCall = () => {
    setState('ending');
    try { vapiRef.current?.stop(); } catch {}
  };

  const toggleMute = () => {
    if (!vapiRef.current) return;
    const next = !muted;
    try { vapiRef.current.setMuted(next); setMuted(next); } catch {}
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <>
      <style>{`
        .vc-card { position:relative; background:linear-gradient(160deg, #1a1a1a 0%, #0f0f0f 100%); color:#f5f0e0; border-radius:22px; padding:22px 22px; box-shadow:0 20px 50px rgba(0,0,0,.45), inset 0 0 0 2px rgba(201,169,110,.45); overflow:hidden; }
        .vc-card::before { content:''; position:absolute; inset:-2px; border-radius:22px; padding:2px; background:linear-gradient(135deg, rgba(201,169,110,.85), rgba(201,169,110,.2), rgba(201,169,110,.85)); -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; opacity:.6; }
        .vc-badge { display:inline-flex; align-items:center; gap:6px; background:#c9a96e; color:#0a0a0a; padding:5px 10px; border-radius:999px; font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; margin-bottom:10px; }
        .vc-badge-dot { width:6px; height:6px; border-radius:999px; background:#0a0a0a; animation:vcPulseDot 1.4s ease-in-out infinite; }
        @keyframes vcPulseDot { 0%,100% { opacity:.4 } 50% { opacity:1 } }
        .vc-h { font-family:'Inter', sans-serif; font-weight:800; font-size:20px; line-height:1.2; letter-spacing:-.01em; margin:0 0 6px; color:#f5f0e0; }
        .vc-sub { font-size:13px; line-height:1.5; color:#cfc8b8; margin:0 0 14px; }
        .vc-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .vc-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#c9a96e; color:#0a0a0a; border:0; border-radius:999px; padding:14px 22px; font-family:inherit; font-weight:900; font-size:15px; letter-spacing:.02em; cursor:pointer; box-shadow:0 10px 26px rgba(201,169,110,.40), inset 0 0 0 2px rgba(255,255,255,.25); transition:transform .15s ease, box-shadow .15s ease, background .15s ease; }
        .vc-btn:hover:not(:disabled) { transform:translateY(-2px); background:#d8b67a; box-shadow:0 16px 34px rgba(201,169,110,.55), inset 0 0 0 2px rgba(255,255,255,.35); }
        .vc-btn:disabled { opacity:.7; cursor:wait; }
        .vc-btn svg { width:18px; height:18px; }
        .vc-btn-pulse { position:relative; }
        .vc-btn-pulse::after { content:''; position:absolute; inset:-6px; border-radius:999px; box-shadow:0 0 0 0 rgba(201,169,110,.55); animation:vcPulse 1.8s cubic-bezier(.22,1,.36,1) infinite; pointer-events:none; }
        @keyframes vcPulse { 0% { box-shadow:0 0 0 0 rgba(201,169,110,.55); } 70% { box-shadow:0 0 0 18px rgba(201,169,110,0); } 100% { box-shadow:0 0 0 0 rgba(201,169,110,0); } }
        .vc-meta { display:flex; align-items:center; gap:8px; font-size:12px; color:#cfc8b8; }
        .vc-meta strong { color:#f5f0e0; font-weight:800; }
        .vc-status { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; font-size:12px; font-weight:700; background:rgba(201,169,110,.12); color:#c9a96e; box-shadow:inset 0 0 0 1px rgba(201,169,110,.30); }
        .vc-status-live { background:#1f3b22; color:#76e08c; box-shadow:inset 0 0 0 1px rgba(118,224,140,.40); }
        .vc-status-dot { width:8px; height:8px; border-radius:999px; background:currentColor; animation:vcPulseDot 1.2s ease-in-out infinite; }
        .vc-controls { display:flex; gap:8px; align-items:center; margin-top:12px; flex-wrap:wrap; }
        .vc-ctrl { display:inline-flex; align-items:center; justify-content:center; gap:6px; background:#1c1c1c; color:#f5f0e0; border:0; border-radius:999px; padding:10px 14px; font-family:inherit; font-weight:700; font-size:12px; cursor:pointer; box-shadow:inset 0 0 0 1px rgba(201,169,110,.30); transition:background .15s ease, transform .15s ease; }
        .vc-ctrl:hover { background:#2a2a2a; transform:translateY(-1px); }
        .vc-ctrl svg { width:14px; height:14px; }
        .vc-ctrl-end { background:#7a1f1f; color:#fff5f5; box-shadow:inset 0 0 0 1px rgba(255,140,140,.30); }
        .vc-ctrl-end:hover { background:#9a2a2a; }
        .vc-wave { display:inline-flex; gap:2px; align-items:flex-end; height:14px; }
        .vc-wave span { display:block; width:3px; background:#c9a96e; border-radius:2px; animation:vcWave 1s ease-in-out infinite; }
        .vc-wave span:nth-child(1) { animation-delay:0s; height:30%; }
        .vc-wave span:nth-child(2) { animation-delay:.15s; height:60%; }
        .vc-wave span:nth-child(3) { animation-delay:.3s; height:100%; }
        .vc-wave span:nth-child(4) { animation-delay:.45s; height:60%; }
        .vc-wave span:nth-child(5) { animation-delay:.6s; height:30%; }
        @keyframes vcWave { 0%,100% { transform:scaleY(.5) } 50% { transform:scaleY(1.2) } }
        .vc-err { margin-top:10px; padding:10px 12px; border-radius:10px; background:rgba(180,60,60,.15); color:#ff9b9b; font-size:12px; font-weight:600; box-shadow:inset 0 0 0 1px rgba(180,60,60,.35); }
        .vc-hint { font-size:11px; color:#8a8270; margin-top:10px; line-height:1.5; }

        .vc-card.vc-compact { padding:14px 16px; border-radius:16px; }
        .vc-card.vc-compact .vc-badge { font-size:9px; padding:4px 8px; margin-bottom:6px; }
        .vc-card.vc-compact .vc-h { font-size:16px; margin:0 0 4px; }
        .vc-card.vc-compact .vc-sub { font-size:12px; margin:0 0 10px; }
        .vc-card.vc-compact .vc-btn { padding:11px 18px; font-size:14px; }
        .vc-card.vc-compact .vc-btn svg { width:16px; height:16px; }
        .vc-card.vc-compact .vc-meta { font-size:11px; }
      `}</style>

      <section className={`vc-card${compact ? ' vc-compact' : ''}`} aria-live="polite">
        <div className="vc-badge"><span className="vc-badge-dot" />24/7 voice assistant</div>
        <h3 className="vc-h">{headline}</h3>
        <p className="vc-sub">{sub}</p>

        {state === 'idle' && (
          <div className="vc-row">
            <button type="button" className="vc-btn vc-btn-pulse" onClick={startCall} aria-label={`Start a call with ${assistantName}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Tap to call {assistantName}
            </button>
            <span className="vc-meta">Stays in this browser — <strong>no phone call</strong>.</span>
          </div>
        )}

        {state === 'connecting' && (
          <div className="vc-row">
            <button type="button" className="vc-btn" disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'vcPulseDot 1s linear infinite' }}><circle cx="12" cy="12" r="10"/></svg>
              Connecting…
            </button>
            <span className="vc-meta">Asking for mic permission</span>
          </div>
        )}

        {state === 'live' && (
          <>
            <div className="vc-row">
              <span className="vc-status vc-status-live">
                <span className="vc-status-dot" />
                Live with {assistantName} · {mm}:{ss}
              </span>
              {speaking && (
                <span className="vc-wave" aria-label={`${assistantName} is speaking`}>
                  <span/><span/><span/><span/><span/>
                </span>
              )}
            </div>
            <div className="vc-controls">
              <button type="button" className="vc-ctrl" onClick={toggleMute} aria-pressed={muted}>
                {muted ? (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>Unmute</>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>Mute</>
                )}
              </button>
              <button type="button" className="vc-ctrl vc-ctrl-end" onClick={endCall}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 9c-3.5 0-6.7.78-9.5 2.16v3.83c0 .42.18.84.5 1.13l2.27 1.97c.4.35.85.5 1.32.5.3 0 .62-.07.9-.21 1.13-.58 2.35-.93 3.63-1.05.51-.05.88-.46.88-.96v-2.4c1.83-.43 3.79-.43 5.62 0v2.4c0 .5.37.91.88.96 1.28.12 2.5.47 3.63 1.05.28.14.6.21.9.21.47 0 .92-.15 1.32-.5l2.27-1.97c.32-.29.5-.71.5-1.13v-3.83C18.7 9.78 15.5 9 12 9z" transform="rotate(135 12 12)"/></svg>
                End call
              </button>
            </div>
          </>
        )}

        {state === 'ending' && (
          <span className="vc-status">Ending…</span>
        )}

        {state === 'error' && (
          <>
            <div className="vc-row">
              <button type="button" className="vc-btn" onClick={startCall}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Try again
              </button>
            </div>
            {errorMsg && <div className="vc-err">{errorMsg}</div>}
          </>
        )}

      </section>
    </>
  );
};

export default VapiCallButton;
