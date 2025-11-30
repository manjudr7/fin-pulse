'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getSdks } from '@/firebase';

const handleUserCreation = (userCredential: UserCredential) => {
  const user = userCredential.user;
  const { firestore } = getSdks(user.providerData[0].providerId === 'anonymous' ? getApp() : getApp(user.providerData[0].providerId));
  const userRef = doc(firestore, 'users', user.uid);

  setDoc(userRef, {
    id: user.uid,
    name: user.displayName || 'Anonymous User',
    email: user.email,
    role: 'basic', // Default role
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance)
    .then(handleUserCreation)
    .catch((error) => {
      console.error("Anonymous sign-in error:", error);
    });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(handleUserCreation)
    .catch((error) => {
      console.error("Email sign-up error:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error) => {
      console.error("Email sign-in error:", error);
    });
}

/** Initiate Google sign-in (popup). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider)
    .then(handleUserCreation)
    .catch((error) => {
      console.error("Google sign-in error:", error);
    });
}

