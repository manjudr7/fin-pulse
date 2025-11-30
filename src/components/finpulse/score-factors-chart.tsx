
"use client";

import * as React from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { scoreFactors } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export function ScoreFactorsChart() {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Why Your Score is 780</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("w-full aspect-square max-w-sm mx-auto", isMobile ? "h-[200px]" : "h-[250px]")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scoreFactors}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={isMobile ? 80 : 100}
                innerRadius={isMobile ? 40: 60}
                dataKey="value"
                animationDuration={800}
                animationBegin={100}
              >
                {scoreFactors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                align="center"
                iconSize={8}
                wrapperStyle={{ fontSize: isMobile ? '10px' : '12px', marginTop: '16px' }}
                content={(props) => {
                  const { payload } = props;
                  if (!payload) return null;

                  if (isMobile) {
                    return (
                        <div className="overflow-x-auto whitespace-nowrap -mx-4 px-4 pb-2">
                            <ul className="flex justify-start gap-4">
                                {payload.map((entry: any, index) => (
                                    <li key={`item-${index}`} className="flex items-center gap-1.5 shrink-0">
                                        <span className="h-2 w-2 rounded-full" style={{backgroundColor: entry.color}}></span>
                                        <span className="text-xs">{entry.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                  }
                  
                  const firstRow = payload.slice(0, 3);
                  const secondRow = payload.slice(3, 5);

                  const renderRow = (rowData: any[]) => (
                     <ul className="flex justify-center gap-4">
                        {rowData.map((entry: any, index) => (
                          <li key={`item-${index}`} className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{backgroundColor: entry.color}}></span>
                            <span className="text-xs">{entry.value}</span>
                          </li>
                        ))}
                    </ul>
                  );

                  return (
                    <div className="flex flex-col items-center gap-2 mt-4">
                      {renderRow(firstRow)}
                      {renderRow(secondRow)}
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
