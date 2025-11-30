
'use client';

import * as React from 'react';
import { type RecommendOffersOutput } from "@/ai/flows/personalized-offer-recommendations";
import { OfferCard } from "@/components/finpulse/offer-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';

export default function OffersPage() {
  const [offers, setOffers] = React.useState<RecommendOffersOutput | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<{ isSubscribed: boolean; equifaxScore: number }>(userDocRef);

  const isPro = user?.uid === 'kadjYDNAiW3pZSKjcLaYvLnjzaIu';
  const isSubscribed = userData?.isSubscribed ?? false;
  const hasAccess = isPro || isSubscribed;

  React.useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }

    async function getOffers() {
      setLoading(true);
      try {
        // Mock data for static export (Server Actions not supported)
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

        const result: RecommendOffersOutput = [
          {
            title: "Traveler's Plus Card",
            type: "credit card",
            bank: "HDFC Bank",
            tags: ["Airlines", "Lounge Access"],
            rate: 14.99,
            annualFee: 499,
            keyBenefits: "Earn 2x miles on all travel bookings. Complimentary lounge access worldwide. No foreign transaction fees.",
            eligibilityRules: "Minimum credit score of 720 required. Minimum annual income of ₹8,00,000.",
            partnerLink: "#"
          },
          {
            title: "Cashback King Card",
            type: "credit card",
            bank: "ICICI Bank",
            tags: ["Cashback", "Shopping"],
            rate: 18.99,
            annualFee: 0,
            keyBenefits: "5% cashback on online shopping and groceries. 1% cashback on all other spends. No annual fee.",
            eligibilityRules: "Minimum credit score of 680 required.",
            partnerLink: "#"
          },
          {
            title: "Flexi Personal Loan",
            type: "loan",
            bank: "Axis Bank",
            tags: ["Low Interest", "Quick Approval"],
            rate: 10.75,
            annualFee: 0,
            keyBenefits: "Flexible repayment tenure from 12 to 60 months. Instant approval and disbursal. Minimal documentation.",
            eligibilityRules: "Salaried individuals with minimum monthly income of ₹25,000.",
            partnerLink: "#"
          },
          {
            title: "Home Advantage Loan",
            type: "loan",
            bank: "State Bank of India",
            tags: ["Home Loan", "Low Processing Fee"],
            rate: 8.50,
            annualFee: 0,
            keyBenefits: "Interest rates starting from 8.50% p.a. Zero processing fee for a limited time. Special discounts for women borrowers.",
            eligibilityRules: "Property documents and income proof required. Good repayment history.",
            partnerLink: "#"
          }
        ];
        setOffers(result);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userData) {
      getOffers();
    }
  }, [hasAccess, userData]);

  if (!hasAccess && !loading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center selection:bg-gold/30">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl z-10 p-6">
          <div className="text-center p-8 bg-white rounded-3xl shadow-2xl border border-white/50 max-w-sm w-full">
            <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-primary mb-2">Unlock Exclusive Offers</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">Subscribe to FinPulse PRO to access premium credit card and loan offers curated specifically for your financial profile.</p>
            <Button onClick={() => router.push('/dashboard/pro')} className="w-full bg-primary text-white hover:bg-primary/90 font-bold h-12 rounded-xl shadow-lg shadow-primary/20" size="lg">
              Upgrade to PRO
            </Button>
          </div>
        </div>
        <div className="w-full max-w-md blur-md opacity-50 pointer-events-none">
          <h1 className="text-3xl font-bold text-primary">Your Offers</h1>
          <div className="grid gap-4 mt-8">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-gold/30 pb-24">
      <div className="bg-primary pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="relative z-10 max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Curated For You</h1>
          <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-xs mx-auto">
            AI-powered recommendations based on your unique credit profile and financial goals.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-16 relative z-20">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-[280px] w-full rounded-3xl bg-white shadow-lg" />
            <Skeleton className="h-[280px] w-full rounded-3xl bg-white shadow-lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {offers?.map((offer, index) => (
              <div key={index} className="transform transition-all duration-300 hover:-translate-y-1">
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
