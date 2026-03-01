import { useState, useEffect, useRef, useCallback } from 'react';
import {
  intro,
  insights,
  designOpportunities,
  designIntro,
  pov,
} from '../data/emergingSynthesis';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Question {
  id: string;
  sectionId: string;
  text: string;
  author: string;
  timestamp: string;
}

type ReactionType = 'surprising' | 'seen-this' | 'tell-more';
type ReactionsMap = Record<string, Record<string, number>>;

// ─── Chapter definitions for nav ────────────────────────────────────────────
const chapters = [
  { id: 'why-not-enter', nav: 'I · The Door' },
  { id: 'what-keeps-scaling', nav: 'II · The Scale' },
  { id: 'system-fails', nav: 'III · The System' },
  { id: 'part-ii', nav: 'IV · Opportunities' },
];

// ─── Intersection Observer ───────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedStat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const { ref, isVisible } = useInView(0.3);
  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="font-display text-4xl md:text-6xl text-stone-800 tracking-tight">{value}</div>
      <div className="font-ui text-[10px] uppercase tracking-[0.25em] text-stone-400 mt-3">{label}</div>
    </div>
  );
}

// ─── Reading Progress ────────────────────────────────────────────────────────
function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-50 bg-stone-200/30">
      <div
        className="h-full bg-gradient-to-r from-amber-700 to-amber-500 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── Sticky Nav with chapters ───────────────────────────────────────────────
function StickyNav({ currentInsight }: { currentInsight: number }) {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.8);
      for (const ch of [...chapters].reverse()) {
        const el = document.getElementById(ch.id);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActive(ch.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (!show) return null;

  return (
    <nav className="fixed top-4 left-0 w-full z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-white/90 backdrop-blur-md rounded-full border border-stone-200/80 px-2 py-1.5 flex items-center gap-1 shadow-lg shadow-stone-900/5 font-ui">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => scrollTo(ch.id)}
            className={`px-3.5 py-1.5 text-[9px] tracking-widest uppercase transition-all whitespace-nowrap rounded-full ${
              active === ch.id
                ? 'bg-stone-800 text-white'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
          >
            {ch.nav}
          </button>
        ))}
        {active !== 'part-ii' && currentInsight > 0 && (
          <span className="text-[9px] text-stone-400 tracking-wider ml-1 pr-1 font-ui">
            {currentInsight}/{insights.length}
          </span>
        )}
      </div>
    </nav>
  );
}

// ─── Chapter Title Page ─────────────────────────────────────────────────────
function ChapterPage({
  children,
  id,
  bg = 'white',
}: {
  children: React.ReactNode;
  id: string;
  bg?: 'white' | 'cream' | 'dark' | 'olive';
}) {
  const { ref, isVisible } = useInView(0.2);
  const bgClass =
    bg === 'cream' ? 'bg-cream' :
    bg === 'dark' ? 'bg-stone-900' :
    bg === 'olive' ? 'bg-[#3d3b2f]' :
    'bg-white';

  return (
    <div
      ref={ref}
      id={id}
      className={`min-h-[50vh] md:min-h-[60vh] flex items-center px-6 md:px-12 lg:px-20 ${bgClass} relative overflow-hidden`}
    >
      <div className={`relative z-10 max-w-3xl transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}>
        {children}
      </div>
    </div>
  );
}

// ─── Statement Page (full viewport quote) ───────────────────────────────────
function StatementPage({ text, bg = 'white' }: { text: string; bg?: 'white' | 'cream' | 'dark' }) {
  const { ref, isVisible } = useInView(0.2);
  const bgClass = bg === 'cream' ? 'bg-cream' : bg === 'dark' ? 'bg-stone-900' : 'bg-white';
  const textClass = bg === 'dark' ? 'text-stone-200' : 'text-stone-800';

  return (
    <div ref={ref} className={`min-h-[70vh] flex items-center justify-center px-6 md:px-16 ${bgClass}`}>
      <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <p className={`font-display text-2xl md:text-4xl lg:text-5xl ${textClass} leading-[1.2] tracking-tight italic`}>
          "{text}"
        </p>
      </div>
    </div>
  );
}

