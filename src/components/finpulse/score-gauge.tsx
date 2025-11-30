"use client";

import * as React from "react";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ScoreGaugeProps = {
  score: number;
  className?: string;
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [currentValue, setCurrentValue] = React.useState(0);
  const prevValueRef = React.useRef(0);

  React.useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    let startTime: number | null = null;
    const duration = 800; // Animation duration in ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // easeOutCubic easing function
      const easedPercentage = 1 - Math.pow(1 - percentage, 3);

      const animatedValue = Math.floor(startValue + (endValue - startValue) * easedPercentage);
      setCurrentValue(animatedValue);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    requestAnimationFrame(animate);

    return () => {
      // No cleanup needed as requestAnimationFrame stops itself
    };
  }, [value]);

  return <>{currentValue}</>;
};

export function ScoreGauge({ score, className }: ScoreGaugeProps) {
  const scoreData = [
    { name: "score", value: ((score - 300) / 600) * 100, fill: "url(#score-gradient)" },
  ];

  const getScoreTier = (s: number) => {
    if (s < 580) return { tier: "Poor", color: "text-red-500" };
    if (s < 670) return { tier: "Fair", color: "text-orange-500" };
    if (s < 740) return { tier: "Good", color: "text-yellow-500" };
    if (s < 800) return { tier: "Very Good", color: "text-green-400" };
    return { tier: "Excellent", color: "text-green-500" };
  };

  const scoreInfo = getScoreTier(score);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-headline">Your Credit Score</CardTitle>
        <CardDescription>Updated today</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="80%"
              outerRadius="100%"
              barSize={20}
              data={scoreData}
              startAngle={180}
              endAngle={-180}
            >
              <defs>
                <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="hsl(var(--chart-5))" />
                  <stop offset="25%" stopColor="hsl(var(--chart-4))" />
                  <stop offset="50%" stopColor="hsl(var(--chart-3))" />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" />
                </linearGradient>
              </defs>
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "hsl(var(--muted))" }}
                dataKey="value"
                angleAxisId={0}
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-headline text-4xl sm:text-6xl font-bold tracking-tighter">
              <AnimatedNumber value={score} />
            </span>
            <span className={`text-sm sm:text-base font-semibold ${scoreInfo.color}`}>
              {scoreInfo.tier}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
