
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BarChart2,
  Gift,
  Target,
  Star,
  Trophy,
  User as UserIcon,
  ChevronLeft,
} from "lucide-react";
import { doc } from "firebase/firestore";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/finpulse/icons";
import { Button } from "@/components/ui/button";

const publicNavItems = [
  { href: "/dashboard/home", freeHref: "/dashboard/hero", icon: Home, label: "Home" },
  { href: "/dashboard/insights", icon: BarChart2, label: "Insights" },
  { href: "/dashboard/pro", icon: Star, label: "PRO" },
  { href: "/dashboard/offers", icon: Gift, label: "Offers" },
  { href: "/dashboard/build", icon: Target, label: "Build" },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<{ role?: string; isSubscribed?: boolean }>(userDocRef);

  const role = userData?.role || 'public';
  const isSubscribed = userData?.isSubscribed || false;


  const isBuildPage = pathname === '/dashboard/build';
  const isAccountPage = pathname.startsWith('/dashboard/account');

  // A helper function to determine the correct href for public users
  const getPublicHref = (item: typeof publicNavItems[0]) => {
    if (isSubscribed) {
      return item.href;
    }
    // For unsubscribed users
    if (item.label === 'Home') {
      return item.freeHref || item.href;
    }
    // For other tabs, direct to the feature page which will show a locked state
    return item.href;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className={cn("flex-1", !isBuildPage && !isAccountPage && "pb-28")}>{children}</main>

      {!isBuildPage && !isAccountPage && (
        <footer className="fixed bottom-0 left-0 right-0 h-24 bg-transparent z-50 flex justify-center items-end">
          <div className="liquid-navbar w-full">
            <ul>
              {publicNavItems.map((item) => {
                const href = getPublicHref(item);
                const isActive = item.label === 'Home'
                  ? (pathname === item.href || pathname === item.freeHref)
                  : pathname.startsWith(item.href);

                return (
                  <li key={item.label} className={cn({ active: isActive })}>
                    <Link href={href}>
                      <div className={cn("icon", (item.href.includes('/pro')) && 'pro-icon-bg')}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </footer>
      )}
    </div>
  );
}
