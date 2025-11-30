'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// --- Data ---
const accountSummaryData = {
    'Bank Name': 'HDFC',
    'Account Number': '**** **** **** 1234',
    'High Credit': '₹10,000',
    'Open Date': '12 Jan 2022',
    'EMI Amount': '₹4571',
    'Loan Type': 'Credit Card',
    'Ownership': 'Individual',
    'Current Balance': '₹8,450',
    'Closed Date': 'N/A',
    'Report and Certified': 'Yes',
};

const accountStatusData = {
    'Amount Over Due': '₹0',
    'Written-off Amount (Principal)': '₹0',
    'Settlement Amount': '₹0',
    'Credit Facility Status': 'Active',
    'Written-off Amount (Total)': '₹0',
    'Suit-Filed/Wilful Default': 'N/A',
};

const paymentHistoryData = [
    { year: 2025, payments: ['STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', {dpd: 30}, 'STD', null, null] },
    { year: 2024, payments: ['STD', 'STD', {dpd: 900}, 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD'] },
    { year: 2023, payments: ['STD', 'STD', 'STD', {dpd: 60}, 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD'] },
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getStatusInfo = (status: 'STD' | 'SUB' | { dpd: number } | null) => {
    if (status === null) return { class: 'bg-gray-100 border-2 border-gray-200 text-transparent', symbol: '', tooltip: 'Not Reported' };
    if (typeof status === 'object' && status.dpd) return { class: 'bg-red-500 text-white text-[7px]', symbol: status.dpd.toString(), tooltip: `${status.dpd} Days Past Due` };
    switch (status) {
        case 'STD': return { class: 'bg-green-500 text-white text-[7px]', symbol: 'STD', tooltip: 'On-Time' };
        case 'SUB': return { class: 'bg-green-500 text-white text-[7px]', symbol: 'STD', tooltip: 'On-Time' };
        default: return { class: 'bg-gray-100 border-2 border-gray-200 text-transparent', symbol: '', tooltip: 'Not Reported' };
    }
};

const TableRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center py-2 px-4">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-bold text-foreground text-right truncate" title={String(value)}>{value}</span>
    </div>
);


function AccountDetailContent() {
    const router = useRouter();
    const { toast } = useToast();
    const [currentYearIndex, setCurrentYearIndex] = React.useState(0);
    const [tooltipState, setTooltipState] = React.useState<{ content: string; top: number; left: number; visible: boolean } | null>(null);

    const onTimePercentage = React.useMemo(() => {
        const countablePayments = paymentHistoryData.reduce((acc, year) => acc + year.payments.filter(p => p !== null).length, 0);
        const onTimePayments = paymentHistoryData.reduce((acc, year) => acc + year.payments.filter(p => p === 'STD').length, 0);
        return countablePayments > 0 ? ((onTimePayments / countablePayments) * 100).toFixed(0) : '0';
    }, []);

    const handleYearNavigation = (direction: number) => {
        const newIndex = currentYearIndex + direction;
        if (newIndex >= 0 && newIndex < paymentHistoryData.length) {
            setCurrentYearIndex(newIndex);
        }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, status: string, year: number, month: string) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const tooltipWidth = 140;
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;
        if (left < 10) left = 10;
        if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;

        setTooltipState({
            content: `<div class="font-bold text-xs">${month} ${year}</div><div class="text-xs">${status}</div>`,
            top: rect.top - 50,
            left: left,
            visible: true
        });
    };
    
    const handleDisputeClick = () => {
        toast({
            title: "Feature Not Available",
            description: "The dispute form is currently under development and will be available soon.",
            variant: "default",
        });
    };

    return (
        <div className="fixed inset-0 w-full h-[100dvh] bg-background text-foreground flex flex-col overflow-hidden select-none overscroll-none">
            
            <style>{`
                html, body {
                    overscroll-behavior: none;
                    overflow: hidden;
                    height: 100%;
                    touch-action: manipulation;
                }
            `}</style>

            {tooltipState?.visible && (
                <div
                    className="fixed z-50 p-2 text-center text-white bg-gray-900/95 backdrop-blur rounded-lg shadow-xl pointer-events-none transition-opacity"
                    style={{ top: `${tooltipState.top}px`, left: `${tooltipState.left}px`, width: '140px' }}
                    dangerouslySetInnerHTML={{ __html: tooltipState.content }}
                />
            )}

            <div className="flex flex-col p-4 gap-4 w-full max-w-md mx-auto h-full overflow-y-auto">
                
                 <header className="flex items-center justify-between shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/insights')}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </header>

                <Card className="shadow-sm">
                    <CardContent className="p-0">
                        {/* Account Summary Section */}
                        <div className="shrink-0">
                            <h2 className="text-xl font-bold tracking-tight px-4 pt-4 mb-2">Account Summary</h2>
                            <div className="grid grid-cols-2">
                               <div className="flex flex-col">
                                 <TableRow label="Bank Name" value={accountSummaryData['Bank Name']} />
                                 <TableRow label="Account Number" value={accountSummaryData['Account Number']} />
                                 <TableRow label="High Credit" value={accountSummaryData['High Credit']} />
                                 <TableRow label="Open Date" value={accountSummaryData['Open Date']} />
                                 <TableRow label="EMI Amount" value={accountSummaryData['EMI Amount']} />
                               </div>
                               <div className="flex flex-col">
                                 <TableRow label="Loan Type" value={accountSummaryData['Loan Type']} />
                                 <TableRow label="Ownership" value={accountSummaryData['Ownership']} />
                                 <TableRow label="Current Balance" value={accountSummaryData['Current Balance']} />
                                 <TableRow label="Closed Date" value={accountSummaryData['Closed Date']} />
                                 <TableRow label="Report and Certified" value={accountSummaryData['Report and Certified']} />
                               </div>
                            </div>
                        </div>

                        {/* Account Status Section */}
                        <div className="shrink-0 mt-4">
                            <h2 className="text-xl font-bold tracking-tight px-4 mb-2">Account Status</h2>
                            <div className="grid grid-cols-2">
                               <div className="flex flex-col">
                                 <TableRow label="Amount Over Due" value={accountStatusData['Amount Over Due']} />
                                 <TableRow label="Written-off Amount (Principal)" value={accountStatusData['Written-off Amount (Principal)']} />
                                 <TableRow label="Settlement Amount" value={accountStatusData['Settlement Amount']} />
                               </div>
                               <div className="flex flex-col">
                                 <TableRow label="Credit Facility Status" value={accountStatusData['Credit Facility Status']} />
                                 <TableRow label="Written-off Amount (Total)" value={accountStatusData['Written-off Amount (Total)']} />
                                 <TableRow label="Suit-Filed/Wilful Default" value={accountStatusData['Suit-Filed/Wilful Default']} />
                               </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {/* Payment History Section */}
                <Card className="flex-shrink-0 bg-card border shadow-sm overflow-hidden">
                    <CardHeader className="pb-2 pt-3 px-4 shrink-0 flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-base font-bold">Payment History</CardTitle>
                            <p className="text-xs text-muted-foreground">Latest 3 years</p>
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 whitespace-nowrap ml-2">
                            {onTimePercentage}% On-Time
                        </span>
                    </CardHeader>
                    
                    <CardContent className="px-4 pb-3 flex flex-col">
                        <div className="flex items-center justify-between mb-2 mt-1">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleYearNavigation(1)} 
                                disabled={currentYearIndex >= paymentHistoryData.length - 1}
                                aria-label="Previous Year"
                            >
                                ←
                            </Button>
                            
                            <span className="font-mono text-sm font-bold tracking-widest text-foreground/80 select-none">
                                {paymentHistoryData[currentYearIndex].year}
                            </span>

                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleYearNavigation(-1)} 
                                disabled={currentYearIndex <= 0}
                                aria-label="Next Year"
                            >
                                →
                            </Button>
                        </div>

                        <div className="grid grid-cols-6 gap-y-2 gap-x-1 place-items-center w-full mb-4">
                            {monthNames.map((month, idx) => {
                                const status = paymentHistoryData[currentYearIndex].payments[idx];
                                const { class: statusClass, symbol, tooltip } = getStatusInfo(status as any);
                                return (
                                    <div key={month} className="flex flex-col items-center w-full">
                                        <span className="text-[8px] sm:text-[10px] text-muted-foreground mb-1">{month}</span>
                                        <div
                                            className={`
                                                w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center 
                                                font-bold transition-transform active:scale-95 cursor-pointer 
                                                shadow-sm ${statusClass}
                                            `}
                                            onMouseEnter={(e) => handleMouseEnter(e, tooltip, paymentHistoryData[currentYearIndex].year, month)}
                                            onMouseLeave={() => setTooltipState(null)}
                                            onTouchStart={(e) => handleMouseEnter(e, tooltip, paymentHistoryData[currentYearIndex].year, month)}
                                            onTouchEnd={() => setTimeout(() => setTooltipState(null), 1500)}
                                        >
                                            {symbol}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-auto pt-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                <span className="text-xs text-muted-foreground">On-Time</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <span className="text-xs text-muted-foreground">DPD</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-100 border border-gray-300"></div>
                                <span className="text-xs text-muted-foreground">Not Reported</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="shrink-0 pt-2 mt-auto">
                    <Button 
                        onClick={handleDisputeClick}
                        className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold shadow-md active:scale-[0.98] transition-transform"
                    >
                        Raise a Dispute
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function AccountDetailPage({ searchParams }: { searchParams: any }) {
    return <AccountDetailContent />;
}