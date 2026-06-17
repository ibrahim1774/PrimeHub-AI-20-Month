import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * /primebarber49 — concise single-screen lead funnel for barbershops.
 *
 * Flow:
 *   HERO  → big "$97/month" title + centred play button. The "WATCH VIDEO"
 *           CTA opens the quiz (no real VSL yet — drop a Wistia id into
 *           VSL_WISTIA_ID below to play a video before the quiz instead).
 *   QUIZ  → 3 single-select, auto-advancing questions. The progress bar
 *           starts at 50% on Q1 and fills to 100% by the form.
 *   FORM  → the GoHighLevel / LeadConnector embed (the real lead capture).
 *
 * Fully self-contained: no app state, no shared components.
 */

const GOLD = '#d4a64a';
const GOLD_DARK = '#8a6a1f';

// GoHighLevel embed (final step — the only thing that captures the lead).
const FORM_ID = 'bu1sXrMc7CkkCNlgVs3e';
const FORM_SRC = `https://api.leadconnectorhq.com/widget/form/${FORM_ID}`;

// Empty until a real VSL exists. When set, drop it into the hero video
// placeholder's poster/embed; left empty, the placeholder shows a poster image.
const VSL_VIDEO_URL = '';
// Barbershop poster behind the hero video placeholder (swap for a real frame).
const VIDEO_POSTER =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1280&q=70';

// When true, hero "Watch Video" goes straight to the GoHighLevel form.
// false = run the 3-question quiz (Q1→Q3) first, then a button to the form.
const SKIP_QUIZ = false;

type Phase = 'hero' | 'q1' | 'q2' | 'q3' | 'form';

interface QuizQuestion {
  key: Phase;
  prompt: string;
  options: string[];
  columns?: number;
}

const QUESTIONS: QuizQuestion[] = [
  {
    key: 'q1',
    prompt: 'What are you looking for in your barbershop website system?',
    options: [
      'A custom website',
      'Selling products',
      'Adding payment systems',
      'Booking & scheduling',
      'Staying in contact with customers',
      'All of the above',
    ],
    columns: 2,
  },
  {
    key: 'q2',
    prompt: 'Are you looking to move away from Booksy, The Cut, or any other booking link?',
    options: ['Yes', 'No'],
  },
  {
    key: 'q3',
    prompt: 'Are you okay with $97/month for the website system and everything?',
    options: ['Yes', "No"],
  },
];

// Progress bar literally starts at 50% on Q1, then fills to 100% by the form.
const PROGRESS: Record<Phase, number> = {
  hero: 0,
  q1: 50,
  q2: 70,
  q3: 88,
  form: 100,
};

// Fire-and-forget pixel helpers (index.html loads Meta + TikTok pixels).
const track = (event: string, custom = false) => {
  try {
    const w = window as any;
    if (w.fbq) w.fbq(custom ? 'trackCustom' : 'track', event);
    if (w.ttq) w.ttq.track(event);
  } catch {
    /* never block the funnel on analytics */
  }
};

