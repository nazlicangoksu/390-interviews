import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  intro,
  insights,
  designOpportunities,
  designIntro,
  pov,
} from '../data/emergingSynthesis';

// ─── Reading time (computed from the content, ~200 wpm) ──────────────────────
const READING_MINUTES = (() => {
  const strip = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const text = [
    intro.lead,
    ...intro.paragraphs,
    ...insights.flatMap((i) => [i.title, i.subtitle, ...i.body]),
    designIntro,
    ...designOpportunities.map((o) => o.question),
    ...pov.paragraphs,
  ]
    .map(strip)
    .join(' ');
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
})();

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

// ─── Chapters + color themes ─────────────────────────────────────────────────
const chapters = [
  { id: 'why-not-enter', nav: 'I / Entry' },
  { id: 'what-keeps-scaling', nav: 'II / Scale' },
  { id: 'system-fails', nav: 'III / System' },
  { id: 'part-ii', nav: 'IV / Opportunities' },
];

const chapterTheme: Record<string, { field: string; rule: string; accent: string }> = {
  'why-not-enter': { field: 'bg-violet text-white', rule: 'border-white/20', accent: 'text-violet' },
  'what-keeps-scaling': { field: 'bg-black text-white', rule: 'border-white/20', accent: 'text-violet' },
  'system-fails': { field: 'bg-black text-white', rule: 'border-white/20', accent: 'text-violet' },
};

// Contents index shown on the cover
const contents = [
  { id: 'why-not-enter', num: 'I', title: 'Why the capital never enters' },
  { id: 'what-keeps-scaling', num: 'II', title: 'What keeps it from scaling' },
  { id: 'system-fails', num: 'III', title: 'Why it breaks anyway' },
  { id: 'part-ii', num: 'IV', title: 'Eight opportunities' },
];

// ─── Reader polls, placed through the piece (bookended to show shifts) ───────
interface PollDef {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  answerId?: string;
  reveal?: string;
  source?: { label: string; url: string };
}
const BARRIER_OPTIONS = [
  { id: 'belief', label: 'They don’t believe it pays' },
  { id: 'careers', label: 'The investment team has no career upside' },
  { id: 'vehicles', label: 'No vehicle fits the timelines' },
  { id: 'unseen', label: 'They can’t see the risk they already own' },
];
const POLLS: Record<string, PollDef> = {
  open: {
    id: 'biggest-barrier',
    prompt: 'Before you read on: what do you think holds family-office climate capital back the most?',
    options: BARRIER_OPTIONS,
  },
  ai: {
    id: 'ai-share',
    prompt: 'Take a guess: of every dollar of climate-tech equity invested last year, how much went to something AI-enabled?',
    options: [
      { id: 'a', label: 'About 5%' },
      { id: 'b', label: 'About 15%' },
      { id: 'c', label: 'More than 25%' },
      { id: 'd', label: 'About half' },
    ],
    answerId: 'c',
    reveal:
      'More than a quarter of every climate-equity dollar now goes to an AI-enabled solution, as venture money pivots from climate to AI.',
    source: {
      label: 'Sightline Climate',
      url: 'https://www.sightlineclimate.com/research/40-5bn-and-8-uptick-as-power-demand-drives-25-investment',
    },
  },
  indigenous: {
    id: 'indigenous-share',
    prompt: 'Indigenous communities steward much of the world’s biodiversity. Guess: what share of global climate finance actually reaches them?',
    options: [
      { id: 'a', label: 'Less than 1%' },
      { id: 'b', label: 'About 5%' },
      { id: 'c', label: 'About 15%' },
      { id: 'd', label: 'About 30%' },
    ],
    answerId: 'a',
    reveal:
      'Less than 1%. Between 2011 and 2020, Indigenous peoples and local communities received under one percent of global climate finance.',
    source: {
      label: 'Rainforest Foundation Norway, via Grist',
      url: 'https://grist.org/indigenous/indigenous-peoples-bear-the-brunt-of-climate-change-and-get-almost-none-of-the-money-to-fight-it/',
    },
  },
  build: {
    id: 'build-first',
    prompt: 'Of the eight opportunities, which would you build first?',
    options: [
      { id: 'audit', label: 'Climate risk as wealth preservation' },
      { id: 'bundle', label: 'Bundling the problem and the solution' },
      { id: 'commons', label: 'The due diligence commons' },
      { id: 'nature', label: 'The nature credibility gap' },
      { id: 'doors', label: 'Five doors, not one' },
      { id: 'coalitions', label: 'Pre-competitive climate coalitions' },
      { id: 'adaptation', label: 'The adaptation economy' },
      { id: 'carry', label: 'Redesigning the carry' },
    ],
  },
  close: {
    id: 'biggest-barrier-after',
    prompt: 'Now that you have read it: what is the biggest barrier?',
    options: BARRIER_OPTIONS,
  },
};

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

