
import type { LucideIcon } from "lucide-react";
import { CalendarCheck, Percent, ShieldAlert, CalendarClock, List, Search } from "lucide-react";

export const user = {
  name: "Aarav Sharma",
  avatarUrl: "https://picsum.photos/seed/1/100/100",
};

export const creditScores = [
  { score: 780, provider: 'Equifax' },
  { score: 748, provider: 'TransUnion' },
  { score: 780, provider: 'Experian' },
];

export type HealthMetric = {
  id: string;
  name: string;
  value: string;
  status: "High" | "Medium" | "Low";
  Icon: LucideIcon;
  explanation: string;
};

export const healthMetrics: HealthMetric[] = [
  { id: 'payment-history', name: 'Payment History', value: '99%', status: 'High', Icon: CalendarCheck, explanation: 'Percentage of on-time payments across all accounts.' },
  { id: 'credit-card-utilization', name: 'Credit Utilization', value: '12%', status: 'High', Icon: Percent, explanation: 'Percentage of your available credit you are using.' },
  { id: 'derogatory-marks', name: 'Derogatory Marks', value: '0', status: 'High', Icon: ShieldAlert, explanation: 'Negative items like collections or late payments.' },
  { id: 'credit-age', name: 'Avg. Credit Age', value: '4.5 yrs', status: 'Medium', Icon: CalendarClock, explanation: 'The average age of all your credit accounts.' },
  { id: 'total-accounts', name: 'Total Accounts', value: '8', status: 'High', Icon: List, explanation: 'A healthy mix of credit cards and loans.' },
  { id: 'hard-inquiries', name: 'Hard Inquiries', value: '1', status: 'High', Icon: Search, explanation: 'Recent applications for new credit in the last 2 years.' },
];

export type Account = {
  id: string;
  type: 'Loan' | 'Card';
  bank: string;
  status: 'Open' | 'Closed' | 'Delinquent';
  balance: number;
  nextPaymentDue?: string;
  name: string;
  dpd: number;
  highCredit?: number;
  amountOverdue?: number;
  loanType?: string;
  ownership?: string;
};

export const equifaxAccounts: Account[] = [
  { id: '1', name: 'Personal Loan - HDFC', bank: 'HDFC', type: 'Loan', balance: 50000, dpd: 0, status: 'Open', highCredit: 100000, amountOverdue: 0, loanType: 'Personal Loan' },
  { id: '2', name: 'Home Loan - SBI', bank: 'SBI', type: 'Loan', balance: 2000000, dpd: 0, status: 'Open', highCredit: 2500000, amountOverdue: 0, loanType: 'Home Loan' },
  { id: '3', name: 'Personal Loan - Axis', bank: 'Axis', type: 'Loan', balance: 25000, dpd: 15, status: 'Delinquent', highCredit: 50000, amountOverdue: 1250, loanType: 'Personal Loan' },
  { id: '4', name: 'Home Loan - ICICI', bank: 'ICICI', type: 'Loan', balance: 1500000, dpd: 0, status: 'Open', highCredit: 1800000, amountOverdue: 0, loanType: 'Home Loan' },
  { id: '5', name: 'Premium Credit Card - HDFC', bank: 'HDFC', type: 'Card', balance: 12000, dpd: 30, status: 'Delinquent', highCredit: 50000, amountOverdue: 2500, loanType: 'Credit Card' },
  { id: '6', name: 'Debit Card - Yes Bank', bank: 'Yes', type: 'Card', balance: 0, dpd: 0, status: 'Closed', highCredit: 0, amountOverdue: 0, loanType: 'Debit Card' },
  { id: '7', name: 'Standard Credit Card - SBI', bank: 'SBI', type: 'Card', balance: 8000, dpd: 0, status: 'Open', highCredit: 20000, amountOverdue: 0, loanType: 'Credit Card' },
];

export const cibilAccounts: Account[] = [
    { id: '1', name: 'Personal Loan - HDFC', bank: 'HDFC', type: 'Loan', balance: 48000, dpd: 0, status: 'Open', highCredit: 100000, amountOverdue: 0, loanType: 'Personal Loan' },
    { id: '2', name: 'Home Loan - SBI', bank: 'SBI', type: 'Loan', balance: 1950000, dpd: 0, status: 'Open', highCredit: 2500000, amountOverdue: 0, loanType: 'Home Loan' },
    { id: '3', name: 'Personal Loan - Axis', bank: 'Axis', type: 'Loan', balance: 25000, dpd: 15, status: 'Delinquent', highCredit: 50000, amountOverdue: 1250, loanType: 'Personal Loan' },
    { id: '4', name: 'Home Loan - ICICI', bank: 'ICICI', type: 'Loan', balance: 1500000, dpd: 0, status: 'Open', highCredit: 1800000, amountOverdue: 0, loanType: 'Home Loan' },
    { id: '5', name: 'Premium Credit Card - HDFC', bank: 'HDFC', type: 'Card', balance: 12000, dpd: 30, status: 'Delinquent', highCredit: 50000, amountOverdue: 2500, loanType: 'Credit Card' },
    { id: '8', name: 'Auto Loan - Kotak', bank: 'Kotak', type: 'Loan', balance: 450000, dpd: 0, status: 'Open', highCredit: 600000, amountOverdue: 0, loanType: 'Auto Loan' },
    { id: '9', name: 'Gold Millennia Card - HDFC', bank: 'HDFC', type: 'Card', balance: 5000, dpd: 0, status: 'Open', highCredit: 75000, amountOverdue: 0, loanType: 'Credit Card' },
];

export const accounts: Account[] = equifaxAccounts;


export const paymentHistory = [
    { accountId: '1', history: [
        { year: 2024, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
        { year: 2023, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
        { year: 2022, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    ]},
    { accountId: '2', history: [
        { year: 2024, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0] },
        { year: 2023, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
        { year: 2022, payments: [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0] },
    ]},
    { accountId: '3', history: [
        { year: 2024, payments: [1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0] },
        { year: 2023, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
        { year: 2022, payments: [1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1] },
    ]},
    { accountId: '4', history: [
        { year: 2024, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
        { year: 2023, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
        { year: 2022, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    ]},
    { accountId: '5', history: [
        { year: 2024, payments: [1, 1, 2, 1, 3, 1, 1, 1, 1, 1, 0, 0] },
        { year: 2023, payments: [1, 1, 1, 2, 1, 1, 1, 3, 1, 1, 1, 1] },
        { year: 2022, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    ]},
    { accountId: '6', history: [
        { year: 2024, payments: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { year: 2023, payments: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { year: 2022, payments: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    ]},
    { accountId: '7', history: [
        { year: 2024, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
        { year: 2023, payments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
        { year: 2022, payments: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1] },
    ]},
];

export const scoreFactors = [
    { name: 'Payment History', value: 35, fill: 'hsl(var(--chart-1))' },
    { name: 'Credit Utilization', value: 30, fill: 'hsl(var(--chart-2))' },
    { name: 'Credit Age', value: 15, fill: 'hsl(var(--chart-3))' },
    { name: 'Credit Mix', value: 10, fill: 'hsl(var(--chart-4))' },
    { name: 'New Credit', value: 10, fill: 'hsl(var(--chart-5))' },
];
