
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowUp } from 'lucide-react';

const CredTargetGauge = () => {
  // --- Configuration ---
  const MIN_SCORE = 751; 
  const MAX_SCORE = 807; 
  const GAUGE_RADIUS = 140;
  const STROKE_WIDTH = 24; // Slightly thicker for mobile visibility
  const CENTER_X = 200;
  const CENTER_Y = 200;

  const START_ANGLE = 135;
  const END_ANGLE = 405;

  // --- State ---
  // visualScore is the floating-point value currently displayed (for smoothness)
  const [visualScore, setVisualScore] = useState(MIN_SCORE);
  const [isDragging, setIsDragging] = useState(false);

  // We use a ref for the target to avoid re-renders during the drag logic itself
  // The animation loop reads this ref to know where to go.
  const targetScoreRef = useRef(MIN_SCORE);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // --- Helpers ---

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const getCoordinates = (angleInDegrees: number, radius = GAUGE_RADIUS) => {
    const angleInRad = toRad(angleInDegrees);
    return {
      x: CENTER_X + radius * Math.cos(angleInRad),
      y: CENTER_Y + radius * Math.sin(angleInRad),
    };
  };

  // Map score to angle
  const scoreToAngle = (s: number) => {
    const percentage = (s - MIN_SCORE) / (MAX_SCORE - MIN_SCORE);
    return START_ANGLE + percentage * (END_ANGLE - START_ANGLE);
  };

  // Map angle to score
  const angleToScore = (angle: number) => {
    let normalizedAngle = angle;
    if (normalizedAngle < 90) normalizedAngle += 360;
    const clampedAngle = Math.min(Math.max(normalizedAngle, START_ANGLE), END_ANGLE);
    const percentage = (clampedAngle - START_ANGLE) / (END_ANGLE - START_ANGLE);
    return MIN_SCORE + percentage * (MAX_SCORE - MIN_SCORE);
  };

  // --- Physics / Animation Loop ---
  // This ensures the "point by point" movement. 
  // Even if the user drags fast, the UI catches up smoothly.
  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      setVisualScore((prev) => {
        const target = targetScoreRef.current;
        const diff = target - prev;

        // If we are very close, snap to target to stop micro-calculations
        if (Math.abs(diff) < 0.05) {
          return target;
        }

        // Interpolation factor (0.15). 
        // Lower = heavier/smoother, Higher = snappier.
        // 0.15 gives a nice "weighted" feel.
        return prev + diff * 0.15;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- Interaction Logic ---

  const handleInput = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    // Snap logic for the bottom gap
    if (angle > 90 && angle < 135) angle = 135; 
    if (angle > 45 && angle < 90) angle = 405; 
    
    let linearAngle = angle;
    if (angle >= 0 && angle <= 45) linearAngle = 360 + angle;

    // Update the TARGET, not the visual state directly
    targetScoreRef.current = angleToScore(linearAngle);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInput(e.clientX, e.clientY);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleInput(e.clientX, e.clientY);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      // Crucial: prevent scrolling while interacting
      e.preventDefault(); 
      handleInput(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

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

  // --- Render Helpers ---

  const createArc = (start: number, end: number, radius: number) => {
    const startPos = getCoordinates(start, radius);
    const endPos = getCoordinates(end, radius);
    // If the arc is a full circle or close to it, we need careful largeArcFlag logic
    // or just clamp it. Here strictly for gauge usage:
    const largeArcFlag = end - start <= 180 ? "0" : "1";
    return [
      "M", startPos.x, startPos.y,
      "A", radius, radius, 0, largeArcFlag, 1, endPos.x, endPos.y
    ].join(" ");
  };

  const currentAngle = scoreToAngle(visualScore);
  const displayScoreInt = Math.round(visualScore);
  const delta = displayScoreInt - MIN_SCORE;

  // Dynamic ticks that light up based on the visualScore
  const ticks = useMemo(() => {
    const tickArray = [];
    const totalTicks = 50; // Denser ticks for smoother look
    const angleStep = (END_ANGLE - START_ANGLE) / totalTicks;

    for (let i = 0; i <= totalTicks; i++) {
      const angle = START_ANGLE + i * angleStep;
      const isActive = angle <= currentAngle;

      const inner = getCoordinates(angle, GAUGE_RADIUS - 20);
      const outer = getCoordinates(angle, GAUGE_RADIUS - 8);

      tickArray.push(
        <line
          key={i}
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          stroke={isActive ? "#22c55e" : "#E5E7EB"} // Green-500 vs Gray-200
          strokeWidth={2}
          strokeLinecap="round"
          style={{ transition: 'stroke 0.1s ease' }} // subtle CSS transition for color
        />
      );
    }
    return tickArray;
  }, [currentAngle]);

  const knobPos = getCoordinates(currentAngle, GAUGE_RADIUS);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none overflow-hidden">
      {/* Header */}
      <div className="pt-6 px-6 text-center z-10">
        <div className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold mb-2">
          Fin Compass
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 font-serif">
          set a target score
        </h1>
      </div>

      {/* Main Gauge Container */}
      <div className="flex-grow flex flex-col items-center justify-center relative -mt-4">
        {/* touch-action-none is vital for mobile. 
            It stops the browser from hijacking swipes for scrolling */}
        <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center touch-none">
        
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${CENTER_X * 2} ${CENTER_Y * 2}`}
            className="w-full h-full cursor-pointer"
            style={{ touchAction: 'none' }} // Inline style fallback
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            <defs>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <filter id="knobShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Track */}
            <path
              d={createArc(START_ANGLE, END_ANGLE, GAUGE_RADIUS)}
              fill="none"
              stroke="#F3F4F6"
              strokeWidth={STROKE_WIDTH + 4}
              strokeLinecap="round"
            />

            {/* Ticks */}
            <g>{ticks}</g>

            {/* Active Path (interpolated) */}
            <path
              d={createArc(START_ANGLE, currentAngle, GAUGE_RADIUS)}
              fill="none"
              stroke="url(#activeGradient)"
              strokeWidth={STROKE_WIDTH - 16} // Thin line inside ticks
              strokeLinecap="round"
              strokeOpacity="0.5"
            />

            {/* Knob (interpolated) */}
            <g
              transform={`translate(${knobPos.x}, ${knobPos.y})`}
              className="cursor-grab active:cursor-grabbing"
            >
              <circle r={22} fill="rgba(34, 197, 94, 0.1)" />
              <circle
                r={14}
                fill="#1f2937"
                stroke="#fff"
                strokeWidth={3}
                filter="url(#knobShadow)"
              />
              <circle r={5} fill="#4ADE80" />
            </g>

            {/* Range Labels */}
            <text x={60} y={320} className="text-[10px] fill-gray-400 font-bold tracking-widest">{MIN_SCORE}</text>
            <text x={320} y={320} className="text-[10px] fill-gray-400 font-bold tracking-widest">{MAX_SCORE}</text>
          </svg>

          {/* Center Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
            
            {/* Delta (+56) */}
            <div 
               className={`flex items-center gap-0.5 text-green-600 font-bold text-sm mb-1 transition-opacity duration-500 ${delta > 0 ? 'opacity-100' : 'opacity-0'}`}
            >
              <span className="tabular-nums">{delta}</span>
              <ArrowUp size={14} strokeWidth={3} />
            </div>

            {/* Main Number (Rolling) */}
            <div className="relative">
              <h2 
                 className="text-6xl md:text-7xl font-bold text-gray-800 tracking-tight tabular-nums leading-none"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {displayScoreInt}
              </h2>
              <div className="absolute -bottom-5 left-0 right-0 text-center">
                <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Target</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="px-6 pb-8 w-full max-w-md mx-auto z-10">
        <div className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-start gap-4 mb-6">
          <div className="bg-blue-50 p-2 rounded-full flex-shrink-0 mt-1">
             <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-white text-[10px] font-bold">
               !
             </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            <span className="font-bold text-gray-900">{displayScoreInt}</span> is the highest score you can realistically reach in the next 3 years.
          </p>
        </div>

        <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl text-sm tracking-wider uppercase shadow-xl active:scale-[0.98] transition-transform">
          Set target
        </button>
        
        <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed px-8">
          it's easier to improve with a goal. set a realistic target to ensure progress.
        </p>
      </div>
    </div>
  );
};

export default CredTargetGauge;
