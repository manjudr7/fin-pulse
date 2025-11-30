
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/finpulse/icons';
import { setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

const Login = () => {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const navigateUser = async (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role || 'public';
      const isSubscribed = userData.isSubscribed || false;

      if (role === 'partner') {
        router.push('/dashboard/partner');
      } else if (isSubscribed) {
        router.push('/dashboard/home');
      } else {
        router.push('/dashboard/hero');
      }
    } else {
      // New user, create profile and then navigate
      await handleUserCreation(user);
      // Re-fetch doc to navigate based on newly set role
      const newUserDoc = await getDoc(userRef);
      if(newUserDoc.exists()){
        const newUserData = newUserDoc.data();
        if (newUserData.role === 'partner') router.push('/dashboard/partner');
        else if (newUserData.isSubscribed) router.push('/dashboard/home');
        else router.push('/dashboard/hero');
      }
    }
  };

  React.useEffect(() => {
    if (!isUserLoading && user) {
      navigateUser(user);
    }
  }, [user, isUserLoading]);

  const handleUserCreation = async (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return; // User profile already exists
    }

    let role = 'public';
    let isSubscribed = false;
    let equifaxScore = 780;
    let cibilScore = 765;
    let walletBalance = 500;

    // Assign roles and subscription status based on UID
    switch (user.uid) {
      case 'b6EINUfhXKOVsb4nsL2FzNkoPfX2': // Partner
        role = 'partner';
        isSubscribed = false;
        equifaxScore = 720;
        cibilScore = 710;
        walletBalance = 0;
        break;
      case 'GvhTjClLH0XS4bQGyOvNxEV9AKN2': // PRO User
        role = 'public';
        isSubscribed = true;
        equifaxScore = 820;
        cibilScore = 805;
        walletBalance = 1000;
        break;
      default: // Normal User
        role = 'public';
        isSubscribed = false;
        equifaxScore = 780;
        cibilScore = 765;
        walletBalance = 500;
        break;
    }

    await setDoc(userRef, {
      id: user.uid,
      name: user.displayName || user.email,
      email: user.email,
      avatarUrl: user.photoURL,
      role: role,
      isSubscribed: isSubscribed,
      subscriptionTier: isSubscribed ? 'annual' : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onboardingComplete: false,
      equifaxScore,
      cibilScore,
      referralCode: `FP${user.uid.substring(0, 6).toUpperCase()}`,
      walletBalance: walletBalance,
      dob: '1990-01-01',
      pan: 'ABCDE1234F',
    }, { merge: true });

    if (role === 'partner') {
        const partnerRef = doc(firestore, 'partners', user.uid);
        await setDoc(partnerRef, {
            partnerName: user.displayName || 'New Partner',
            email: user.email,
            bankName: 'Independent DSA',
            commissionRate: 0.05,
            totalLeads: 0,
            totalEarnings: 0,
            lifeEarnings: 0,
            status: 'active',
            referralCode: `FP${user.uid.substring(0,6).toUpperCase()}`,
            createdAt: serverTimestamp(),
        });
    }

  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        await navigateUser(userCredential.user);
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        await navigateUser(userCredential.user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await navigateUser(userCredential.user);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
             <Icons.logo className="h-10 w-10 text-primary"/>
          </div>
          <CardTitle className="text-2xl font-bold font-headline">
            {isSignUp ? 'Create an Account' : 'Welcome to FinPulse'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Enter your details to get started.'
              : 'Sign in to access your dashboard.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" role="img" aria-label="Google logo">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.599 32.658 48 25.43 48 24c0-1.341-.138-2.65-.389-3.917z"></path>
            </svg>
            Google
          </Button>

          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="underline"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

    