// ─── Reaction Chips with inline response ────────────────────────────────────
function ReactionChips({
  sectionId,
  reactions,
  questions,
  onReact,
  onSubmitQuestion,
}: {
  sectionId: string;
  reactions: ReactionsMap;
  questions: Question[];
  onReact: (sectionId: string, reaction: ReactionType) => void;
  onSubmitQuestion: (sectionId: string, text: string, author: string) => void;
}) {
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseName, setResponseName] = useState('');
  const sectionReactions = reactions[sectionId] || {};
  const sectionQuestions = questions.filter((q) => q.sectionId === sectionId);

  const handleReact = (reaction: ReactionType) => {
    if (reaction === 'tell-more') {
      setShowResponse(true);
      return;
    }
    if (voted.has(reaction)) return;
    setVoted((prev) => new Set(prev).add(reaction));
    onReact(sectionId, reaction);
  };

  const handleSubmitResponse = () => {
    if (!responseText.trim()) return;
    onSubmitQuestion(sectionId, responseText, responseName);
    setResponseText('');
    setResponseName('');
    setShowResponse(false);
  };

  const quickChips: { key: ReactionType; label: string; icon: string }[] = [
    { key: 'surprising', label: 'Surprising', icon: '!' },
    { key: 'seen-this', label: "I've seen this", icon: '✓' },
  ];

  return (
    <div className="mt-10 pt-6 border-t border-stone-100">
      <div className="flex flex-wrap gap-2">
        {quickChips.map((chip) => {
          const count = sectionReactions[chip.key] || 0;
          const isActive = voted.has(chip.key);
          return (
            <button
              key={chip.key}
              onClick={() => handleReact(chip.key)}
              className={`reaction-chip inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-ui tracking-wider transition-all ${
                isActive
                  ? 'bg-stone-800 text-white active'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-700 border border-stone-200/60'
              }`}
            >
              <span className="text-[10px]">{chip.icon}</span>
              <span>{chip.label}</span>
              {count > 0 && (
                <span className={`text-[10px] ${isActive ? 'text-stone-400' : 'text-stone-300'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => handleReact('tell-more')}
          className={`reaction-chip inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-ui tracking-wider transition-all ${
            showResponse
              ? 'bg-stone-800 text-white active'
              : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-700 border border-stone-200/60'
          }`}
        >
          <span className="text-[10px]">↔</span>
          <span>Confirm or complicate</span>
        </button>
      </div>

      {showResponse && (
        <div className="mt-4 space-y-2 max-w-md">
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Share your perspective on this insight..."
            className="w-full text-xs text-stone-600 bg-white border border-stone-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 font-ui"
            rows={3}
            autoFocus
          />
          <input
            value={responseName}
            onChange={(e) => setResponseName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full text-xs text-stone-600 bg-white border border-stone-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 font-ui"
          />
          <div className="flex gap-3">
            <button
              onClick={handleSubmitResponse}
              className="text-[10px] font-ui tracking-wider uppercase text-stone-600 hover:text-stone-800 transition-colors"
            >
              Submit
            </button>
            <button
              onClick={() => { setShowResponse(false); setResponseText(''); setResponseName(''); }}
              className="text-[10px] font-ui tracking-wider uppercase text-stone-400 hover:text-stone-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {sectionQuestions.length > 0 && (
        <div className="mt-4 pl-4 border-l border-stone-200 space-y-3">
          {sectionQuestions.map((q) => (
            <div key={q.id}>
              <p className="text-xs text-stone-500 leading-relaxed font-ui">{q.text}</p>
              <p className="text-[10px] text-stone-400 mt-1 font-ui">
                {q.author || 'Anonymous'} · {new Date(q.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Margin Question ────────────────────────────────────────────────────────
function MarginAnnotation({
  sectionId,
  questions,
  onSubmit,
}: {
  sectionId: string;
  questions: Question[];
  onSubmit: (sectionId: string, text: string, author: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const sectionQuestions = questions.filter((q) => q.sectionId === sectionId);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(sectionId, text, author);
    setText('');
    setAuthor('');
    setOpen(false);
  };

  return (
    <div className="mt-6">
      {sectionQuestions.length > 0 && (
        <div className="mb-4 pl-4 border-l border-stone-200 space-y-3">
          {sectionQuestions.map((q) => (
            <div key={q.id}>
              <p className="text-xs text-stone-500 leading-relaxed font-ui">{q.text}</p>
              <p className="text-[10px] text-stone-400 mt-1 font-ui">
                {q.author} · {new Date(q.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-1.5 text-stone-300 hover:text-stone-500 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-60 group-hover:opacity-100">
            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] font-ui tracking-wider uppercase">Leave a question</span>
        </button>
      ) : (
        <div className="space-y-2 max-w-md">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What question does this raise for you?"
            className="w-full text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-stone-400 font-ui"
            rows={3}
            autoFocus
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-stone-400 font-ui"
          />
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="text-[10px] font-ui tracking-wider uppercase text-stone-600 hover:text-stone-800 transition-colors"
            >
              Submit
            </button>
            <button
              onClick={() => { setOpen(false); setText(''); setAuthor(''); }}
              className="text-[10px] font-ui tracking-wider uppercase text-stone-400 hover:text-stone-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Insight Block ──────────────────────────────────────────────────────────
function InsightBlock({
  insight,
  questions,
  reactions,
  onSubmitQuestion,
  onReact,
}: {
  insight: (typeof insights)[0];
  questions: Question[];
  reactions: ReactionsMap;
  onSubmitQuestion: (sectionId: string, text: string, author: string) => void;
  onReact: (sectionId: string, reaction: ReactionType) => void;
}) {
  const { ref, isVisible } = useInView(0.08);
  const num = String(insight.number).padStart(2, '0');

  return (
    <div
      ref={ref}
      id={insight.id}
      className={`relative py-20 md:py-28 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="relative">
        {/* Number + rule header */}
        <div className="flex items-center gap-4 mb-10">
          <span className="font-ui text-[11px] text-stone-300 tracking-widest">{num}</span>
          <div className="flex-1 h-[1px] bg-stone-200/70" />
        </div>

        {/* Title - large editorial headline */}
        <h3 className="font-display text-[28px] md:text-[40px] lg:text-[44px] text-stone-800 leading-[1.1] tracking-tight mb-5 max-w-2xl">
          {insight.title}
        </h3>

        {/* Subtitle as italic deck */}
        <p className="font-body text-[15px] md:text-[17px] text-stone-400 italic leading-relaxed mb-12 max-w-xl">
          {insight.subtitle}
        </p>

        {/* Body with drop cap on first paragraph */}
        <div className="max-w-2xl">
          {insight.body.map((para, i) => (
            <p
              key={i}
              className={`font-body text-stone-600 leading-[1.95] text-[16px] ${
                i === 0
                  ? 'first-letter:font-display first-letter:text-[3.4em] first-letter:leading-[0.8] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-stone-800 mb-6'
                  : 'mb-6'
              }`}
            >
              {para}
            </p>
          ))}
        </div>

        <ReactionChips
          sectionId={insight.id}
          reactions={reactions}
          questions={questions}
          onReact={onReact}
          onSubmitQuestion={onSubmitQuestion}
        />
      </div>
    </div>
  );
}

// ─── Design Opportunity Card ─────────────────────────────────────────────────
function DesignCard({
  opportunity,
  index,
  questions,
  onSubmitQuestion,
}: {
  opportunity: (typeof designOpportunities)[0];
  index: number;
  questions: Question[];
  onSubmitQuestion: (sectionId: string, text: string, author: string) => void;
}) {
  const { ref, isVisible } = useInView(0.1);
  const [open, setOpen] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  return (
    <div
      ref={ref}
      id={opportunity.id}
      className={`transition-all duration-700 flex flex-col ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${(index % 2) * 100}ms` }}
    >
      {/* Card */}
      <div
        className={`w-full flex-1 flex flex-col text-left group transition-all duration-500 relative overflow-hidden rounded-2xl ${
          open
            ? 'bg-stone-900 shadow-2xl shadow-stone-900/20'
            : 'bg-white border border-stone-200/60 hover:bg-stone-800 hover:border-stone-800 hover:shadow-xl hover:shadow-stone-900/10 [&:hover_p]:text-stone-100 [&:hover_span]:text-stone-400'
        }`}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex-1 text-left p-8 md:p-10 relative"
        >
          {/* Number badge */}
          <span className={`inline-block font-ui text-[11px] tracking-widest mb-5 transition-colors duration-300 ${
            open ? 'text-amber-400/60' : 'text-stone-300 group-hover:text-amber-800/50'
          }`}>
            {num}
          </span>

          {/* The full question as a sentence */}
          <p className={`font-display text-[20px] md:text-[24px] leading-[1.35] tracking-tight transition-colors duration-300 pr-6 ${
            open ? 'text-stone-100' : 'text-stone-800'
          }`}>
            {opportunity.question}
          </p>

          {!open && (
            <p className="font-ui text-[10px] text-stone-400 tracking-wider uppercase mt-5 transition-colors group-hover:text-stone-500/70">
              {opportunity.title}
            </p>
          )}
        </button>

        {/* Close X button — top-right, only when open */}
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-stone-800 hover:bg-stone-700 transition-colors duration-200"
            aria-label="Close card"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-stone-400 hover:text-stone-200">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Expand CTA bar */}
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-8 md:px-10 py-4 transition-all duration-300 ${
            open
              ? 'border-t border-stone-700/50'
              : 'border-t border-stone-100 group-hover:border-stone-700'
          }`}
        >
          <span className={`font-ui text-[10px] tracking-widest uppercase transition-colors duration-300 ${
            open ? 'text-amber-400/70' : 'text-stone-400 group-hover:text-amber-400/70'
          }`}>
            {open ? 'Close' : 'Explore this opportunity'}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className={`transition-all duration-300 ${
              open ? 'rotate-180 text-amber-400/50' : 'text-stone-300 group-hover:text-amber-400/50'
            }`}
          >
            <path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Expanded content */}
        <div className={`overflow-hidden transition-all duration-500 ${
          open ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-8 md:px-10 pb-10 pt-2">
            <h3 className="font-display text-xl md:text-2xl text-stone-100 leading-snug tracking-tight mb-6">
              {opportunity.title}
            </h3>

            <div className="space-y-4 mb-8">
              {opportunity.body.map((para, i) => (
                <p key={i} className="font-body text-stone-400 leading-[1.85] text-[15px]">
                  {para}
                </p>
              ))}
            </div>

            <p className="font-ui text-[10px] tracking-[0.25em] uppercase text-stone-500 mb-5">
              What this could look like
            </p>
            <div className="space-y-5 pl-5 border-l border-amber-400/20">
              {opportunity.proposals.map((proposal, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-amber-400/40 text-xs mt-0.5 shrink-0">&#x2726;</span>
                  <p className="font-body text-stone-500 leading-[1.85] text-sm">
                    {proposal}
                  </p>
                </div>
              ))}
            </div>

            <div className="[&_button]:text-stone-500 [&_button:hover]:text-stone-300 [&_textarea]:bg-stone-800 [&_textarea]:border-stone-700 [&_textarea]:text-stone-300 [&_input]:bg-stone-800 [&_input]:border-stone-700 [&_input]:text-stone-300 [&_p]:text-stone-400">
              <MarginAnnotation
                sectionId={opportunity.id}
                questions={questions}
                onSubmit={onSubmitQuestion}
              />
            </div>

            {/* Bottom close button */}
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors duration-200"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-stone-500">
                <path d="M2 7.5l4-4 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-ui text-[10px] tracking-widest uppercase text-stone-500">
                Close
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function EmergingSynthesis() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reactions, setReactions] = useState<ReactionsMap>({});
  const [currentInsight, setCurrentInsight] = useState(0);

  useEffect(() => {
    fetch('/api/questions').then((r) => r.json()).then(setQuestions).catch(() => {});
    fetch('/api/reactions').then((r) => r.json()).then(setReactions).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => {
      for (let i = insights.length - 1; i >= 0; i--) {
        const el = document.getElementById(insights[i].id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) {
          setCurrentInsight(i + 1);
          return;
        }
      }
      setCurrentInsight(0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitQuestion = useCallback(async (sectionId: string, text: string, author: string) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, text, author }),
      });
      if (res.ok) {
        const newQ = await res.json();
        setQuestions((prev) => [...prev, newQ]);
      }
    } catch {}
  }, []);

  const submitReaction = useCallback(async (sectionId: string, reaction: ReactionType) => {
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, reaction }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReactions((prev) => ({ ...prev, [sectionId]: updated }));
      }
    } catch {}
  }, []);

  const insightsBySection = {
    'why-not-enter': insights.filter((i) => i.section === 'why-not-enter'),
    'what-keeps-scaling': insights.filter((i) => i.section === 'what-keeps-scaling'),
    'system-fails': insights.filter((i) => i.section === 'system-fails'),
  };

  return (
    <div className="min-h-screen bg-white">
      <ProgressBar />
      <StickyNav currentInsight={currentInsight} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <header className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 py-20 bg-cream">
        <div className="max-w-4xl mx-auto w-full">
          <p className="font-ui text-[10px] text-stone-400 uppercase tracking-[0.3em] mb-16">
            Stanford Graduate School of Business
          </p>

          <h1 className="font-display text-5xl md:text-7xl lg:text-[90px] text-stone-800 leading-[0.95] tracking-tight mb-8">
            Why Climate Capital
            <br />
            Gets <span className="italic text-amber-800/80">Stuck</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-stone-500 leading-relaxed max-w-lg mb-6">
            The infrastructure problem blocking high net worth investment in climate solutions
          </p>

          <div className="w-16 h-[1px] bg-amber-800/30 mb-12" />

          <div className="flex flex-col md:flex-row md:items-end md:gap-16">
            <div>
              <p className="font-ui text-sm text-stone-700 tracking-wide">
                Nazlican Goksu
              </p>
              <p className="font-ui text-xs text-stone-400 tracking-wider mt-1">
                GEN 390 Independent Research · 2026
              </p>
            </div>
            <p className="font-ui text-[11px] text-stone-400 mt-4 md:mt-0 max-w-xs leading-relaxed">
              Emerging findings from interviews with investors, fund managers, and family office practitioners across 5 countries
            </p>
          </div>

          <div className="mt-24 flex justify-center">
            <button
              onClick={() => document.getElementById('intro-text')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-stone-300 hover:text-stone-500 transition-colors animate-bounce"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Intro ────────────────────────────────────────────────────────────── */}
      <section id="intro-text" className="px-6 md:px-12 py-24 md:py-36">
        <div className="max-w-2xl mx-auto">
          <p className="font-body text-[20px] md:text-[22px] text-stone-700 leading-[1.8] mb-12">
            {intro.lead}
          </p>

          {intro.paragraphs.map((para, i) => {
            const { ref, isVisible } = useInView(0.1);
            const editorialPhrase = 'The first is getting family offices through the door. The second is making their capital catalytic once it arrives.';
            const hasEditorial = para.includes(editorialPhrase);
            return hasEditorial ? (
              <div
                key={i}
                ref={ref}
                className={`mb-8 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <p className="font-body text-[17px] text-stone-600 leading-[1.95]">
                  {para.split(editorialPhrase)[0]}
                </p>
                <p className="font-display text-[22px] md:text-[26px] text-stone-800 leading-[1.45] tracking-tight my-8 border-l-2 border-amber-700/40 pl-6">
                  The first is getting family offices through the door.
                  <br />
                  The second is making their capital catalytic once it arrives.
                </p>
                {para.split(editorialPhrase)[1] && (
                  <p className="font-body text-[17px] text-stone-600 leading-[1.95]">
                    {para.split(editorialPhrase)[1]}
                  </p>
                )}
              </div>
            ) : (
              <p
                key={i}
                ref={ref}
                className={`transition-all duration-700 mb-7 ${
                  i === 0
                    ? 'font-body text-[20px] md:text-[22px] text-stone-700 leading-[1.8]'
                    : 'font-body text-[17px] text-stone-600 leading-[1.95]'
                } ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {para}
              </p>
            );
          })}
        </div>
      </section>

      {/* ── Stats Banner ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-cream">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          <AnimatedStat value="20+" label="Interviews" delay={0} />
          <AnimatedStat value="5" label="Countries" delay={150} />
          <AnimatedStat value="11" label="Key Insights" delay={300} />
          <AnimatedStat value="8" label="Design Opportunities" delay={450} />
        </div>
      </section>

      {/* ── First Pull Quote ─────────────────────────────────────────────────── */}
      <StatementPage
        text="Successful first climate investments are driven by personal factors rather than pure rationality."
        bg="dark"
      />

      {/* ═══ CHAPTER 1: Why capital does not enter ═══════════════════════════ */}
      <ChapterPage id="why-not-enter" bg="cream">
        <p className="font-ui text-[10px] text-stone-400 uppercase tracking-[0.3em] mb-6">Part I</p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-stone-800 leading-[1.05] tracking-tight">
          Why capital{' '}
          <span className="italic text-amber-800/70">does not</span>
          <br />
          enter
        </h2>
      </ChapterPage>

      <section className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto divide-y divide-stone-100">
          {insightsBySection['why-not-enter'].map((insight) => (
            <InsightBlock
              key={insight.id}
              insight={insight}
              questions={questions}
              reactions={reactions}
              onSubmitQuestion={submitQuestion}
              onReact={submitReaction}
            />
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <StatementPage
        text="Mission-aligned investors are so convicted in their vision that purity itself becomes the barrier to catalyzing capital at scale."
        bg="dark"
      />

      {/* ═══ CHAPTER 2: What keeps capital from scaling ═══════════════════════ */}
      <ChapterPage id="what-keeps-scaling" bg="cream">
        <p className="font-ui text-[10px] text-stone-400 uppercase tracking-[0.3em] mb-6">Part II</p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-stone-800 leading-[1.05] tracking-tight">
          What keeps capital
          <br />
          from <span className="font-bold">scaling</span>
        </h2>
      </ChapterPage>

      <section className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto divide-y divide-stone-100">
          {insightsBySection['what-keeps-scaling'].map((insight) => (
            <InsightBlock
              key={insight.id}
              insight={insight}
              questions={questions}
              reactions={reactions}
              onSubmitQuestion={submitQuestion}
              onReact={submitReaction}
            />
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <StatementPage
        text="If everyone focused on their second favorite topic, the capital would be far more catalytic."
        bg="dark"
      />

      {/* ═══ CHAPTER 3: Why nobody is wrong ═══════════════════════════════════ */}
      <ChapterPage id="system-fails" bg="cream">
        <p className="font-ui text-[10px] text-stone-400 uppercase tracking-[0.3em] mb-6">Part III</p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-stone-800 leading-[1.05] tracking-tight">
          Why <span className="italic">nobody</span> is wrong
          <br />
          <span className="text-amber-800/60">and the system still fails</span>
        </h2>
      </ChapterPage>

      <section className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto divide-y divide-stone-100">
          {insightsBySection['system-fails'].map((insight) => (
            <InsightBlock
              key={insight.id}
              insight={insight}
              questions={questions}
              reactions={reactions}
              onSubmitQuestion={submitQuestion}
              onReact={submitReaction}
            />
          ))}
        </div>
      </section>

      {/* ── Transition ────────────────────────────────────────────────────────── */}
      <StatementPage
        text="Everyone is waiting for the first mover to trigger the domino effect. No one wants to be the domino."
        bg="dark"
      />

      {/* ═══ Design Opportunities ═══════════════════════════════════════════ */}
      <ChapterPage id="part-ii" bg="cream">
        <p className="font-ui text-[10px] text-stone-400 uppercase tracking-[0.3em] mb-6">Part IV</p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-stone-800 leading-[1.05] tracking-tight">
          Design
          <br />
          <span className="italic text-amber-800/70">Opportunities</span>
        </h2>
      </ChapterPage>

      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-5xl mx-auto">
          <p className="mt-8 mb-16 font-body text-[17px] text-stone-500 leading-[1.9] max-w-2xl">
            {designIntro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {designOpportunities.map((opp, i) => (
              <DesignCard
                key={opp.id}
                opportunity={opp}
                index={i}
                questions={questions}
                onSubmitQuestion={submitQuestion}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── POV: The One That Matters Most ──────────────────────────────────── */}
      <section className="bg-stone-900 px-6 md:px-12 py-24 md:py-36">
        <div className="max-w-2xl mx-auto">
          <p className="font-ui text-[10px] text-amber-400/50 uppercase tracking-[0.3em] mb-6">
            Where I would focus
          </p>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-stone-100 leading-[1.05] tracking-tight mb-16">
            {pov.title}
          </h2>

          <div className="space-y-6">
            {pov.paragraphs.map((para: string, i: number) => (
              <p
                key={i}
                className={`font-body leading-[1.9] text-[16px] md:text-[17px] ${
                  i === 0
                    ? 'text-stone-300 text-[18px] md:text-[20px]'
                    : 'text-stone-400'
                }`}
              >
                {para}
              </p>
            ))}
          </div>

          <div className="mt-16 pt-10 border-t border-stone-700/40">
            <p className="font-display text-xl md:text-2xl text-stone-200 leading-snug tracking-tight italic">
              The risk is already in the portfolio.
              <br />
              <span className="text-amber-400/60">Draw the map.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-stone-200/60 px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end gap-8">
          <div>
            <p className="font-display text-2xl md:text-3xl text-stone-800 tracking-tight mb-4">
              This research is <span className="italic">ongoing.</span>
            </p>
            <p className="font-body text-stone-500 text-sm leading-relaxed max-w-md">
              If you work in climate investing, family office strategy, or adaptation infrastructure
              and want to contribute to this research, reach out.
            </p>
          </div>
          <div className="text-right">
            <p className="font-ui text-[10px] text-stone-400 uppercase tracking-[0.3em]">
              GSB GEN 390 · Emerging Synthesis
            </p>
            <p className="mt-2 font-ui text-xs text-stone-400">
              Nazlican Goksu · Stanford GSB · 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
