'use client';

import * as React from 'react';
import { CheckCircle, Lock, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ProPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = React.useState('annual');
  const [processing, setProcessing] = React.useState(false);

  interface Plan {
    id: string;
    name: string;
    price: number;
    priceInPaise: number;
    features: string[];
    badge?: string;
    gradient: string;
    textColor: string;
    subTextColor: string;
  }

  const plans: Record<string, Plan> = {
    monthly: {
      id: 'plan_monthly',
      name: 'Monthly',
      price: 199,
      priceInPaise: 19900,
      gradient: "bg-gradient-to-br from-slate-100 to-slate-300 border border-slate-200",
      textColor: "text-slate-900",
      subTextColor: "text-slate-600",
      features: [
        "CIBIL Score Access",
        "Detailed Credit Insights",
        "Credit Score Builder",
        "Personalized Offers",
        "Score Impact Simulator",
      ]
    },
    annual: {
      id: 'plan_annual',
      name: 'Annual',
      price: 1999,
      priceInPaise: 199900,
      badge: 'BEST VALUE',
      gradient: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700",
      textColor: "text-white",
      subTextColor: "text-slate-300",
      features: [
        "Everything in Monthly",
        "2 Months Free",
        "Annual Credit Report Summary",
        "Yearly Financial Health Checkup",
      ]
    }
  }

  const handleSubscribe = async () => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to subscribe.",
      });
      return;
    }

    setProcessing(true);

    const plan = plans[selectedPlan as keyof typeof plans];

    // In a real application, this order creation would happen on a secure backend (e.g., Firebase Cloud Function).
    // For this prototype, we simulate it on the client.
    const orderOptions = {
      amount: plan.priceInPaise,
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
      notes: {
        userId: user.uid,
        plan: selectedPlan
      }
    };

    // This is a placeholder for creating an order on the backend.
    const order = { id: `sim_order_${Date.now()}` };

    const razorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1234567890ABCD', // Use test key as fallback
      amount: orderOptions.amount,
      currency: orderOptions.currency,
      name: 'FinPulse',
      description: `FinPulse PRO - ${plan.name} Plan`,
      order_id: order.id,
      handler: async (response: any) => {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const subscriptionDocRef = doc(firestore, 'subscriptions', response.razorpay_payment_id);

          // Update user document
          await setDoc(userDocRef, {
            isSubscribed: true,
            subscriptionTier: selectedPlan,
            subscriptionStartDate: new Date(),
          }, { merge: true });

          // Create subscription record
          await setDoc(subscriptionDocRef, {
            userId: user.uid,
            userName: user.displayName || user.email,
            orderId: response.razorpay_order_id || order.id,
            paymentId: response.razorpay_payment_id,
            amount: plan.price,
            plan: selectedPlan,
            status: 'active',
            startDate: new Date(),
            endDate: null, // Should be calculated on backend
            createdAt: serverTimestamp(),
          });

          toast({
            title: "Subscription Activated!",
            description: "Welcome to FinPulse PRO. You now have access to all premium features.",
          });

          router.push('/dashboard/home');

        } catch (error) {
          console.error("Error updating user document: ", error);
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Your payment was successful, but we couldn't update your account. Please contact support.",
          });
        } finally {
          setProcessing(false);
        }
      },
      prefill: {
        name: user.displayName || '',
        email: user.email || '',
        contact: user.phoneNumber || '',
      },
      theme: {
        color: '#1A237E',
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
          toast({
            variant: "destructive",
            title: "Payment Cancelled",
            description: "Your payment process was cancelled.",
          });
        }
      }
    };

    const rzp = new window.Razorpay(razorpayOptions);
    rzp.open();
  }


  const { data: userData } = useDoc<{ isSubscribed?: boolean; subscriptionTier?: string }>(
    user ? doc(firestore, 'users', user.uid) : null
  );

  const isSubscribed = userData?.isSubscribed;

  if (isSubscribed) {
    return (
      <div className="flex flex-col min-h-screen bg-background p-6 items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gold/10 rounded-full mb-6">
            <Star className="h-12 w-12 text-gold fill-gold" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">You are a PRO Member!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for being a premium member. You have full access to all features.
          </p>

          <Card className="bg-card border-border/50 shadow-lg mb-8 text-left">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-muted-foreground">Current Plan</span>
                <span className="text-sm font-bold text-primary capitalize">{userData?.subscriptionTier || 'Annual'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => router.push('/dashboard/home')}
            className="w-full h-12 rounded-xl font-bold bg-primary text-white"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-6 items-center selection:bg-gold/30">
      <div className="w-full max-w-md pb-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center my-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-primary/5 rounded-full mb-4">
            <Star className="h-8 w-8 text-gold fill-gold" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Upgrade to PRO</h1>
          <p className="text-muted-foreground mt-2 text-lg">Unlock your full financial potential.</p>
        </motion.div>

        <div className="space-y-6">
          {Object.entries(plans).map(([key, plan]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + (key === 'annual' ? 0.1 : 0) }}
              onClick={() => setSelectedPlan(key)}
              className="relative group"
            >
              <div className={cn(
                "absolute -inset-0.5 rounded-2xl blur opacity-30 transition duration-500 group-hover:opacity-75",
                selectedPlan === key ? "bg-gold" : "bg-transparent"
              )}></div>
              <Card className={cn(
                "cursor-pointer transition-all duration-300 relative overflow-hidden border-0 shadow-xl",
                plan.gradient,
                selectedPlan === key ? "ring-2 ring-gold scale-[1.02]" : "hover:scale-[1.01]"
              )}>
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-gold text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-md z-10">
                    {plan.badge}
                  </div>
                )}

                {/* Metallic Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ transform: 'skewX(-20deg) translateX(-150%)', animation: 'shine 3s infinite' }}></div>

                <CardContent className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className={cn("text-2xl font-bold tracking-tight", plan.textColor)}>{plan.name}</h2>
                      <p className={cn("text-sm font-medium opacity-80", plan.textColor)}>Membership</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-3xl font-bold", plan.textColor)}>₹{plan.price}</p>
                      <span className={cn("text-xs font-medium opacity-70", plan.textColor)}>/{key === 'monthly' ? 'mo' : 'year'}</span>
                    </div>
                  </div>

                  <div className={cn("h-px w-full my-4 opacity-20", plan.textColor === 'text-white' ? 'bg-white' : 'bg-black')}></div>

                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className={cn("rounded-full p-0.5", plan.textColor === 'text-white' ? 'bg-gold/20' : 'bg-primary/10')}>
                          <CheckCircle className={cn("h-4 w-4", plan.textColor === 'text-white' ? 'text-gold' : 'text-primary')} />
                        </div>
                        <span className={cn("font-medium", plan.subTextColor)}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-border/50 z-20"
        >
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleSubscribe}
              disabled={processing}
              size="lg"
              className="w-full h-14 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {processing ? 'Processing...' : (
                <span className="flex items-center justify-center gap-2">
                  Subscribe to {plans[selectedPlan].name} <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" /> Secure Payments by Razorpay • Cancel Anytime
            </p>
          </div>
        </motion.div>

        <div className="h-24"></div>
      </div>
    </div>
  );
}