// ─── Headline erosion: brush it away with the cursor, or it erodes as you scroll ──
const GREENS = ['#ebfa64', '#e2f24f', '#d8ec4c', '#f0fb86'];
function HeadlineErosion() {
  const layerRef = useRef<HTMLDivElement>(null);
  const colors = useMemo(
    () =>
      Array.from({ length: 1100 }, () =>
        Math.random() < 0.12 ? '#0a0a0a' : GREENS[Math.floor(Math.random() * GREENS.length)]
      ),
    []
  );

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const tiles = Array.from(layer.children) as HTMLElement[];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      tiles.forEach((t) => (t.style.opacity = '0'));
      return;
    }

    let centers = tiles.map((t) => ({ x: t.offsetLeft + t.offsetWidth / 2, y: t.offsetTop + t.offsetHeight / 2 }));
    const eroded = new Set<number>();
    const R2 = 48 * 48;
    const erode = (i: number, delay = 0) => {
      if (eroded.has(i)) return;
      eroded.add(i);
      tiles[i].style.animationDelay = `${delay}s`;
      tiles[i].classList.add('eroded');
    };

    // brush: erode tiles under the cursor
    let pending = false;
    let px = 0;
    let py = 0;
    const onMove = (clientX: number, clientY: number) => {
      const rect = layer.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      if (px < -60 || py < -60 || px > rect.width + 60 || py > rect.height + 60) return;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        for (let i = 0; i < centers.length; i++) {
          if (eroded.has(i)) continue;
          const dx = centers[i].x - px;
          const dy = centers[i].y - py;
          if (dx * dx + dy * dy < R2) erode(i);
        }
      });
    };
    const mm = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const tm = (e: TouchEvent) => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); };
    window.addEventListener('mousemove', mm, { passive: true });
    window.addEventListener('touchmove', tm, { passive: true });

    // scroll: if untouched, the panel erodes progressively as the reader scrolls past
    const order = tiles.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let ptr = 0;
    const threshold = Math.max(340, window.innerHeight * 0.7);
    const onScroll = () => {
      const target = Math.floor(Math.min(1, window.scrollY / threshold) * tiles.length);
      while (eroded.size < target) {
        while (ptr < order.length && eroded.has(order[ptr])) ptr++;
        if (ptr >= order.length) break;
        erode(order[ptr++]);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      centers = tiles.map((t) => ({ x: t.offsetLeft + t.offsetWidth / 2, y: t.offsetTop + t.offsetHeight / 2 }));
    };
    window.addEventListener('resize', onResize);

    // fallback so the title never stays covered if someone neither brushes nor scrolls
    const timer = setTimeout(() => tiles.forEach((_, i) => erode(i, Math.random() * 0.9)), 7000);

    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={layerRef} className="erode-layer absolute inset-0 z-10" aria-hidden="true">
      {colors.map((c, i) => (
        <span key={i} className="erode-tile" style={{ backgroundColor: c }} />
      ))}
    </div>
  );
}

// ─── Inline markdown-link renderer (for [text](url) citations) ───────────────
function renderRich(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      return (
        <a
          key={i}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet underline decoration-violet/40 underline-offset-2 hover:decoration-violet"
        >
          {m[1]}
        </a>
      );
    }
    return part;
  });
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
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-50 bg-black/10">
      <div className="h-full bg-violet" style={{ width: `${progress}%` }} />
    </div>
  );
}

// ─── Sticky Nav ──────────────────────────────────────────────────────────────
function StickyNav({ currentInsight }: { currentInsight: number }) {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.85);
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
    <nav className="fixed top-3 left-0 w-full z-40 flex justify-center pointer-events-none px-4">
      <div className="pointer-events-auto bg-white border-2 border-black flex items-stretch divide-x-2 divide-black">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => scrollTo(ch.id)}
            className={`label px-3.5 py-2 transition-colors whitespace-nowrap ${
              active === ch.id ? 'bg-black text-white' : 'text-black hover:bg-paper'
            }`}
          >
            {ch.nav}
          </button>
        ))}
        {active !== 'part-ii' && currentInsight > 0 && (
          <span className="label px-3 py-2 bg-yellow text-black">
            {String(currentInsight).padStart(2, '0')}/{insights.length}
          </span>
        )}
      </div>
    </nav>
  );
}

