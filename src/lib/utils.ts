import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PRO_USER_UID = 'kadjYDNAiW3pZSKjcLaYvLnjzaIu';
export const BASIC_USER_UID = '1fxx99UTnGsUyKjwT8XcD3sOGyBj';

export function isProUser(uid: string | undefined | null): boolean {
  return uid === PRO_USER_UID;
}
