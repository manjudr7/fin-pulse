
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bell,
  ChevronRight,
  MessageSquare,
  User,
  Wallet,
  X,
  LogOut,
  Moon,
  Sun,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from 'date-fns';
import { signOut } from "firebase/auth";
import { doc } from 'firebase/firestore';
import { useTheme } from "next-themes";


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { healthMetrics } from "@/lib/mock-data";
import { Icons } from "@/components/finpulse/icons";
import { DualScoreCard } from "@/components/finpulse/dual-score-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { FactorKey } from "@/lib/credit-factors-data";
import CreditScoreCardInsights from "@/components/finpulse/CreditScoreCardInsights";

export default function DashboardHomePage() {
  const { notifications } = useNotifications();
  const [showNotificationView, setShowNotificationView] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeFactor, setActiveFactor] = React.useState<FactorKey>(FactorKey.PaymentHistory);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<{ isSubscribed: boolean; equifaxScore: number; }>(userDocRef);

  const isPro = user?.uid === 'kadjYDNAiW3pZSKjcLaYvLnjzaIu';
  const isSubscribed = userData?.isSubscribed ?? false;
  const hasAccess = isPro || isSubscribed;

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleUnlockClick = () => {
    router.push('/dashboard/pro');
  };

  const onNavigate = (path: string) => {
    router.push(`/dashboard/${path}`);
  };

  const handleWalletClick = () => {
    router.push('/dashboard/wallet');
  };

  const DashboardCards = () => (
    <div className="grid grid-cols-2 gap-4">
      {healthMetrics.map((metric) => {
        const statusColors = {
          High: 'bg-green-500 text-white',
          Medium: 'bg-yellow-400 text-black',
          Low: 'bg-red-500 text-white',
        };

        return (
          <Card key={metric.id} className="bg-card/90 backdrop-blur-sm shadow-lg" onClick={() => onNavigate('insights')}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-medium text-muted-foreground">{metric.name}</p>
                <div className={cn("h-5 w-5 rounded-full flex items-center justify-center", {
                  'bg-green-100 text-green-600': metric.status === 'High',
                  'bg-yellow-100 text-yellow-600': metric.status === 'Medium',
                  'bg-red-100 text-red-600': metric.status === 'Low',
                })}>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-foreground">
                  {metric.value}
                </p>
                <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", statusColors[metric.status])}>
                  {metric.status}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{metric.explanation}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const unreadNotificationsCount = notifications?.filter(n => !n.read).length || 0;

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      <AnimatePresence>
        {showNotificationView && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl shadow-lg rounded-b-2xl"
          >
            <div className="p-4 pt-safe-top">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-accent text-xl shadow-sm">
                    <Icons.logo className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg font-bold text-foreground">FinPulse</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-black/10 hover:bg-black/20" onClick={() => setShowNotificationView(false)}>
                    <X className="h-5 w-5 text-foreground" />
                  </Button>
                  <Avatar className="h-10 w-10 border-2 border-white/50">
                    <AvatarImage src={user?.photoURL || userAvatar?.imageUrl} alt="User avatar" />
                    <AvatarFallback>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {notifications?.map((notification) => (
                  <Card key={notification.id} className="bg-card/80 rounded-xl shadow-sm border-border/20 backdrop-blur-lg">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icons.logo className="h-5 w-5 text-primary" />
                          <p className="font-semibold text-sm text-card-foreground">FinPulse</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
                      </div>
                      <p className="font-bold text-card-foreground">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      {!notification.read && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500"></div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={cn(
          "sticky top-0 z-40 p-4 transition-all duration-300",
          isScrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
        )}
      >
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card/80 text-xl shadow-sm">
              <Icons.logo className="h-6 w-6 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">FinPulse</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-card/80 hover:bg-card/90" onClick={() => setShowNotificationView(true)}>
                <Bell className="h-5 w-5 text-foreground" />
              </Button>
              {unreadNotificationsCount > 0 && (
                <div className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card">
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-card/80 hover:bg-card/90" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-5 w-5 text-foreground" /> : <Moon className="h-5 w-5 text-foreground" />}
            </Button>
            <div>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-card/80 hover:bg-card/90" onClick={handleWalletClick}>
                <Wallet className="h-5 w-5 text-gold" />
              </Button>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 border-2 border-primary/50 cursor-pointer">
                    <AvatarImage src={user?.photoURL || userAvatar?.imageUrl} alt="User avatar" />
                    <AvatarFallback>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>


      <main className="p-4 space-y-6 bg-transparent">
        <DualScoreCard onUnlockClick={handleUnlockClick} isSubscribed={hasAccess} equifaxScore={userData?.equifaxScore} />

        <div className="px-2 mt-2">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-foreground font-bold text-xl">Credit Health Breakdown</h2>
            <ChevronRight onClick={() => onNavigate('insights')} className="w-7 h-7 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          </div>
          <DashboardCards />
        </div>

        <CreditScoreCardInsights activeFactor={activeFactor} onFactorSelected={setActiveFactor} />

        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground font-bold text-xl">Your Exclusive Offers</h2>
            <Button
              onClick={() => onNavigate('offers')}
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto font-bold"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            <div className="min-w-[280px] bg-gradient-to-br from-primary to-accent rounded-2xl p-5 text-white shadow-lg">
              <div className="text-xs font-bold opacity-90 mb-2">PRE-APPROVED ✨</div>
              <h3 className="mb-2 font-bold text-lg">Platinum Rewards Card</h3>
              <p className="text-sm font-semibold opacity-95 mb-4">Guaranteed Approval</p>
              <div className="text-xs font-semibold opacity-90">HDFC Bank</div>
            </div>
            <div className="min-w-[280px] bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg">
              <div className="text-xs font-bold opacity-90 mb-2">EXCLUSIVE RATE 🔥</div>
              <h3 className="mb-2 font-bold text-lg">Personal Loan</h3>
              <p className="text-sm font-semibold opacity-95 mb-4">From 9.5% APR</p>
              <div className="text-xs font-semibold opacity-90">Axis Bank</div>
            </div>
          </div>
        </div>

        <section className="px-4">
          <Card className="bg-card/90 text-foreground border-border/20 backdrop-blur-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-bold font-headline">Confused about your score?</h3>
                  <p className="text-sm text-muted-foreground">Talk to a credit expert for free.</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/80">Get Expert Help <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
