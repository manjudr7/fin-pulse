
export enum FactorKey {
    PaymentHistory = 'PaymentHistory',
    CreditUsage = 'CreditUsage',
    CreditAge = 'CreditAge',
    CreditMix = 'CreditMix',
    NewEnquiries = 'NewEnquiries',
}
  
export interface BankData {
    name: string;
    loans: number;
    amount: number; // in Crores (Cr)
    percentage: number; // 0.0 to 1.0
    color: string;
}
  
export interface FactorDetail {
    id: FactorKey;
    label: string;
    scoreDelta: number;
    valueLabel: string;
    summary: string;
    bankBreakdown?: BankData[];
    bullets?: string[];
}
  
export interface CreditFactorsSnapshot {
    currentScore: number;
    verdict: string;
    factors: FactorDetail[];
}

const bankColors = [
    '#0077B6', // Blue for ICICI
    '#90A4AE', // Grey for UC
    '#005073', // Dark Teal for Canara
    '#B0BEC5', // Light Grey for Kotak
    '#4DB6AC', // Teal for Others
];
  
const creditUsageBanks: BankData[] = [
    { name: 'Icici Bank Limited', loans: 6, amount: 8.6, percentage: 0.5083, color: bankColors[0] },
    { name: 'Uc Inclusive Credit Private Limited', loans: 2, amount: 3.7, percentage: 0.2194, color: bankColors[1] },
    { name: 'Canara Bank', loans: 16, amount: 1.5, percentage: 0.0913, color: bankColors[2] },
    { name: 'Kotak Mahindra Bank Ltd', loans: 1, amount: 0.555, percentage: 0.0327, color: bankColors[3] },
    { name: 'Others', loans: 23, amount: 2.5, percentage: 0.1483, color: bankColors[4] },
];
  
export const creditFactorsData: CreditFactorsSnapshot = {
    currentScore: 780,
    verdict: 'Very Good',
    factors: [
      {
        id: FactorKey.PaymentHistory,
        label: 'Payments',
        scoreDelta: 6,
        valueLabel: '98%',
        summary: 'On-time payments are crucial for maintaining an excellent credit history, showing lenders reliability.',
        bullets: ['98 on-time payments in last 24 months', '2 delayed payments recently impacted your score'],
      },
      {
        id: FactorKey.CreditUsage,
        label: 'Credit Usage',
        scoreDelta: -2,
        valueLabel: '100%',
        summary: 'High credit utilization (using most of your available credit) is a major score detractor. Aim to keep it below 30% for improvement.',
        bankBreakdown: creditUsageBanks,
        bullets: ['You are using 100% of available credit', 'Reducing usage below 30% could add up to +20 points'],
      },
      {
        id: FactorKey.CreditAge,
        label: 'Credit Age',
        scoreDelta: 3,
        valueLabel: 'Good',
        summary: '3 Years, keep your credit accounts open.',
        bullets: ['Average account age is 3 years', 'Keeping older accounts open supports your score'],
      },
      {
        id: FactorKey.CreditMix,
        label: 'Credit Mix',
        scoreDelta: 21,
        valueLabel: 'Excellent',
        summary: 'Variety of credit types improve your credit score.',
        bullets: ['Healthy mix of loans and credit cards', 'Balanced repayment improves your profile'],
      },
      {
        id: FactorKey.NewEnquiries,
        label: 'New Enquiries',
        scoreDelta: -2,
        valueLabel: '11',
        summary: 'Too many enquiries will impact your score.',
        bullets: ['11 enquiries in the last 12 months', 'Too many applications can lower your score'],
      },
    ],
};
