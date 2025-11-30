
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { creditFactorsData, FactorKey } from '@/lib/credit-factors-data';

// --- SUB-COMPONENTS ---

const CardHeader = () => (
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-bold text-gray-800">FinSnap</h3>
    <span className="text-xs text-gray-500 font-medium">Powered by Experian</span>
  </div>
);

const FactorTabBar: React.FC<{
  factors: typeof creditFactorsData.factors;
  activeFactor: FactorKey;
  onFactorSelected: (factor: FactorKey) => void;
}> = ({ factors, activeFactor, onFactorSelected }) => (
  <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
    {factors.map((factor) => (
      <button
        key={factor.id}
        onClick={() => onFactorSelected(factor.id)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap",
          activeFactor === factor.id
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-600 hover:bg-gray-100"
        )}
      >
        {factor.label}
      </button>
    ))}
  </div>
);

const ScoreRow: React.FC<{ currentScore: number; verdict: string; delta: number }> = ({
  currentScore,
  verdict,
  delta,
}) => {
    const isPositive = delta >= 0;
    const pillColor = isPositive ? 'bg-green-600' : 'bg-red-600';
    
    return (
        <div>
            <div className="flex items-center">
                <p className="text-6xl font-extrabold text-gray-900">{currentScore}</p>
                <div className="ml-2">
                    <div className={cn("h-7 flex items-center justify-center rounded-full px-3", pillColor)}>
                        <p className="text-sm font-semibold text-white">
                            {isPositive ? '+' : ''}{delta}
                        </p>
                    </div>
                </div>
            </div>
            <p className="text-lg font-semibold text-[#B27C88]">{verdict}</p>
            <p className="text-xs text-[#8C7E83]">Based on your latest report</p>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface CreditScoreCardInsightsProps {
    activeFactor: FactorKey;
    onFactorSelected: (factor: FactorKey) => void;
}

const CreditScoreCardInsights: React.FC<CreditScoreCardInsightsProps> = ({ activeFactor, onFactorSelected }) => {
    
    const activeFactorDetail = creditFactorsData.factors.find(f => f.id === activeFactor);

    if (!activeFactorDetail) {
        return null; 
    }

    return (
        <div className="bg-[#FDF5F5] rounded-3xl shadow-lg p-4 sm:p-6 w-full">
            <CardHeader />
            <div className="mt-3">
                <FactorTabBar
                    factors={creditFactorsData.factors}
                    activeFactor={activeFactor}
                    onFactorSelected={onFactorSelected}
                />
            </div>
            <div className="mt-5">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFactor}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col"
                    >
                        <ScoreRow 
                            currentScore={creditFactorsData.currentScore}
                            verdict={creditFactorsData.verdict}
                            delta={activeFactorDetail.scoreDelta}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CreditScoreCardInsights;

    