
'use client';

import * as React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AtSign, Phone, Gift, Settings, HelpCircle, LogOut, User as UserIcon, ChevronRight, ChevronLeft, CreditCard, Calendar, QrCode } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';


export default function UserProfilePage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userData } = useDoc<{ pan?: string, dob?: string }>(userDocRef);


    const handleLogout = async () => {
        try {
          await signOut(auth);
          router.push('/login');
        } catch (error) {
          toast({ variant: 'destructive', title: "Logout Failed", description: "An error occurred while signing out."})
        }
      };

    if (isUserLoading) {
        return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
    }
    
    if (!user) {
        // This should ideally not happen if routing is correct, but as a safeguard
        router.push('/login');
        return <div className="flex items-center justify-center min-h-screen"><p>Redirecting to login...</p></div>;
    }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
        <header className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold font-headline">Profile</h1>
            <div className="w-10" />
        </header>
        
        <section className="flex flex-col items-center space-y-2 mb-8">
            <Avatar className="h-24 w-24 border-4 border-primary/50 relative">
                <AvatarImage src={user.photoURL || userAvatar?.imageUrl} alt="User avatar" />
                <AvatarFallback>
                    {user.displayName ? user.displayName.charAt(0) : <UserIcon />}
                </AvatarFallback>
                <div className="absolute bottom-0 right-0 h-6 w-6 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </Avatar>
            <h2 className="text-xl font-bold pt-2">{user.displayName || 'Jane Cooper'}</h2>
        </section>

        <section className="space-y-2">
            <InfoRow icon={UserIcon} label="Name" value={user.displayName} />
            <InfoRow icon={AtSign} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Phone Number" value={user.phoneNumber || 'Not provided'} />
            <InfoRow icon={CreditCard} label="PAN" value={userData?.pan || 'Not provided'} />
            <InfoRow icon={Settings} label="Settings" value="Addresses, Security & Privacy" />
            <InfoRow icon={HelpCircle} label="Help & Feedback" value="Customer Support, Your Queries, Q&A" />
        </section>

        <div className="flex-grow" />

        <section className="mt-8">
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </section>
    </div>
  );
}

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null }) => {
    const { toast } = useToast();

    const handleClick = () => {
        toast({
            title: "Coming Soon!",
            description: `The ${label} section is under development.`
        })
    }

    return (
        <Card onClick={handleClick} className="cursor-pointer bg-card hover:bg-muted/50">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{value || 'Not available'}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
        </Card>
   )
};
