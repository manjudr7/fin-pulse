
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';

export type Notification = {
    id: string;
    userId?: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: any; 
};

export function useNotifications() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [firestore, user]);

  const { data: notifications, isLoading, error } = useCollection<Notification>(notificationsQuery);
  
  return { notifications, isLoading, error };
}

    