// ─── Chapter Title Page (full-bleed color field) ─────────────────────────────
function ChapterPage({
  id,
  kicker,
  num,
  field,
  children,
}: {
  id: string;
  kicker: string;
  num: string;
  field: string;
  children: React.ReactNode;
}) {
  const { ref, isVisible } = useInView(0.25);
  return (
    <div
      ref={ref}
      id={id}
      className={`min-h-[62vh] md:min-h-[72vh] flex items-center px-6 md:px-12 lg:px-20 py-20 relative overflow-hidden ${field}`}
    >
      <div className={`relative z-10 max-w-5xl w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center gap-4 mb-8 md:mb-12">
          <span className="label text-yellow">{kicker}</span>
          <span className={`bar ${isVisible ? 'lit' : ''} inline-block h-[3px] w-14 bg-yellow`} />
        </div>
        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-10">
          <span className="display text-yellow text-[clamp(3.5rem,10vw,8.5rem)] leading-[0.8] shrink-0">{num}</span>
          <div className="md:pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Voice Page — interview quote on a color field ───────────────────────────
function VoicePage({ text, field }: { text: string; field: string }) {
  const { ref, isVisible } = useInView(0.3);
  return (
    <div ref={ref} className={`flex items-center justify-center px-6 md:px-16 py-28 md:py-40 ${field}`}>
      <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="label opacity-60 mb-8">What I heard in conversations…</p>
        <p className="headline text-[28px] md:text-[44px] lg:text-[52px]">
          &ldquo;{text}&rdquo;
        </p>
      </div>
    </div>
  );
}

// ─── Reaction Chips ──────────────────────────────────────────────────────────
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
  onSubmitQuestion: (sectionId: string, text: string, author: string) => Promise<void>;
}) {
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseName, setResponseName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const sectionReactions = reactions[sectionId] || {};
  const sectionQuestions = questions.filter((q) => q.sectionId === sectionId);

  const handleReact = (reaction: ReactionType) => {
    if (reaction === 'tell-more') { setShowResponse(true); return; }
    if (voted.has(reaction)) return;
    setVoted((prev) => new Set(prev).add(reaction));
    onReact(sectionId, reaction);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmitQuestion(sectionId, responseText, responseName);
      setResponseText(''); setResponseName(''); setShowResponse(false);
    } finally { setSubmitting(false); }
  };

  const quickChips: { key: ReactionType; label: string }[] = [
    { key: 'surprising', label: 'Surprising' },
    { key: 'seen-this', label: "I've seen this" },
  ];

  return (
    <div className="mt-10 pt-6 rule border-black/15">
      <div className="flex flex-wrap gap-2">
        {quickChips.map((chip) => {
          const count = sectionReactions[chip.key] || 0;
          const isActive = voted.has(chip.key);
          return (
            <button
              key={chip.key}
              onClick={() => handleReact(chip.key)}
              className={`reaction-chip label inline-flex items-center gap-2 px-4 py-2 border-2 transition-all ${
                isActive ? 'bg-black text-white border-black' : 'bg-white text-black border-black/30 hover:border-black'
              }`}
            >
              <span>{chip.label}</span>
              {count > 0 && <span className={isActive ? 'text-yellow' : 'text-black/40'}>{count}</span>}
            </button>
          );
        })}
        <button
          onClick={() => handleReact('tell-more')}
          className={`reaction-chip label inline-flex items-center gap-2 px-4 py-2 border-2 transition-all ${
            showResponse ? 'bg-black text-white border-black' : 'bg-white text-black border-black/30 hover:border-black'
          }`}
        >
          <span>Confirm or complicate</span>
        </button>
      </div>

      {showResponse && (
        <div className="mt-4 space-y-2 max-w-md">
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Where is this right, and where is it wrong?"
            className="w-full font-sans text-base text-black bg-paper border-2 border-black/20 px-3 py-2.5 resize-none focus:outline-none focus:border-black"
            rows={3}
            autoFocus
          />
          <input
            value={responseName}
            onChange={(e) => setResponseName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full label text-black bg-paper border-2 border-black/20 px-3 py-2.5 focus:outline-none focus:border-black"
          />
          <div className="flex gap-4">
            <button onClick={handleSubmitResponse} disabled={submitting} className={`label ${submitting ? 'text-black/30' : 'text-violet hover:text-black'}`}>
              {submitting ? 'Sending…' : 'Send'}
            </button>
            <button onClick={() => { setShowResponse(false); setResponseText(''); setResponseName(''); }} className="label text-black/40 hover:text-black">
              Cancel
            </button>
          </div>
        </div>
      )}

      {sectionQuestions.length > 0 && (
        <div className="mt-5 pl-4 border-l-2 border-violet space-y-3">
          {sectionQuestions.map((q) => (
            <div key={q.id}>
              <p className="font-sans text-[15px] text-black/70 leading-relaxed">{q.text}</p>
              <p className="label text-black/40 mt-1">
                {q.author || 'Anonymous'} / {new Date(q.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Insight Block ───────────────────────────────────────────────────────────
function InsightBlock({
  insight, accent, questions, reactions, onSubmitQuestion, onReact,
}: {
  insight: (typeof insights)[0];
  accent: string;
  questions: Question[];
  reactions: ReactionsMap;
  onSubmitQuestion: (sectionId: string, text: string, author: string) => Promise<void>;
  onReact: (sectionId: string, reaction: ReactionType) => void;
}) {
  const { ref, isVisible } = useInView(0.08);
  const num = String(insight.number).padStart(2, '0');

  return (
    <div
      ref={ref}
      id={insight.id}
      className={`relative py-20 md:py-28 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="flex items-baseline gap-5 mb-8">
        <span className={`display text-4xl md:text-5xl ${accent}`}>{num}</span>
        <div className="flex-1 rule-2 border-black self-center" />
      </div>

      <h3 className="headline text-[30px] md:text-[42px] lg:text-[46px] text-black mb-5 max-w-3xl">
        {insight.title}
      </h3>

      <p className={`font-sans font-semibold text-[18px] md:text-[20px] ${accent} leading-snug mb-10 max-w-xl`}>
        {insight.subtitle}
      </p>

      <div className="max-w-2xl space-y-6">
        {insight.body.map((para, i) => (
          <p key={i} className="font-sans text-black/85 leading-[1.65] text-[18px] md:text-[19px]">
            {renderRich(para)}
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
  );
}

// ─── Proposal marks: a distinct, quiet brand glyph per idea ──────────────────
function ProposalMark({ variant }: { variant: number }) {
  const v = ((variant % 3) + 3) % 3;
  if (v === 1) {
    return (
      <span className="pmark" aria-hidden="true">
        <span className="pmark-bars">
          <i style={{ height: '9px' }} />
          <i style={{ height: '14px' }} />
          <i style={{ height: '6px' }} />
        </span>
      </span>
    );
  }
  if (v === 2) {
    return (
      <span className="pmark" aria-hidden="true">
        <span className="pmark-ring" />
      </span>
    );
  }
  return (
    <span className="pmark" aria-hidden="true">
      <span className="pmark-grid">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} className={i === 4 ? 'b' : ''} />
        ))}
      </span>
    </span>
  );
}