const PlayIcon: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" className="ml-1.5">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const Check: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const PrimeBarber49: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('hero');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [preload, setPreload] = useState(false);
  const formHostRef = useRef<HTMLDivElement>(null);

  // Distinctive barbershop typography — signage display + elegant serif.
  useEffect(() => {
    const id = 'pb49-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,600;1,500;1,600&display=swap';
      document.head.appendChild(link);
    }
    document.title = 'PrimeBarber — Your Complete Barbershop System for $97/month';
  }, []);

  const goToQuiz = useCallback(() => {
    if (SKIP_QUIZ) {
      setPhase('form');
      return;
    }
    track('QuizStart', true);
    setPhase('q1');
  }, []);

  const answer = useCallback(
    (q: QuizQuestion, option: string) => {
      setSelected(option);
      setAnswers(prev => ({ ...prev, [q.key]: option }));
      // Last question: keep the choice highlighted and let the visitor tap the
      // explicit "Continue" button (below) to move on to the lead form.
      if (q.key === 'q3') {
        track('QuizComplete', true);
        return;
      }
      // brief beat so the selection animation reads, then advance
      window.setTimeout(() => {
        setSelected(null);
        setPhase(q.key === 'q1' ? 'q2' : 'q3');
      }, 280);
    },
    [],
  );

  // Warm up the GoHighLevel connection on mount and flag the form for
  // background preloading, so the iframe is fetched + sized while the visitor
  // is still on the hero/quiz — zero lag when they hit Continue after Q3.
  useEffect(() => {
    ['https://api.leadconnectorhq.com', 'https://link.msgsndr.com'].forEach(href => {
      const l = document.createElement('link');
      l.rel = 'preconnect';
      l.href = href;
      l.crossOrigin = 'anonymous';
      document.head.appendChild(l);
    });
    setPreload(true);
  }, []);

  // Load the GHL resize script as soon as the (hidden) iframe is mounted.
  useEffect(() => {
    if (!preload) return;
    const SRC = 'https://link.msgsndr.com/js/form_embed.js';
    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      document.body.appendChild(s);
    }
  }, [preload]);

  // Fire the Lead pixel event when the form is actually revealed.
  useEffect(() => {
    if (phase === 'form') track('Lead');
  }, [phase]);

  const inQuiz = phase === 'q1' || phase === 'q2' || phase === 'q3';
  const activeQuestion = QUESTIONS.find(q => q.key === phase);

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden text-white antialiased"
      style={{ fontFamily: '"Montserrat", "Avenir", sans-serif' }}
    >
      {/* ── Atmosphere: deep black + warm gold glow + barber-pole stripes ── */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: '#070707' }} />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, rgba(212,166,74,0.22), transparent 55%), radial-gradient(80% 60% at 50% 120%, rgba(212,166,74,0.10), transparent 60%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(125deg, #d4a64a 0 14px, transparent 14px 42px)',
        }}
      />

      <style>{`
        @keyframes pb49-ring { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(1.9); opacity: 0 } }
        @keyframes pb49-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
        @keyframes pb49-pop { 0% { transform: scale(.96) } 50% { transform: scale(1.015) } 100% { transform: scale(1) } }
        .pb49-display { font-family: "Bebas Neue", "Montserrat", sans-serif; letter-spacing: .02em; }
        .pb49-serif { font-family: "Playfair Display", Georgia, serif; }
        .pb49-in { animation: pb49-in .5s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>

      {/* ── Progress bar (quiz + form). Starts at 50%, fills to 100%. ── */}
      {(inQuiz || (phase === 'form' && !SKIP_QUIZ)) && (
        <div className="fixed left-0 right-0 top-0 z-20 h-[5px] bg-white/10">
          <div
            className="h-full rounded-r-full transition-[width] duration-700 ease-out"
            style={{
              width: `${PROGRESS[phase]}%`,
              background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD})`,
              boxShadow: `0 0 14px ${GOLD}aa`,
            }}
          />
        </div>
      )}

      <main className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-5 py-9 sm:px-6 sm:py-14 lg:max-w-2xl lg:py-20">
        {/* Wordmark */}
        <div className="pb49-in mb-5 flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.42em] text-white/70 sm:mb-7">
          <span className="h-px w-7" style={{ background: GOLD }} />
          PrimeBarber
          <span className="h-px w-7" style={{ background: GOLD }} />
        </div>

        {/* ─────────────── HERO ─────────────── */}
        {phase === 'hero' && (
          <div className="flex w-full flex-col items-center text-center">
            {/* Video placeholder — click play to watch how it works */}
            <button
              onClick={goToQuiz}
              aria-label="Watch the video"
              className="pb49-in group relative mb-6 w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] sm:mb-7"
              style={{ animationDelay: '.05s', aspectRatio: '16 / 9' }}
            >
              <img src={VIDEO_POSTER} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(7,7,7,0.35), rgba(7,7,7,0.78))' }} />

              {/* Play button */}
              <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center sm:h-24 sm:w-24">
                <span className="absolute inset-0 rounded-full" style={{ border: `2px solid ${GOLD}`, animation: 'pb49-ring 2.4s ease-out infinite' }} />
                <span
                  className="grid h-full w-full place-items-center rounded-full text-black shadow-[0_12px_40px_rgba(212,166,74,0.5)] transition-transform duration-300 group-hover:scale-105"
                  style={{ background: `radial-gradient(circle at 35% 30%, #f2d690, ${GOLD})` }}
                >
                  <PlayIcon />
                </span>
              </span>

              <span className="absolute bottom-3 left-0 right-0 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-white/85 sm:bottom-4 sm:text-xs">
                ▶ Watch Video — see how it works
              </span>
            </button>

            {/* Headline — concise value prop (kept compact so the CTA stays
                visible above the fold on mobile) */}
            <h1 className="pb49-in text-balance text-[1.7rem] font-extrabold leading-[1.18] sm:text-[2.1rem] lg:text-4xl" style={{ animationDelay: '.12s' }}>
              A <span style={{ color: GOLD }}>branded barber site</span> to sell your
              own products, get paid &amp; run a customer booking system.
            </h1>

            <p className="pb49-in mt-3 text-base font-bold text-white/80 sm:text-lg" style={{ animationDelay: '.18s' }}>
              Just <span style={{ color: GOLD }}>$97/month</span>.
            </p>

            {/* CTA */}
            <button
              onClick={goToQuiz}
              className="pb49-in mt-6 w-full max-w-sm rounded-full px-8 py-4 text-base font-extrabold uppercase tracking-widest text-black shadow-[0_14px_40px_rgba(212,166,74,0.4)] transition-all duration-200 hover:brightness-110 active:scale-[0.98] sm:max-w-md sm:py-5 sm:text-lg"
              style={{ animationDelay: '.26s', background: `linear-gradient(180deg, #f2d690, ${GOLD})` }}
            >
              ▶ Watch Video
            </button>

            <div className="pb49-in mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-wider text-white/45 sm:mt-6" style={{ animationDelay: '.32s' }}>
              <span>No contracts</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Cancel anytime</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Live in 24 hours</span>
            </div>
          </div>
        )}

        {/* ─────────────── QUIZ ─────────────── */}
        {inQuiz && activeQuestion && (
          <div key={activeQuestion.key} className="pb49-in w-full">
            <p className="mb-1.5 text-center text-xs font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Question {QUESTIONS.findIndex(q => q.key === activeQuestion.key) + 1} of {QUESTIONS.length}
            </p>
            <h2 className="mx-auto mb-8 max-w-md text-center text-2xl font-extrabold leading-snug sm:mb-10 sm:max-w-lg sm:text-3xl lg:text-[2rem]">
              {activeQuestion.prompt}
            </h2>

            <div
              className={`grid gap-3 sm:gap-4 ${activeQuestion.columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-2'}`}
            >
              {activeQuestion.options.map(option => {
                const isSel = selected === option;
                return (
                  <button
                    key={option}
                    onClick={() => answer(activeQuestion, option)}
                    className="group flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-[15px] font-semibold transition-all duration-200 hover:border-white/30 hover:bg-white/[0.07] active:scale-[0.98] sm:py-5 sm:text-base"
                    style={{
                      background: isSel ? 'rgba(212,166,74,0.14)' : 'rgba(255,255,255,0.04)',
                      borderColor: isSel ? GOLD : 'rgba(255,255,255,0.12)',
                      boxShadow: isSel ? `0 0 0 1px ${GOLD}, 0 10px 30px rgba(212,166,74,0.2)` : 'none',
                      animation: isSel ? 'pb49-pop .28s ease' : undefined,
                    }}
                  >
                    <span>{option}</span>
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors"
                      style={{
                        borderColor: isSel ? GOLD : 'rgba(255,255,255,0.25)',
                        background: isSel ? GOLD : 'transparent',
                        color: isSel ? '#000' : 'transparent',
                      }}
                    >
                      <Check />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* After Q3, an explicit button to the lead form */}
            {activeQuestion.key === 'q3' && answers.q3 && (
              <button
                onClick={() => setPhase('form')}
                className="mx-auto mt-7 block w-full max-w-sm rounded-full px-8 py-4 text-base font-extrabold uppercase tracking-widest text-black shadow-[0_14px_40px_rgba(212,166,74,0.4)] transition-all duration-200 hover:brightness-110 active:scale-[0.98] sm:max-w-md sm:py-5 sm:text-lg"
                style={{ background: `linear-gradient(180deg, #f2d690, ${GOLD})`, animation: 'pb49-in .4s ease both' }}
              >
                Continue →
              </button>
            )}
          </div>
        )}

        {/* ─────────────── FORM (GoHighLevel embed) ─────────────── */}
        {/* Heading, revealed only on the final step. */}
        {phase === 'form' && (
          <div className="pb49-in mb-5 flex w-full flex-col items-center text-center">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Last step
            </p>
            <h2 className="mb-1 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Get your $97/month system
            </h2>
            <p className="max-w-sm text-sm text-white/60 sm:text-base">
              Drop your details below and we&apos;ll get your barbershop set up.
            </p>
          </div>
        )}

        {/* Persistent embed — mounted + fetched/sized in the background from first
            paint (parked off-screen), then revealed in place on the form step so
            there's zero load wait after Continue. The SAME iframe stays mounted,
            so revealing it never re-fetches the form. */}
        {preload && (
          <div
            ref={formHostRef}
            aria-hidden={phase !== 'form'}
            className={
              phase === 'form'
                ? 'pb49-in w-full max-w-xl overflow-hidden rounded-2xl border border-white/10'
                : 'w-full max-w-xl overflow-hidden'
            }
            style={
              phase === 'form'
                ? undefined
                : { position: 'fixed', left: 0, top: 0, transform: 'translateX(-200vw)', opacity: 0, pointerEvents: 'none' }
            }
          >
            {/* Exact embed provided by GoHighLevel — form_embed.js auto-resizes
                the iframe to the form's real height. */}
            <iframe
              src={FORM_SRC}
              style={{ display: 'block', width: '100%', height: 600, border: 'none', borderRadius: 3 }}
              id={`inline-${FORM_ID}`}
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Barbershop"
              data-height="undefined"
              data-layout-iframe-id={`inline-${FORM_ID}`}
              data-form-id={FORM_ID}
              title="Barbershop"
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default PrimeBarber49;
