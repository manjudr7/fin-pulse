
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { equifaxAccounts, cibilAccounts, Account } from '@/lib/mock-data';
import CreditScoreCardInsights from '@/components/finpulse/CreditScoreCardInsights';
import { PaymentHistoryCard } from '@/components/finpulse/PaymentHistoryCard';
import { creditFactorsData, FactorKey } from '@/lib/credit-factors-data';
import { ChevronRight } from 'lucide-react';

const BankLogo = ({ bank }: { bank: string }) => {
  const logoUrls: { [key: string]: string } = {
    HDFC: 'https://logo.clearbit.com/hdfcbank.com',
    SBI: 'https://logo.clearbit.com/sbi.co.in',
    Axis: 'https://logo.clearbit.com/axisbank.com',
    ICICI: 'https://logo.clearbit.com/icicibank.com',
    Yes: 'https://logo.clearbit.com/yesbank.in',
    Kotak: 'https://logo.clearbit.com/kotak.com',
    'default': 'https://logo.clearbit.com/example.com'
  };

  const logoUrl = logoUrls[bank] || logoUrls['default'];

  return (
    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white overflow-hidden shadow-sm border border-gray-100">
      <Image src={logoUrl} alt={`${bank} logo`} width={40} height={40} className="object-contain p-1" style={{ width: 'auto', height: '100%' }} />
    </div>
  );
};

