
"use client";

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import * as React from 'react';

interface DualScoreCardProps {
  onUnlockClick: () => void;
  isSubscribed: boolean;
  equifaxScore?: number;
}

const ScoreRing = ({ score, provider, isLocked }: { score: number; provider: 'Equifax' | 'CIBIL', isLocked?: boolean }) => {
    const GAUGE_RADIUS = 60;
    const STROKE_WIDTH = 12;
    const CENTER_X = 70;
    const CENTER_Y = 70;
    const START_ANGLE = 135;
    const END_ANGLE = 405;

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const getCoordinates = (angleInDegrees: number, radius = GAUGE_RADIUS) => {
        const angleInRad = toRad(angleInDegrees);
        return {
            x: CENTER_X + radius * Math.cos(angleInRad),
            y: CENTER_Y + radius * Math.sin(angleInRad),
        };
    };

    const scoreToAngle = (s: number) => {
        const minScore = 300;
        const maxScore = 900;
        const percentage = Math.max(0, Math.min(1, (s - minScore) / (maxScore - minScore)));
        return START_ANGLE + percentage * (END_ANGLE - START_ANGLE);
    };

    const createArc = (start: number, end: number, radius: number) => {
        const startPos = getCoordinates(start, radius);
        const endPos = getCoordinates(end, radius);
        const largeArcFlag = end - start <= 180 ? "0" : "1";
        return ["M", startPos.x, startPos.y, "A", radius, radius, 0, largeArcFlag, 1, endPos.x, endPos.y].join(" ");
    };

    const currentAngle = scoreToAngle(score);
    const providerLogo = provider === 'Equifax' ? "/Equifax.png" : "/CIBIL.png";
    
    if (isLocked) {
        return (
            <div className="relative w-full aspect-square max-w-[140px] sm:max-w-[160px]">
                <svg width="100%" height="100%" viewBox="0 0 140 140" className="blur-sm">
                    <path
                        d={createArc(START_ANGLE, END_ANGLE, GAUGE_RADIUS)}
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                    />
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ transform: 'translateY(8%)' }}>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white/60 blur-sm">XXX</div>
                    <div className="flex flex-col items-center -space-y-0.5">
                        <span className="text-[7px] text-white/40 font-medium">Powered by</span>
                        <Image src={providerLogo} alt={provider} width={provider === 'CIBIL' ? 80 : 60} height={15} style={{width: 'auto', height: '15px'}}/>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full aspect-square max-w-[140px] sm:max-w-[160px]">
            <svg width="100%" height="100%" viewBox="0 0 140 140">
                <defs>
                    <linearGradient id={`sunriseGradient-${provider}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(251, 146, 60, 0)" />
                        <stop offset="50%" stopColor="rgba(251, 146, 60, 0.1)" />
                        <stop offset="100%" stopColor="rgba(251, 146, 60, 0.6)" />
                    </linearGradient>
                    <filter id={`glowBlur-${provider}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" />
                    </filter>
                     <radialGradient id={`pulseGlow-${provider}`}>
                        <stop offset="0%" stopColor="rgba(80, 70, 220, 0.7)" />
                        <stop offset="70%" stopColor="rgba(80, 70, 220, 0)" />
                    </radialGradient>
                </defs>
                
                {/* Base track */}
                <path
                    d={createArc(START_ANGLE, END_ANGLE, GAUGE_RADIUS)}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                />

                {/* Score fill */}
                 <path
                    d={createArc(START_ANGLE, currentAngle, GAUGE_RADIUS)}
                    fill="none"
                    stroke="url(#sunriseGradient-Equifax)"
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    filter={`url(#glowBlur-${provider})`}
                />
                <path
                    d={createArc(START_ANGLE, currentAngle, GAUGE_RADIUS)}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={STROKE_WIDTH / 3}
                    strokeLinecap="round"
                />

                <circle cx={CENTER_X} cy={CENTER_Y} r={GAUGE_RADIUS - STROKE_WIDTH / 2 - 5} fill={`url(#pulseGlow-${provider})`} opacity="0.5" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ transform: 'translateY(8%)' }}>
                 <div 
                  className="text-3xl sm:text-4xl font-extrabold text-white"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 10px rgba(255,255,255,0.3)' }}
                >
                  {score}
                </div>
                <div className="flex flex-col items-center -space-y-0.5">
                    <span className="text-[7px] text-white/40 font-medium">Powered by</span>
                    <Image src={providerLogo} alt={provider} width={provider === 'CIBIL' ? 80 : 60} height={15} style={{width: 'auto', height: '15px'}} />
                </div>
            </div>
        </div>
    );
};


export function DualScoreCard({ onUnlockClick, isSubscribed, equifaxScore = 780 }: DualScoreCardProps) {

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[2.1/1] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#2C63D6] to-[#0F214D]">
      
      <div className="relative grid grid-cols-2 gap-1 sm:gap-2 items-center h-full p-2 sm:p-4">
        {/* Left Column: Equifax */}
        <div className="flex flex-col items-center justify-center h-full">
          <ScoreRing score={equifaxScore} provider="Equifax" />
        </div>

        {/* Right Column: CIBIL */}
        <div className="flex flex-col items-center justify-center h-full">
           {isSubscribed ? (
               <ScoreRing score={765} provider="CIBIL" />
           ) : (
             <div className="relative w-full aspect-square max-w-[140px] sm:max-w-[160px] flex items-center justify-center">
                <ScoreRing score={765} provider="CIBIL" isLocked={true} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Button
                      onClick={onUnlockClick}
                      className="bg-gray-200/60 hover:bg-gray-200/80 text-gray-800 font-semibold py-1 px-2.5 rounded-full flex items-center justify-center gap-1 transition duration-200 shadow-md text-xs h-auto backdrop-blur-sm pointer-events-auto"
                    >
                      <Lock className="h-3 w-3" />
                      Unlock
                    </Button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
