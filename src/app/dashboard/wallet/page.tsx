
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Gift, Copy, Share2, Coins } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
);
  
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.141 0-3.506.012-4.73.068-2.73.124-3.957 1.349-4.078 4.078-.056 1.224-.067 1.588-.067 4.73s.011 3.506.067 4.73c.12 2.731 1.348 3.957 4.078 4.078 1.224.056 1.588.067 4.73.067s3.506-.011 4.73-.067c2.73-.124 3.957-1.348 4.078-4.078.056-1.224.067-1.588.067-4.73s-.011-3.506-.067-4.73c-.12-2.731-1.348-3.957-4.078-4.078-1.224-.056-1.588-.068-4.73-.068zm0 3.824a4.572 4.572 0 100 9.144 4.572 4.572 0 000-9.144zm0 7.232a2.66 2.66 0 110-5.32 2.66 2.66 0 010 5.32zm6.276-8.033a1.088 1.088 0 11-2.176 0 1.088 1.088 0 012.176 0z"/>
    </svg>
);
  
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.81L2 22l5.42-1.41c1.37.71 2.92 1.12 4.58 1.12h.04c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM12.04 20.12h-.04c-1.48 0-2.88-.38-4.1-1.05L7.2 18.7l-3.03.79.8-2.96c-.75-1.32-1.2-2.85-1.2-4.47 0-4.54 3.69-8.23 8.23-8.23 4.54 0 8.23 3.69 8.23 8.23s-3.69 8.23-8.23 8.23zm4.51-6.19c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.56.12c-.17.25-.64.82-.79.98s-.29.17-.54.06c-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.48-1.38-1.73s-.03-.25.12-.38c.11-.11.25-.29.38-.43s.17-.21.25-.33c.08-.12.04-.25-.02-.38-.06-.12-.56-1.34-.76-1.84s-.4-.43-.56-.43h-.54c-.17 0-.46.06-.7.33s-1 .98-1 2.38.98 2.76 1.1 2.96c.12.21 2.01 3.06 4.88 4.29.69.29 1.23.46 1.66.59.73.21 1.39.18 1.91.11.57-.06 1.47-.6 1.68-1.18s.21-1.08.15-1.18c-.06-.12-.23-.18-.48-.3z"/>
    </svg>
);

const MessageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
);


export default function WalletPage() {
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userData } = useDoc<{ referralCode?: string; walletBalance?: number }>(userDocRef);

    const copyToClipboard = () => {
        if (!userData?.referralCode) return;
        navigator.clipboard.writeText(userData.referralCode);
        toast({
            title: "Copied to Clipboard!",
            description: "Your referral code has been copied.",
        });
    };

    const handleSocialShare = (platform: 'facebook' | 'instagram' | 'whatsapp' | 'sms') => {
        const referralCode = userData?.referralCode;
        if (!referralCode) return;

        const text = `Check out FinPulse to manage your credit score and financial health! Use my referral code: ${referralCode}`;
        const url = `https://finpulse.app/join?ref=${referralCode}`;
        let shareUrl = '';

        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'sms':
                shareUrl = `sms:?body=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'instagram':
                // Instagram doesn't have a direct sharing URL API, so we instruct the user.
                copyToClipboard();
                toast({
                    title: 'Code Copied!',
                    description: 'Paste it in your Instagram story or message.',
                });
                return;
        }

        window.open(shareUrl, '_blank');
    };

    return (
        <div className="flex flex-col min-h-screen bg-background p-4 space-y-6">
            <header className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold font-headline">My Wallet</h1>
                <div className="w-10"></div>
            </header>

            <section>
                 <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Your Balance</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-bold font-headline">{userData?.walletBalance?.toLocaleString() || 0}</span>
                            <span className="text-lg font-semibold text-muted-foreground">Coins</span>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card className="bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Gift className="h-8 w-8" />
                            <div>
                                <h3 className="text-xl font-bold">Refer & Earn</h3>
                                <p className="text-sm opacity-90">Earn up to ₹5,000 for every friend you refer!</p>
                            </div>
                        </div>
                        <div className="bg-background/20 rounded-lg p-3 flex items-center justify-between">
                            <span className="font-mono text-lg tracking-wider">{userData?.referralCode || '...'}</span>
                            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                                <Copy className="h-5 w-5" />
                            </Button>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share with Friends
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Share your code</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-4 gap-4 py-4">
                                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleSocialShare('whatsapp')}>
                                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                                            <WhatsAppIcon className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs">WhatsApp</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleSocialShare('facebook')}>
                                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                            <FacebookIcon className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs">Facebook</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleSocialShare('instagram')}>
                                        <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white">
                                            <InstagramIcon className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs">Instagram</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleSocialShare('sms')}>
                                        <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white">
                                            <MessageIcon className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs">Message</span>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
