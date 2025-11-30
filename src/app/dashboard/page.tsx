
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';

export default function DashboardRootPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<{ role?: string; isSubscribed?: boolean }>(userDocRef);

  React.useEffect(() => {
    // Wait until both user and user data are loaded
    if (isUserLoading || isUserDataLoading) {
      return;
    }

    // If no user is logged in after loading, redirect to login page
    if (!user) {
      router.replace('/login');
      return;
    }

    // Now that we have a user and their data, we can redirect
    const role = userData?.role || 'basic';
    const isSubscribed = userData?.isSubscribed || false;
    const isPro = user.uid === 'kadjYDNAiW3pZSKjcLaYvLnjzaIu'; // Hardcoded check for safety, or use utils

    if (isPro || isSubscribed) {
      router.replace('/dashboard/home');
    } else {
      router.replace('/dashboard/hero');
    }
  }, [user, userData, isUserLoading, isUserDataLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}
