

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

export type Lead = {
    id: string;
    partnerId: string;
    userId: string | null;
    name: string;
    phone: string;
    panCard: string | null;
    status: 'open' | 'closed_won' | 'closed_lost';
    leadSource: 'app' | 'referral' | 'direct';
    createdAt: any;
};

export type LeadsAnalytics = {
    currentMonthLeads: number;
    currentMonthEarnings: number;
    lifeLeads: number;
    lifeEarnings: number;
    openLeads: number;
    closedWonLeads: number;
    closedLostLeads: number;
    lastUpdated: any;
};

export type Partner = {
    id: string;
    partnerName: string;
    email: string;
    bankName: string;
    commissionRate: number;
    totalLeads: number;
    totalEarnings: number;
    lifeEarnings: number;
    status: 'active' | 'suspended';
    referralCode: string;
    createdAt: any;
};

export type Subscription = {
    id: string;
    userId: string;
    userName: string;
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    plan: 'monthly' | 'annual';
    status: 'active' | 'expired' | 'cancelled';
    startDate: any;
    endDate: any;
    createdAt: any;
};
