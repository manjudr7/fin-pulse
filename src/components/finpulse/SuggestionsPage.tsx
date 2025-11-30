
'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Suggestion = {
  id: string;
  title: string;
  description: string;
  impact: number;
  timeframe: string;
  difficulty: string;
  icon: LucideIcon;
  category: string;
};

interface SuggestionsPageProps {
  currentScore: number;
  targetScore: number;
  suggestions: Suggestion[];
  onBack: () => void;
}

export function SuggestionsPage({ currentScore, targetScore, suggestions, onBack }: SuggestionsPageProps) {
  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Back Button */}
      <Button onClick={onBack} variant="ghost" className="absolute top-6 left-6 z-20 text-gray-400 hover:text-white">
        &larr; Back to Goal Setting
      </Button>

      {/* Header */}
      <div className="text-center my-12 relative z-10">
        <motion.h1 
          className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Action Plan
        </motion.h1>
        <motion.p 
          className="text-gray-400 mt-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          From {currentScore} to your goal of {targetScore}
        </motion.p>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4 max-w-2xl mx-auto relative z-10">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.div
              key={suggestion.id}
              className="p-5 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <Icon className="h-6 w-6 text-purple-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-200">{suggestion.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{suggestion.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                    <span>Impact: +{suggestion.impact} pts</span>
                    <span>Time: {suggestion.timeframe}</span>
                    <span>Difficulty: {suggestion.difficulty}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
