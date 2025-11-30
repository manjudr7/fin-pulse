
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ShieldCheck, Building2, AlertCircle, ChevronLeft, ChevronRight, Check, X, AlertTriangle, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

// --- Mock Data Sets ---
const DATA_SETS = {
  CIBIL: {
    score: 765,
    summary: {
      'Bank Name': 'HDFC Bank',
      'Current Balance': '₹12,450.00',
      'High Credit Amount': '₹50,000.00',
      'Amount Overdue': '₹0.00',
      'Type of Loan': 'Personal Loan',
      'Ownership': 'Joint'
    },
    paymentHistory: [
      { year: 2024, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0] },
      { year: 2023, payments: [1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1] }, // Some DPDs
      { year: 2022, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    ],
    recommendations: [
      { icon: CreditCard, title: "Reduce Credit Utilization", desc: "lowering your usage to under 30% can boost this score by 15 points." },
      { icon: Calendar, title: "No New Enquiries", desc: "avoid applying for new loans for the next 6 months." }
    ]
  },
  EQUIFAX: {
    score: 780,
    summary: {
      'Bank Name': 'Phoenix Credit Union',
      'Current Balance': '₹8,450.00',
      'High Credit Amount': '₹10,000.00',
      'Amount Overdue': '₹250.00',
      'Type of Loan': 'Revolving Credit',
      'Ownership': 'Individual'
    },
    paymentHistory: [
      { year: 2024, payments: [1, 1, 2, 1, 3, 1, 1, 1, 1, 1, 0, 0] },
      { year: 2023, payments: [1, 1, 1, 2, 1, 1, 1, 3, 1, 1, 1, 1] },
      { year: 2022, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    ],
    recommendations: [
      { icon: AlertTriangle, title: "Clear Overdue Amount", desc: "paying the ₹250 overdue immediately will stabilize your score." },
      { icon: TrendingUp, title: "Mix of Credit", desc: "your portfolio is heavy on unsecured loans. consider a secured card." }
    ]
  }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// --- Helper Components ---

const ScoreCard = ({ provider, score, isActive, onClick }: { provider: string, score: number, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-2xl border flex-1 min-w-[140px] transition-all duration-300 text-left outline-none ${isActive
      ? 'bg-white border-gray-800 shadow-[0_8px_20px_rgba(0,0,0,0.06)] scale-[1.02] ring-1 ring-gray-100 z-10'
      : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
      }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className={`text-xs font-bold tracking-wider uppercase ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{provider}</span>
      <ShieldCheck size={16} className={isActive ? 'text-emerald-600 fill-emerald-50' : 'text-gray-300'} />
    </div>
    <div className="flex items-end gap-2">
      <span className={`text-3xl font-bold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{score}</span>
      <span className="text-xs text-emerald-600 font-semibold mb-1.5 flex items-center">
        <ArrowUp size={10} strokeWidth={3} /> {isActive ? 15 : 12}
      </span>
    </div>
    <div className={`text-[10px] mt-1 ${isActive ? 'text-gray-500 font-medium' : 'text-gray-400'}`}>Updated 2 days ago</div>
  </button>
);

const PaymentStatusIcon = ({ status }: { status: number }) => {
  if (status === 1) return (
    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm transition-transform hover:scale-105">
      <Check size={14} strokeWidth={3} />
    </div>
  );
  if (status === 2) return (
    <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm transition-transform hover:scale-105">
      <X size={14} strokeWidth={3} />
    </div>
  );
  if (status === 3) return (
    <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm transition-transform hover:scale-105">
      <AlertTriangle size={14} strokeWidth={3} />
    </div>
  );
  return <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200" />;
};

// --- Main Component ---

export default function CredTargetGauge() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<{ isSubscribed: boolean; }>(userDocRef);

  const isPro = user?.uid === 'kadjYDNAiW3pZSKjcLaYvLnjzaIu';
  const isSubscribed = userData?.isSubscribed ?? false;
  const hasAccess = isPro || isSubscribed;

  useEffect(() => {
    if (userData && !hasAccess) {
      router.replace('/dashboard/pro');
    }
  }, [userData, hasAccess, router]);

  const [activeTab, setActiveTab] = useState('EQUIFAX');
  const currentData = DATA_SETS[activeTab as keyof typeof DATA_SETS];

  // --- Gauge Configuration ---
  const MIN_SCORE = currentData.score;
  const MAX_SCORE = Math.min(currentData.score + 55, 900);

  const GAUGE_RADIUS = 140;
  const STROKE_WIDTH = 24;
  const CENTER_X = 200;
  const CENTER_Y = 200;
  const START_ANGLE = 135;
  const END_ANGLE = 405;

  // --- State ---
  const [visualScore, setVisualScore] = useState(MIN_SCORE);
  const [isDragging, setIsDragging] = useState(false);
  const [historyYearIndex, setHistoryYearIndex] = useState(0);
  const [goalSet, setGoalSet] = useState(false);

  const targetScoreRef = useRef(MIN_SCORE);
  const svgRef = useRef<SVGSVGElement>(null);
  const goalSectionRef = useRef<HTMLDivElement>(null);

  // Reset visual score when tab changes
  useEffect(() => {
    // Reset to the new MIN_SCORE (current score)
    setVisualScore(currentData.score);
    targetScoreRef.current = currentData.score;
    setGoalSet(false);
    setHistoryYearIndex(0);
  }, [activeTab, currentData.score]);

  // --- Gauge Physics Loop ---
  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      setVisualScore((prev) => {
        const target = targetScoreRef.current;
        const diff = target - prev;
        if (Math.abs(diff) < 0.05) return target;
        return prev + diff * 0.15;
      });
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- Helpers ---
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const getCoordinates = (angleInDegrees: number, radius = GAUGE_RADIUS) => {
    const angleInRad = toRad(angleInDegrees);
    return {
      x: CENTER_X + radius * Math.cos(angleInRad),
      y: CENTER_Y + radius * Math.sin(angleInRad),
    };
  };

  const scoreToAngle = (s: number) => {
    const percentage = (s - MIN_SCORE) / (MAX_SCORE - MIN_SCORE);
    return START_ANGLE + percentage * (END_ANGLE - START_ANGLE);
  };

  const angleToScore = (angle: number) => {
    let normalizedAngle = angle;
    if (normalizedAngle < 90) normalizedAngle += 360;
    const clampedAngle = Math.min(Math.max(normalizedAngle, START_ANGLE), END_ANGLE);
    const percentage = (clampedAngle - START_ANGLE) / (END_ANGLE - START_ANGLE);
    return MIN_SCORE + percentage * (MAX_SCORE - MIN_SCORE);
  };

  // --- Interaction Handlers ---
  const handleInput = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    if (angle > 90 && angle < 135) angle = 135;
    if (angle > 45 && angle < 90) angle = 405;

    let linearAngle = angle;
    if (angle >= 0 && angle <= 45) linearAngle = 360 + angle;

    targetScoreRef.current = angleToScore(linearAngle);

    if (goalSet) {
      setGoalSet(false);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => { setIsDragging(true); handleInput(e.clientX, e.clientY); };
  const onMouseMove = (e: MouseEvent) => { if (isDragging) handleInput(e.clientX, e.clientY); };
  const onMouseUp = () => setIsDragging(false);
  const onTouchStart = (e: React.TouchEvent) => { setIsDragging(true); handleInput(e.touches[0].clientX, e.touches[0].clientY); };
  const onTouchMove = (e: TouchEvent) => { if (isDragging) { e.preventDefault(); handleInput(e.touches[0].clientX, e.touches[0].clientY); } };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  const handleSetGoal = () => {
    setGoalSet(true);
    setTimeout(() => {
      goalSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // --- Rendering Variables ---
  const displayScoreInt = Math.round(visualScore);
  const currentAngle = scoreToAngle(visualScore);
  const knobPos = getCoordinates(currentAngle, GAUGE_RADIUS);

  const delta = displayScoreInt - currentData.score;

  const createArc = (start: number, end: number, radius: number) => {
    const startPos = getCoordinates(start, radius);
    const endPos = getCoordinates(end, radius);
    const largeArcFlag = end - start <= 180 ? "0" : "1";
    return ["M", startPos.x, startPos.y, "A", radius, radius, 0, largeArcFlag, 1, endPos.x, endPos.y].join(" ");
  };

  const ticks = useMemo(() => {
    const tickArray = [];
    const totalTicks = 40;
    const angleStep = (END_ANGLE - START_ANGLE) / totalTicks;
    for (let i = 0; i <= totalTicks; i++) {
      const angle = START_ANGLE + i * angleStep;
      const isActive = angle <= currentAngle;
      const inner = getCoordinates(angle, GAUGE_RADIUS - 35);
      const outer = getCoordinates(angle, GAUGE_RADIUS - 25);
      tickArray.push(
        <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
          stroke={isActive ? "#d4af37" : "#E5E7EB"} strokeWidth={2} strokeLinecap="round"
          style={{ transition: 'stroke 0.3s ease' }} />
      );
    }
    return tickArray;
  }, [currentAngle, MIN_SCORE, MAX_SCORE]);

  const currentYearData = currentData.paymentHistory[historyYearIndex];
  const handlePrevYear = () => setHistoryYearIndex(prev => Math.min(prev + 1, currentData.paymentHistory.length - 1));
  const handleNextYear = () => setHistoryYearIndex(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans select-none selection:bg-gold/30">
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-30 h-10 w-10 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/80"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-6 w-6 text-primary" />
      </Button>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.92); }
        }
      `}</style>

      {/* 1. Interactive Score Header */}
      <div className="w-full max-w-md mx-auto px-6 pt-6 pb-2 z-20">
        <div className="flex gap-4 pb-2">
          <ScoreCard
            provider="CIBIL"
            score={765}
            isActive={activeTab === 'CIBIL'}
            onClick={() => setActiveTab('CIBIL')}
          />
          <ScoreCard
            provider="EQUIFAX"
            score={780}
            isActive={activeTab === 'EQUIFAX'}
            onClick={() => setActiveTab('EQUIFAX')}
          />
        </div>
      </div>

      {/* 2. Main Gauge Section */}
      <div className="flex-grow flex flex-col items-center justify-start pt-8 relative min-h-[400px]">
        <div className="text-[10px] tracking-[0.2em] text-gold uppercase font-bold mb-2">FIN Compass</div>
        <h1 className="text-xl md:text-2xl font-bold text-primary font-serif mb-4">set a target score</h1>

        <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center touch-none">
          <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${CENTER_X * 2} ${CENTER_Y * 2}`}
            className="w-full h-full" style={{ touchAction: 'none' }}>
            <defs>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#b4941f" />
              </linearGradient>

              {/* Sunrise Linear Gradient (Outer Arc) */}
              <linearGradient id="sunriseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(212, 175, 55, 0)" />
                <stop offset="50%" stopColor="rgba(212, 175, 55, 0.1)" />
                <stop offset="100%" stopColor="rgba(212, 175, 55, 0.4)" />
              </linearGradient>

              {/* Radial Gradient (Ball Glow) */}
              <radialGradient id="ballGlowRadial">
                <stop offset="0%" stopColor="rgba(212, 175, 55, 0.8)" />
                <stop offset="60%" stopColor="rgba(212, 175, 55, 0.2)" />
                <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
              </radialGradient>

              <filter id="knobShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
              </filter>

              <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {/* Background Track */}
            <path d={createArc(START_ANGLE, END_ANGLE, GAUGE_RADIUS)} fill="none" stroke="#F3F4F6" strokeWidth={STROKE_WIDTH + 4} strokeLinecap="round" />

            {/* Layer 1: Sunrise Effect (Outer Glow Path) */}
            <path
              d={createArc(START_ANGLE, currentAngle, GAUGE_RADIUS + 25)}
              fill="none"
              stroke="url(#sunriseGradient)"
              strokeWidth={24}
              strokeLinecap="round"
              filter="url(#glowBlur)"
              className="opacity-70 pointer-events-none"
            />

            {/* Layer 2: Ball Glow (Radial burst behind the knob) */}
            <circle
              cx={knobPos.x}
              cy={knobPos.y}
              r={32}
              fill="url(#ballGlowRadial)"
              filter="url(#glowBlur)"
              style={{
                animation: 'pulse-glow 3s infinite ease-in-out',
                transformOrigin: `${knobPos.x}px ${knobPos.y}px`
              }}
              className="pointer-events-none"
            />

            {/* Ticks */}
            <g>{ticks}</g>

            {/* Active Gold Path */}
            <path d={createArc(START_ANGLE, currentAngle, GAUGE_RADIUS)} fill="none" stroke="url(#activeGradient)" strokeWidth={STROKE_WIDTH - 16} strokeLinecap="round" strokeOpacity="0.8" />

            {/* Knob - Handlers */}
            <g
              transform={`translate(${knobPos.x}, ${knobPos.y})`}
              className="cursor-grab active:cursor-grabbing"
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
            >
              {/* Invisible larger hit area for easier grabbing */}
              <circle r={35} fill="transparent" />
              <circle r={22} fill="rgba(212, 175, 55, 0.1)" className="pointer-events-none" />
              <circle r={14} fill="#0f172a" stroke="#fff" strokeWidth={3} filter="url(#knobShadow)" className="pointer-events-none" />
              <circle r={5} fill="#d4af37" className="pointer-events-none" />
            </g>

            <text x={60} y={320} className="text-[10px] fill-gray-400 font-bold tracking-widest">{MIN_SCORE}</text>
            <text x={320} y={320} className="text-[10px] fill-gray-400 font-bold tracking-widest">{MAX_SCORE}</text>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
            <div className={`flex items-center gap-0.5 text-gold font-bold text-sm mb-1 transition-opacity duration-500 ${delta > 0 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="tabular-nums">+{delta}</span>
              <ArrowUp size={14} strokeWidth={3} />
            </div>
            <div className="relative">
              <h2 className="text-6xl md:text-7xl font-bold text-primary tracking-tight tabular-nums leading-none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                {displayScoreInt}
              </h2>
              <div className="absolute -bottom-5 left-0 right-0 text-center">
                <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Target</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Bubble / Action Context */}
        <div className="px-6 w-full max-w-md mx-auto z-10 mt-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3 mb-4">
            <div className="bg-primary/5 p-1.5 rounded-full flex-shrink-0 mt-0.5">
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold">!</div>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">
              <span className="font-bold text-primary">{displayScoreInt}</span> is achievable by <span className="font-bold text-primary">Dec 2025</span> if you follow the recommended plan.
            </p>
          </div>

          {/* Functional Set Goal Button - Placed below gauge */}
          {!goalSet ? (
            <button
              onClick={handleSetGoal}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl text-sm tracking-wider uppercase shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 group"
            >
              Set Target <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
          ) : (
            <div className="w-full bg-emerald-50 text-emerald-700 font-bold py-4 rounded-xl text-sm tracking-wider uppercase border border-emerald-100 flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
              Target Set <Check size={18} strokeWidth={3} />
            </div>
          )}
        </div>
      </div>

      {/* 3. Goal Action Plan (Revealed on click) */}
      {goalSet && (
        <div ref={goalSectionRef} className="bg-primary text-white py-10 px-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-10 duration-500">
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gold">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Steps to achieve {displayScoreInt}</h3>
                <p className="text-xs text-gray-400">Personalized for {activeTab}</p>
              </div>
            </div>

            <div className="space-y-4">
              {currentData.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-4 items-start">
                  <div className="bg-white/10 p-2 rounded-lg text-gold shrink-0">
                    <rec.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white mb-1">{rec.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed lowercase">
                      {rec.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


