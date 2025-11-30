
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, BarChart2, Target, Gift, Bell, Wallet, User, LogOut, Sun, Moon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DualScoreCard } from '@/components/finpulse/dual-score-card';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { signOut } from "firebase/auth";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/finpulse/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

export default function HeroPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<{ isSubscribed: boolean; equifaxScore: number }>(userDocRef);

  const { notifications } = useNotifications();
  const [showNotificationView, setShowNotificationView] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);


  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUnlockClick = () => {
    router.push('/dashboard/pro');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleWalletClick = () => {
    router.push('/dashboard/wallet');
  };

  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const unreadNotificationsCount = notifications?.filter(n => !n.read).length || 0;

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-32 rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground font-sans selection:bg-gold/30">
      <AnimatePresence>
        {showNotificationView && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl shadow-2xl rounded-b-3xl border-b border-border/50"
          >
            <div className="p-6 pt-safe-top max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                    <Icons.logo className="h-6 w-6" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-primary">FinPulse</span>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted transition-colors" onClick={() => setShowNotificationView(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {notifications?.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No new notifications</p>
                  </div>
                )}
                {notifications?.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <Card className="border-0 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="h-2 w-2 rounded-full bg-primary"></span>
                              <p className="font-semibold text-sm text-primary">FinPulse Update</p>
                              <span className="text-[10px] text-muted-foreground ml-auto">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                            </div>
                            <h4 className="font-bold text-base mb-1 text-foreground">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
                          </div>
                        </div>
                        {!notification.read && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={cn(
          "sticky top-0 z-40 px-6 py-4 transition-all duration-500 ease-in-out",
          isScrolled ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-border/40" : "bg-transparent"
        )}
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button className="flex items-center gap-3 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 duration-300">
              <Icons.logo className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">FinPulse</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted/50 transition-colors" onClick={() => setShowNotificationView(true)}>
                <Bell className="h-5 w-5 text-foreground/80" />
              </Button>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-white"></span>
              )}
            </div>

            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted/50 transition-colors" onClick={handleWalletClick}>
              <Wallet className="h-5 w-5 text-gold" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-primary/10 transition-all">
                  <AvatarImage src={user?.photoURL || userAvatar?.imageUrl} alt="User avatar" />
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border/50 p-2">
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5" onClick={() => router.push('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-border/50" />
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-md mx-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <DualScoreCard onUnlockClick={handleUnlockClick} isSubscribed={userData?.isSubscribed ?? false} equifaxScore={userData?.equifaxScore} />
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-bold tracking-tight text-primary">Unlock Your Financial Potential</h2>
          <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">Upgrade to PRO for exclusive insights, CIBIL scores, and personalized action plans.</p>
        </motion.section>

        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
          <div className="grid grid-cols-2 gap-4 opacity-60 blur-[2px] select-none pointer-events-none transform scale-[0.98]">
            {[
              { icon: BarChart2, title: "Deep Insights", desc: "Full credit history analysis" },
              { icon: Target, title: "Score Builder", desc: "AI-driven improvement plans" },
              { icon: Gift, title: "Premium Offers", desc: "Curated financial products" },
              { icon: Lock, title: "CIBIL Access", desc: "Official bureau score" }
            ].map((item, i) => (
              <Card key={i} className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center mb-1">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="fixed bottom-24 left-0 right-0 z-30 px-6 flex justify-center pointer-events-none"
        >
          <div className="w-full max-w-md pointer-events-auto">
            <Button
              onClick={handleUnlockClick}
              size="lg"
              className="w-full h-14 rounded-2xl font-bold text-lg bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-500 hover:to-gold text-primary-foreground shadow-xl shadow-gold/20 active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                Upgrade to PRO <Lock className="h-4 w-4" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