// ─── Design Opportunity Card ─────────────────────────────────────────────────
function DesignCard({
  opportunity, index,
}: {
  opportunity: (typeof designOpportunities)[0];
  index: number;
}) {
  const { ref, isVisible } = useInView(0.1);
  const [open, setOpen] = useState(false);
  const num = String(index + 1).padStart(2, '0');
  const dark = open;

  return (
    <div
      ref={ref}
      id={opportunity.id}
      className={`transition-all duration-700 flex flex-col ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${(index % 2) * 80}ms` }}
    >
      <div className={`w-full flex-1 flex flex-col text-left border-2 border-black transition-colors duration-300 ${dark ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}>
        <button onClick={() => setOpen(!open)} className="w-full flex-1 text-left p-7 md:p-9">
          <div className="flex items-center gap-3 mb-5">
            <span className={`display text-2xl ${dark ? 'text-yellow' : 'text-black group-hover:text-yellow'}`}>{num}</span>
          </div>
          <p className="headline text-[22px] md:text-[27px] pr-4">{opportunity.question}</p>
          {!open && (
            <p className="label mt-5 text-current opacity-50">{opportunity.title}</p>
          )}
        </button>

        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-7 md:px-9 py-4 rule ${dark ? 'border-white/20' : 'border-black/15'}`}
        >
          <span className={`label ${dark ? 'text-yellow' : 'text-current'}`}>{open ? 'Close' : 'Explore this opportunity'}</span>
          <span className={`display text-lg ${dark ? 'text-yellow' : ''}`}>{open ? '–' : '+'}</span>
        </button>

        <div className={`overflow-hidden transition-all duration-500 ${open ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-7 md:px-9 pb-9 pt-2">
            <h4 className="display text-xl md:text-2xl text-white mb-6">{opportunity.title}</h4>
            <div className="space-y-4 mb-8">
              {opportunity.body.map((para, i) => (
                <p key={i} className="font-sans text-white/80 leading-[1.6] text-[17px]">{para}</p>
              ))}
            </div>
            <p className="label text-yellow mb-5">What this could look like</p>
            <div key={open ? 'open' : 'closed'} className="space-y-5">
              {opportunity.proposals.map((proposal, i) => (
                <div
                  key={i}
                  className={`flex gap-4 ${open ? 'reveal-up' : ''}`}
                  style={open ? { animationDelay: `${150 + i * 130}ms` } : undefined}
                >
                  <span className="shrink-0 mt-1"><ProposalMark variant={i} /></span>
                  <p className="font-sans text-white/75 leading-[1.6] text-[16px]">{proposal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reader poll ─────────────────────────────────────────────────────────────
function Poll({
  poll,
  counts,
  onVote,
}: {
  poll: PollDef;
  counts?: Record<string, number>;
  onVote: (pollId: string, optionId: string) => void;
}) {
  const { ref, isVisible } = useInView(0.2);
  const [voted, setVoted] = useState<string | null>(() => {
    try { return localStorage.getItem(`cc-poll-${poll.id}`); } catch { return null; }
  });
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;
  const isData = !!poll.answerId;

  const vote = (optionId: string) => {
    if (voted) return;
    setVoted(optionId);
    try { localStorage.setItem(`cc-poll-${poll.id}`, optionId); } catch {}
    onVote(poll.id, optionId);
  };

  return (
    <section
      ref={ref}
      className={`bg-paper px-6 md:px-12 py-16 md:py-20 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-block w-2 h-2 rounded-full bg-violet" />
          <span className="label text-black/50">{isData ? 'Quick guess' : 'Reader poll'}</span>
        </div>
        <h3 className="font-sans font-semibold text-black text-[21px] md:text-[26px] leading-snug mb-7">
          {poll.prompt}
        </h3>
        <div className="space-y-2.5">
          {poll.options.map((o) => {
            const c = counts?.[o.id] || 0;
            const pct = total ? Math.round((c / total) * 100) : 0;
            const mine = voted === o.id;
            const correct = isData && poll.answerId === o.id;
            if (voted) {
              return (
                <div key={o.id} className={`relative border-2 overflow-hidden ${correct ? 'border-violet' : 'border-black'}`}>
                  <div
                    className="absolute inset-y-0 left-0 bg-yellow transition-[width] duration-700"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between gap-3 px-4 py-3">
                    <span className={`font-sans text-black ${mine ? 'font-bold' : ''}`}>
                      {o.label}{mine ? ' ✓' : ''}
                      {correct ? <span className="label text-violet ml-2">the data</span> : ''}
                    </span>
                    <span className="label text-black shrink-0">{pct}%</span>
                  </div>
                </div>
              );
            }
            return (
              <button
                key={o.id}
                onClick={() => vote(o.id)}
                className="reaction-chip w-full text-left border-2 border-black/25 bg-white px-4 py-3 font-sans text-black hover:border-black transition-colors"
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {voted && isData && poll.source && (
          <div className="mt-5 border-l-4 border-violet pl-4">
            <p className="label text-violet mb-1">{voted === poll.answerId ? 'You called it' : 'The answer'}</p>
            <p className="font-sans text-black/80 text-[15px] leading-relaxed">
              {poll.reveal}{' '}
              <a href={poll.source.url} target="_blank" rel="noopener noreferrer" className="text-black underline decoration-black/30 underline-offset-2 hover:decoration-black">
                {poll.source.label}
              </a>
            </p>
          </div>
        )}

        <p className="label text-black/40 mt-4">
          {voted
            ? `${total} ${total === 1 ? 'vote' : 'votes'} so far`
            : isData
            ? 'Take a guess, then see the answer'
            : 'Vote to see what other readers think'}
        </p>
      </div>
    </section>
  );
}

// ─── Data reveal: two figures that count up on scroll, from credible sources ──
function DataReveal() {
  const { ref, isVisible } = useInView(0.35);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setP(1); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 1300;
    const tick = (t: number) => {
      const x = Math.min(1, (t - start) / dur);
      setP(1 - Math.pow(1 - x, 3));
      if (x < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isVisible]);

  return (
    <section ref={ref} className="bg-black text-white px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="label text-yellow">The gap, in two numbers</span>
          <span className="inline-block h-[3px] w-14 bg-yellow" />
        </div>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <div className="display text-yellow text-[clamp(3.2rem,9vw,6.5rem)] leading-none">
              ${(p * 7.4).toFixed(1)}T
            </div>
            <p className="font-sans text-white/80 text-[17px] leading-relaxed mt-5 max-w-sm">
              a year is what climate needs by 2030, roughly five times the $1.5 trillion flowing today.{' '}
              <a href="https://www.climatepolicyinitiative.org/publication/global-landscape-of-climate-finance-2024/" target="_blank" rel="noopener noreferrer" className="text-yellow underline decoration-yellow/40 underline-offset-2 hover:decoration-yellow">
                Climate Policy Initiative
              </a>
            </p>
          </div>
          <div>
            <div className="display text-yellow text-[clamp(3.2rem,9vw,6.5rem)] leading-none">
              {Math.round(p * 46)}%
            </div>
            <p className="font-sans text-white/80 text-[17px] leading-relaxed mt-5 max-w-sm">
              of family offices now weigh sustainability, yet their most common way to act on it is still philanthropy.{' '}
              <a href="https://www.ubs.com/global/en/wealthmanagement/family-office-uhnw/reports/global-family-office-report.html" target="_blank" rel="noopener noreferrer" className="text-yellow underline decoration-yellow/40 underline-offset-2 hover:decoration-yellow">
                UBS Global Family Office Report 2025
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function EmergingSynthesis() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reactions, setReactions] = useState<ReactionsMap>({});
  const [polls, setPolls] = useState<Record<string, Record<string, number>>>({});
  const [currentInsight, setCurrentInsight] = useState(0);
  const [heroLit, setHeroLit] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggleAudio = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.volume = 0.5;
      a.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setPlaying(false);
    }
  }, []);

  const fetchData = useCallback(() => {
    fetch('/api/questions').then((r) => r.json()).then(setQuestions).catch(() => {});
    fetch('/api/reactions').then((r) => r.json()).then(setReactions).catch(() => {});
    fetch('/api/polls').then((r) => r.json()).then(setPolls).catch(() => {});
  }, []);

  const submitPoll = useCallback((pollId: string, optionId: string) => {
    setPolls((prev) => {
      const cur = { ...(prev[pollId] || {}) };
      cur[optionId] = (cur[optionId] || 0) + 1;
      return { ...prev, [pollId]: cur };
    });
    fetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, optionId }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => { if (updated) setPolls((prev) => ({ ...prev, [pollId]: updated })); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => setHeroLit(true), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const ordered = [...insights].sort((a, b) => a.number - b.number);
    const onScroll = () => {
      for (let i = ordered.length - 1; i >= 0; i--) {
        const el = document.getElementById(ordered[i].id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) {
          setCurrentInsight(ordered[i].number);
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, text, author }),
      });
      if (res.ok) { const newQ = await res.json(); setQuestions((prev) => [...prev, newQ]); }
    } catch {}
  }, []);

  const submitReaction = useCallback(async (sectionId: string, reaction: ReactionType) => {
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, reaction }),
      });
      if (res.ok) { const updated = await res.json(); setReactions((prev) => ({ ...prev, [sectionId]: updated })); }
    } catch {}
  }, []);

  const bySection = (s: string) =>
    insights.filter((i) => i.section === s).sort((a, b) => a.number - b.number);
  const insightsBySection = {
    'why-not-enter': bySection('why-not-enter'),
    'what-keeps-scaling': bySection('what-keeps-scaling'),
    'system-fails': bySection('system-fails'),
  };
  // Split Part I around the AI insight so the AI poll always sits right before it
  const partOne = insightsBySection['why-not-enter'];
  const aiIdx = partOne.findIndex((i) => i.id === 'insight-3');
  const partOneBeforeAI = aiIdx >= 0 ? partOne.slice(0, aiIdx) : partOne;
  const partOneFromAI = aiIdx >= 0 ? partOne.slice(aiIdx) : [];

  return (
    <div className="min-h-screen bg-white">
      <ProgressBar />
      <StickyNav currentInsight={currentInsight} />

      <audio
        ref={audioRef}
        src="/audio/nature.mp3"
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <button
        onClick={toggleAudio}
        aria-label={playing ? 'Pause ambient sound' : 'Play ambient sound'}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2.5 bg-black text-white px-3.5 py-2.5 border border-white/10 shadow-xl shadow-black/30 hover:bg-violet transition-colors"
      >
        {playing ? (
          <span className="eq"><i /><i /><i /></span>
        ) : (
          <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" className="text-yellow"><path d="M0 0l11 6-11 6z" /></svg>
        )}
        <span className="label">{playing ? 'Listening' : 'Listen'}</span>
      </button>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <header className="min-h-screen flex flex-col bg-white">
        {/* Masthead */}
        <div className="px-6 md:px-12 lg:px-20 pt-6 pb-4 flex items-center justify-between border-b border-black/15">
          <span className="label text-black">Climate Capital</span>
          <span className="label text-black/45">
            GEN 390 <span className="text-black">/</span> Stanford GSB <span className="text-black">/</span> 2026
          </span>
        </div>

        {/* Headline */}
        <div className={`flex-1 flex items-center px-6 md:px-12 lg:px-20 py-14 transition-all duration-700 ${heroLit ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <div className="max-w-5xl w-full">
            <p className="label text-black/45 mb-7">A field study · {READING_MINUTES} min read</p>
            <div className="relative max-w-5xl">
              <h1 className="headline text-black text-[clamp(2.6rem,7.2vw,6rem)]">
                Key <span className="bg-yellow chip">barriers</span> to family offices investing in climate
              </h1>
              <HeadlineErosion />
            </div>
            <p className="font-sans text-black/60 text-lg md:text-xl leading-relaxed max-w-xl mt-8">
              What investors and family offices told me about what holds them back
              from investing more in climate.
            </p>
            <p className="label text-black mt-8">By Nazlican Goksu Seira</p>

            <div className="mt-9 flex items-start gap-4 max-w-xl border-t border-black/15 pt-7">
              <button
                onClick={toggleAudio}
                aria-label={playing ? 'Pause ambient sound' : 'Play ambient sound'}
                className="shrink-0 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-violet transition-colors"
              >
                {playing ? (
                  <span className="eq"><i /><i /><i /></span>
                ) : (
                  <svg width="13" height="14" viewBox="0 0 11 12" fill="currentColor" className="text-yellow ml-0.5"><path d="M0 0l11 6-11 6z" /></svg>
                )}
              </button>
              <div>
                <p className="font-sans text-black/70 text-[15px] leading-relaxed">
                  Read with the sound on. Behind all the talk of capital is an actual
                  living world, so here are a few minutes of one: a forest, birdsong and
                  a small river, recorded in the wild.
                </p>
                <p className="label text-black/45 mt-2">{READING_MINUTES} min read</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contents */}
        <div className="px-6 md:px-12 lg:px-20 pb-10">
          <p className="label text-black/40 mb-3">Contents</p>
          <div className="border-t-2 border-black">
            {contents.map((c) => (
              <button
                key={c.id}
                onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="group w-full flex items-center gap-4 md:gap-6 py-4 border-b border-black/15 text-left transition-colors hover:bg-paper"
              >
                <span className="label text-black/40 w-7 shrink-0">{c.num}</span>
                <span className="headline text-black text-lg md:text-2xl flex-1">{c.title}</span>
                <span className="label text-black/30 group-hover:text-black transition-colors">&rarr;</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Intro ────────────────────────────────────────────────────────────── */}
      <section id="intro-text" className="bg-white px-6 md:px-12 py-24 md:py-36">
        <div className="max-w-2xl mx-auto">
          <p className="font-sans text-[23px] md:text-[27px] text-black leading-[1.5] font-medium mb-12">
            {intro.lead}
          </p>

          {intro.paragraphs.map((para, i) => {
            const { ref, isVisible } = useInView(0.1);
            const editorialPhrase =
              'Getting a family office through the door is the first. Making its money count once it is inside is the second.';
            const hasEditorial = para.includes(editorialPhrase);
            return hasEditorial ? (
              <div
                key={i}
                ref={ref}
                className={`mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <p className="font-sans text-[18px] md:text-[19px] text-black/85 leading-[1.65]">
                  {para.split(editorialPhrase)[0]}
                </p>
                <p className="headline text-[24px] md:text-[30px] text-black my-7 pl-6 border-l-4 border-yellow">
                  Getting a family office through the door is the first. Making its money count once it is inside is the second.
                </p>
                {para.split(editorialPhrase)[1] && (
                  <p className="font-sans text-[18px] md:text-[19px] text-black/85 leading-[1.65]">
                    {para.split(editorialPhrase)[1]}
                  </p>
                )}
              </div>
            ) : (
              <p
                key={i}
                ref={ref}
                className={`transition-all duration-700 mb-7 font-sans leading-[1.65] ${
                  i === 0 ? 'text-[20px] md:text-[21px] text-black' : 'text-[18px] md:text-[19px] text-black/85'
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                {para}
              </p>
            );
          })}
        </div>
      </section>

      <Poll poll={POLLS.open} counts={polls[POLLS.open.id]} onVote={submitPoll} />

      <DataReveal />

      {/* ═══ CHAPTER I ═══ */}
      <ChapterPage id="why-not-enter" kicker="Getting in the door" num="01" field={chapterTheme['why-not-enter'].field}>
        <h2 className="headline text-white text-[clamp(2rem,5.2vw,4.4rem)] max-w-3xl text-balance">
          Why the capital never enters
        </h2>
      </ChapterPage>

      <section className="bg-white px-6 md:px-12">
        <div className="max-w-3xl mx-auto divide-y-2 divide-black/10">
          {partOneBeforeAI.map((insight) => (
            <InsightBlock key={insight.id} insight={insight} accent={chapterTheme['why-not-enter'].accent} questions={questions} reactions={reactions} onSubmitQuestion={submitQuestion} onReact={submitReaction} />
          ))}
        </div>
      </section>

      <Poll poll={POLLS.ai} counts={polls[POLLS.ai.id]} onVote={submitPoll} />

      <section className="bg-white px-6 md:px-12">
        <div className="max-w-3xl mx-auto divide-y-2 divide-black/10">
          {partOneFromAI.map((insight) => (
            <InsightBlock key={insight.id} insight={insight} accent={chapterTheme['why-not-enter'].accent} questions={questions} reactions={reactions} onSubmitQuestion={submitQuestion} onReact={submitReaction} />
          ))}
        </div>
      </section>

      <VoicePage field="bg-purple text-black" text="Some investors are so sure of their own version of climate that the certainty itself keeps the money from ever pooling." />

      {/* ═══ CHAPTER II ═══ */}
      <ChapterPage id="what-keeps-scaling" kicker="Once inside" num="02" field={chapterTheme['what-keeps-scaling'].field}>
        <h2 className="headline text-white text-[clamp(2rem,5.2vw,4.4rem)] max-w-3xl text-balance">
          What keeps it from scaling
        </h2>
      </ChapterPage>

      <section className="bg-white px-6 md:px-12">
        <div className="max-w-3xl mx-auto divide-y-2 divide-black/10">
          {insightsBySection['what-keeps-scaling'].map((insight) => (
            <InsightBlock key={insight.id} insight={insight} accent={chapterTheme['what-keeps-scaling'].accent} questions={questions} reactions={reactions} onSubmitQuestion={submitQuestion} onReact={submitReaction} />
          ))}
        </div>
      </section>

      <VoicePage field="bg-violet text-white" text="If everyone backed their second-favorite cause instead of their first, the money would go much further." />

      {/* ═══ CHAPTER III ═══ */}
      <ChapterPage id="system-fails" kicker="The system itself" num="03" field={chapterTheme['system-fails'].field}>
        <h2 className="headline text-white text-[clamp(2rem,5.2vw,4.4rem)] max-w-3xl text-balance">
          Why it breaks anyway
        </h2>
      </ChapterPage>

      <Poll poll={POLLS.indigenous} counts={polls[POLLS.indigenous.id]} onVote={submitPoll} />

      <section className="bg-white px-6 md:px-12">
        <div className="max-w-3xl mx-auto divide-y-2 divide-black/10">
          {insightsBySection['system-fails'].map((insight) => (
            <InsightBlock key={insight.id} insight={insight} accent={chapterTheme['system-fails'].accent} questions={questions} reactions={reactions} onSubmitQuestion={submitQuestion} onReact={submitReaction} />
          ))}
        </div>
      </section>

      <VoicePage field="bg-yellow text-black" text="Everyone is waiting for the first mover to start the chain. No one wants to be the first domino." />

      {/* ═══ CHAPTER IV — Opportunities ═══ */}
      <ChapterPage id="part-ii" kicker="What to build" num="04" field="bg-violet text-white">
        <h2 className="headline text-white text-[clamp(2rem,5.2vw,4.4rem)] max-w-3xl text-balance">
          Eight opportunities
        </h2>
        <p className="font-sans text-white/75 text-lg leading-relaxed max-w-xl mt-6">
          {designIntro}
        </p>
      </ChapterPage>

      <section className="bg-paper px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {designOpportunities.map((opp, i) => (
              <DesignCard key={opp.id} opportunity={opp} index={i} />
            ))}
          </div>
        </div>
      </section>

      <Poll poll={POLLS.build} counts={polls[POLLS.build.id]} onVote={submitPoll} />

      {/* ── POV / Recommendation ─────────────────────────────────────────────── */}
      <section className="bg-black px-6 md:px-12 py-24 md:py-36">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <span className="label text-yellow">If I had to pick one</span>
            <span className="inline-block h-[3px] w-14 bg-yellow" />
          </div>

          <h2 className="headline text-white text-[clamp(2rem,5.4vw,4.25rem)] max-w-3xl text-balance mb-14">
            Show a family office the climate risk it{' '}
            <span className="text-black bg-yellow chip">already owns</span>.
          </h2>

          <div className="space-y-6 max-w-2xl">
            {pov.paragraphs.map((para: string, i: number) => (
              <p key={i} className={`font-sans leading-[1.65] ${i === 0 ? 'text-white text-[20px] md:text-[22px] font-medium' : 'text-white/75 text-[17px] md:text-[18px]'}`}>
                {para}
              </p>
            ))}
          </div>

          <div className="mt-14 pt-7 rule border-white/20 max-w-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="label text-white">Nazlican Goksu Seira</p>
            <p className="label text-white/45">The recommendation <span className="text-yellow">/</span> GEN 390</p>
          </div>
        </div>
      </section>

      <Poll poll={POLLS.close} counts={polls[POLLS.close.id]} onVote={submitPoll} />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-black text-white px-6 md:px-12 py-20 md:py-24 rule border-white/15">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end gap-10">
          <div className="max-w-md">
            <p className="headline text-2xl md:text-3xl text-white mb-4">This research is still open.</p>
            <p className="font-sans text-white/70 text-[17px] leading-relaxed">
              If you move climate capital for a living, or get stuck trying, tell me
              where this is wrong. The interviews are still going.
            </p>
            <a href="mailto:nazlicangoksu@alumni.stanford.edu" className="inline-flex items-center gap-2 mt-6 label text-yellow hover:text-white transition-colors">
              <span className="inline-block h-[3px] w-5 bg-yellow" />
              Write to me
            </a>
          </div>
          <div className="md:text-right">
            <p className="label text-white/50">GSB GEN 390 <span className="text-yellow">/</span> Field Synthesis</p>
            <p className="label text-white/40 mt-2">Nazlican Goksu Seira <span className="text-yellow">/</span> Stanford GSB <span className="text-yellow">/</span> 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
