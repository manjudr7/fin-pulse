
'use client';

import React from 'react';
import { accounts, paymentHistory } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FactorDetail, FactorKey } from '@/lib/credit-factors-data';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type PaymentItem = {
    loanType: string;
    year: number;
    month: string;
    status: number;
};

const PaymentList = ({ items }: { items: PaymentItem[] }) => (
    <ScrollArea className="h-48">
        <div className="space-y-2 pr-4">
            {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs bg-white/50 p-2 rounded-md">
                    <span className="font-semibold">{item.loanType}</span>
                    <span className="text-gray-500">{item.month} {item.year}</span>
                </div>
            ))}
        </div>
    </ScrollArea>
);

const PaymentHistoryBreakdown = () => {
    const allPayments = React.useMemo(() => {
        const payments: PaymentItem[] = [];

        paymentHistory.forEach(accountHistory => {
            const accountInfo = accounts.find(acc => acc.id === accountHistory.accountId);
            if (!accountInfo) return;

            accountHistory.history.forEach(yearHistory => {
                yearHistory.payments.forEach((paymentStatus, monthIndex) => {
                    if (paymentStatus !== 0) { // Exclude 'Not Reported'
                        payments.push({
                            loanType: accountInfo.loanType || accountInfo.type,
                            year: yearHistory.year,
                            month: monthNames[monthIndex],
                            status: paymentStatus,
                        });
                    }
                });
            });
        });

        const sortPayments = (a: PaymentItem, b: PaymentItem) => {
            if (a.year !== b.year) return b.year - a.year;
            return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
        };
        
        return payments.sort(sortPayments);
    }, []);

    return (
        <PaymentList items={allPayments} />
    );
};

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start">
      <span className="text-[#B27C88] mr-2 mt-1">•</span>
      <p className="text-sm text-gray-700">{children}</p>
    </div>
);
  
const DonutChart: React.FC<{ bankData: any[]; bankCount: number }> = ({ bankData, bankCount }) => (
      <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                  <Pie
                      data={bankData}
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      dataKey="percentage"
                      startAngle={-90}
                      endAngle={270}
                      stroke="none"
                  >
                      {bankData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
              </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-lg font-bold text-gray-900">{bankCount}</p>
              <p className="text-[10px] text-gray-600 -mt-1">BANKS</p>
          </div>
      </div>
);

const BankBreakdownRow: React.FC<{ data: any }> = ({ data }) => (
    <div className="flex w-full items-center justify-between py-1">
        <div className="flex items-center">
            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: data.color }} />
            <div>
                <p className="text-xs font-medium text-gray-800">{data.name}</p>
                <p className="text-[10px] text-gray-500">{data.loans} Loans</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-xs font-bold text-gray-800">₹ {data.amount} Cr</p>
            <p className="text-[10px] text-gray-500">{(data.percentage * 100).toFixed(0)}%</p>
        </div>
    </div>
);

const BankBreakdown: React.FC<{ bankData: any[] }> = ({ bankData }) => (
    <div className="w-full">
        <h4 className="text-xs font-bold text-gray-700">BY BANK</h4>
        <p className="text-[11px] text-gray-500 mt-1">Below is a break-up of outstanding amount across different banks and their contribution to overall credit exposure.</p>
        <div className="flex flex-col md:flex-row items-center justify-center mt-3 gap-4">
            <DonutChart bankData={bankData} bankCount={17} />
            <div className="flex-1 space-y-1 w-full">
                {bankData.map(data => <BankBreakdownRow key={data.name} data={data} />)}
            </div>
        </div>
    </div>
);

interface PaymentHistoryCardProps {
    activeFactorDetail: FactorDetail;
}

export const PaymentHistoryCard = ({ activeFactorDetail }: PaymentHistoryCardProps) => {

    const renderContent = () => {
        switch (activeFactorDetail.id) {
            case FactorKey.PaymentHistory:
                return <PaymentHistoryBreakdown />;
            case FactorKey.CreditUsage:
                return activeFactorDetail.bankBreakdown ? <BankBreakdown bankData={activeFactorDetail.bankBreakdown} /> : null;
            default:
                return (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 min-h-[12rem] flex flex-col justify-center">
                         <div className="space-y-1">
                           {activeFactorDetail.bullets?.map((bullet, i) => <Bullet key={i}>{bullet}</Bullet>)}
                         </div>
                         <p className="text-xs text-gray-600 font-medium mt-4">{activeFactorDetail.summary}</p>
                    </div>
                )
        }
    };

    return (
        <Card className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 text-gray-800">
            <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-bold text-gray-800">{activeFactorDetail.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {renderContent()}
            </CardContent>
        </Card>
    )
}
