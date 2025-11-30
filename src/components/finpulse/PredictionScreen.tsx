'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, TrendingUp, Sparkles } from 'lucide-react';
import React from 'react';

type LoanDetails = {
  name: string;
  description: string;
  benefits: string[];
  interestRate: string;
  recommendation: string;
};

interface PredictionScreenProps {
  currentScore: number;
  loanDetails: LoanDetails;
  onBack: () => void;
}

export function PredictionScreen({ currentScore, loanDetails, onBack }: PredictionScreenProps) {
  // Simulate prediction logic
  const shortTermImpact = -Math.floor(Math.random() * 15) + 5; // -10 to +5
  const longTermImpact = Math.floor(Math.random() * 40) + 20; // +20 to +60

  const ImpactArrow = shortTermImpact >= 0 ? ArrowUp : ArrowDown;
  const impactColor = shortTermImpact >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex flex-col">
      <Button onClick={onBack} variant="ghost" className="absolute top-6 left-6 z-20 text-gray-400 hover:text-white">
        &larr; Back
      </Button>

      <div className="text-center my-12 z-10">
        <motion.h1 
          className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Score Impact Prediction
        </motion.h1>
        <motion.p 
          className="text-gray-400 mt-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          For taking a new {loanDetails.name}
        </motion.p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center space-y-8 z-10">
        {/* Short-Term Impact */}
        <motion.div
          className="w-full max-w-sm text-center p-6 border border-gray-800 rounded-2xl bg-gray-900/50 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-gray-400">Short-Term Impact (1-3 Months)</h2>
          <div className={`flex items-center justify-center gap-2 my-4 ${impactColor}`}>
            <ImpactArrow size={40} />
            <span className="text-6xl font-bold">{Math.abs(shortTermImpact)}</span>
            <span className="text-2xl font-semibold">pts</span>
          </div>
          <p className="text-sm text-gray-500">
            A new hard inquiry and a lower average credit age might temporarily decrease your score.
          </p>
        </motion.div>

        {/* Long-Term Impact */}
        <motion.div
          className="w-full max-w-sm text-center p-6 border border-gray-800 rounded-2xl bg-gray-900/50 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold text-gray-400">Potential Long-Term Gain (12+ Months)</h2>
          <div className="flex items-center justify-center gap-2 my-4 text-green-400">
            <TrendingUp size={40} />
            <span className="text-6xl font-bold">+{longTermImpact}</span>
            <span className="text-2xl font-semibold">pts</span>
          </div>
          <p className="text-sm text-gray-500">
            With on-time payments, a diversified credit mix will significantly boost your score over time.
          </p>
        </motion.div>
      </div>
      
      <div className="text-center text-xs text-gray-600 mt-8 z-10">
        <Sparkles className="inline-block h-4 w-4 mr-1 text-blue-400" />
        This is a simulation. Actual score changes may vary.
      </div>
    </div>
  );
}