export default function InsightsPage() {
  const [filter, setFilter] = React.useState('All');
  const [scoreProvider, setScoreProvider] = React.useState('Equifax');
  const [isMounted, setIsMounted] = React.useState(false);
  const [activeFactor, setActiveFactor] = React.useState<FactorKey>(FactorKey.PaymentHistory);

  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<{ isSubscribed: boolean; equifaxScore: number; cibilScore: number; }>(userDocRef);

  const isPro = user?.uid === 'kadjYDNAiW3pZSKjcLaYvLnjzaIu';
  const isSubscribed = userData?.isSubscribed ?? false;
  const hasAccess = isPro || isSubscribed;

  const [displayedScore, setDisplayedScore] = React.useState(765);

  React.useEffect(() => {
    if (isMounted && !hasAccess && userData) {
      router.replace('/dashboard/pro');
    }
  }, [isMounted, hasAccess, userData, router]);

  React.useEffect(() => {
    setIsMounted(true);
    if (userData) {
      if (scoreProvider === 'Equifax') {
        setDisplayedScore(userData.equifaxScore || 765);
      } else if (scoreProvider === 'Transunion') {
        setDisplayedScore(userData.cibilScore || 765);
      } else {
        setDisplayedScore(userData.equifaxScore || 765);
      }
    }
  }, [userData, scoreProvider]);

  const financialItems = scoreProvider === 'Equifax' ? equifaxAccounts : cibilAccounts;

  const counts = React.useMemo(() => {
    const all = financialItems.length;
    const cards = financialItems.filter(item => item.type === 'Card').length;
    const loans = financialItems.filter(item => item.type === 'Loan').length;
    return { all, cards, loans };
  }, [financialItems]);

  const filteredItems = financialItems.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Cards') return item.type === 'Card';
    return item.type === filter;
  });

  const handleItemClick = (itemId: string) => {
    router.push(`/dashboard/account?id=${itemId}`);
  };

  const handleProviderChange = (provider: string) => {
    setScoreProvider(provider);
  };

  const activeFactorDetail = creditFactorsData.factors.find(f => f.id === activeFactor)!;

  const FilterButton = ({ value, label, count }: { value: string, label: string, count: number }) => (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "rounded-full border transition-all duration-300 px-4 py-1 h-8 text-xs font-medium",
        filter === value
          ? "bg-primary text-white border-primary shadow-md"
          : "bg-white text-muted-foreground border-border hover:bg-muted hover:text-primary"
      )}
      onClick={() => setFilter(value)}
    >
      {label} <span className="ml-1 opacity-70">({count})</span>
    </Button>
  );

  return (
    <div className="bg-background min-h-screen selection:bg-gold/30">
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-border/40 px-4 py-3">
        <div className="w-full max-w-md mx-auto">
          <div className="relative flex w-full h-10 bg-muted/50 rounded-xl p-1 shadow-inner">
            <button
              className={cn(
                "relative flex-1 flex items-center justify-center text-xs font-bold transition-colors duration-300 z-10 rounded-lg",
                {
                  'text-primary-foreground': scoreProvider === 'Equifax',
                  'text-muted-foreground hover:text-primary': scoreProvider !== 'Equifax'
                }
              )}
              onClick={() => handleProviderChange('Equifax')}
            >
              Equifax
            </button>

            <button
              className={cn(
                "relative flex-1 flex items-center justify-center text-xs font-bold transition-colors duration-300 z-10 rounded-lg",
                {
                  'text-primary-foreground': scoreProvider === 'Transunion',
                  'text-muted-foreground hover:text-primary': scoreProvider !== 'Transunion'
                }
              )}
              onClick={() => handleProviderChange('Transunion')}
            >
              <div className="flex flex-col text-center leading-none gap-0.5">
                <span>CIBIL</span>
                <span className="text-[8px] font-medium opacity-80">Transunion</span>
              </div>
            </button>

            <div
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg shadow-lg shadow-primary/20 transition-transform duration-300 ease-out",
                {
                  'translate-x-[4px]': scoreProvider === 'Equifax',
                  'translate-x-[calc(100%)]': scoreProvider === 'Transunion'
                }
              )}
            />
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto pb-24 space-y-6">

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col justify-between h-28">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Balance</p>
            <div>
              <h2 className="text-xl font-bold text-primary tracking-tight">₹21.0L</h2>
              <span className="text-[10px] font-medium text-muted-foreground">Outstanding</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col justify-between h-28">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Due</p>
            <div>
              <h2 className="text-xl font-bold text-primary tracking-tight">₹72,000</h2>
              <span className="text-[10px] font-medium text-emerald-600">Due in 5 days</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col justify-between h-28">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overdue</p>
            <div>
              <h2 className="text-xl font-bold text-destructive tracking-tight">₹8,500</h2>
              <span className="text-[10px] font-medium text-destructive/80">Action Required</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col justify-between h-28">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Accounts</p>
            <div>
              <h2 className="text-xl font-bold text-primary tracking-tight">6</h2>
              <span className="text-[10px] font-medium text-muted-foreground">Credit Mix: Good</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-primary">Your Accounts</h3>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar">
            <FilterButton value="All" label="All" count={counts.all} />
            <FilterButton value="Cards" label="Cards" count={counts.cards} />
            <FilterButton value="Loan" label="Loans" count={counts.loans} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
            {isMounted &&
              filteredItems.map((item, index) => {
                const lastFourDigits = Math.floor(1000 + Math.random() * 9000);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors group",
                      index !== filteredItems.length - 1 && "border-b border-border/30"
                    )}
                  >
                    <div className="shrink-0">
                      <BankLogo bank={item.bank} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-bold text-primary capitalize truncate pr-2">
                          {item.loanType?.toLowerCase() || item.type.toLowerCase()}
                        </p>
                        <p className="text-sm font-bold text-primary whitespace-nowrap">
                          ₹{item.balance.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {item.bank} •• {lastFourDigits}
                        </p>
                        {item.status === 'Delinquent' ? (
                          <p className="text-[9px] text-destructive font-bold bg-destructive/10 px-1.5 py-0.5 rounded-full">LATE</p>
                        ) : item.status === 'Closed' ? (
                          <p className="text-[9px] text-muted-foreground font-bold bg-muted px-1.5 py-0.5 rounded-full">CLOSED</p>
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-primary px-1">Score Factors</h3>
          <CreditScoreCardInsights activeFactor={activeFactor} onFactorSelected={setActiveFactor} />
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-primary px-1">Payment History</h3>
          <PaymentHistoryCard activeFactorDetail={activeFactorDetail} />
        </div>
      </div>
    </div>
  );
}
