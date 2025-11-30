'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

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
    'Report and Certified': '2025-09-03',
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
    { year: 2023, payments: ['STD', 'STD', 'STD', { dpd: 60 }, 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD'] },
    { year: 2024, payments: ['STD', 'STD', { dpd: 900 }, 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD'] },
    { year: 2025, payments: ['STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', 'STD', { dpd: 30 }, 'STD', null, null] },
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getStatusInfo = (status: 'STD' | 'SUB' | { dpd: number } | null) => {
    if (status === null) return { class: 'bg-gray-700/50 text-transparent', symbol: '', tooltip: 'Not Reported' };
    if (typeof status === 'object' && status.dpd) return { class: 'bg-red-500 text-white text-[7px] font-bold', symbol: status.dpd, tooltip: `${status.dpd} Days Past Due` };
    switch (status) {
        case 'STD': return { class: 'bg-[#52a447] text-white text-[7px] font-bold', symbol: 'STD', tooltip: 'On-Time' };
        case 'SUB': return { class: 'bg-[#52a447] text-white text-[7px] font-bold', symbol: 'SUB', tooltip: 'On-Time' };
        default: return { class: 'bg-gray-700/50 text-transparent', symbol: '', tooltip: 'Not Reported' };
    }
};

const TableRow = ({ label, value }: { label: string, value: string | number | React.ReactNode }) => (
    <div className="flex items-start justify-between py-2">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="text-sm font-bold text-gray-900 text-right truncate" title={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}>{value}</div>
    </div>
);


function AccountDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { toast } = useToast();
    const [currentYearIndex, setCurrentYearIndex] = React.useState(paymentHistoryData.length - 1);
    const [tooltipState, setTooltipState] = React.useState<{ content: string; top: number; left: number; visible: boolean } | null>(null);
    const [showStatus, setShowStatus] = React.useState(false);
    const [disputeType, setDisputeType] = React.useState<string | undefined>(undefined);

    const onTimePercentage = React.useMemo(() => {
        const countablePayments = paymentHistoryData.reduce((acc, year) => acc + year.payments.filter(p => p !== null).length, 0);
        const onTimePayments = paymentHistoryData.reduce((acc, year) => acc + year.payments.filter(p => p === 'STD').length, 0);
        return countablePayments > 0 ? Math.round((onTimePayments / countablePayments) * 100) : 0;
    }, []);

    const handleYearNavigation = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setCurrentYearIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else {
            setCurrentYearIndex(prev => (prev < paymentHistoryData.length - 1 ? prev + 1 : paymentHistoryData.length - 1));
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

    const handleDisputeSubmit = () => {
        if (!disputeType) {
            toast({
                variant: 'destructive',
                title: 'Please select a dispute type.',
            });
            return;
        }

        const recipient = 'suryacred458@gmail.com';
        const subject = `Dispute Raised: ${disputeType} for Account ${accountSummaryData['Account Number']}`;
        const body = `
Dear Support Team,

I am writing to raise a dispute regarding my account.

Dispute Type: ${disputeType}

Account Details:
----------------
Bank Name: ${accountSummaryData['Bank Name']}
Account Number: ${accountSummaryData['Account Number']}
Current Balance: ${accountSummaryData['Current Balance']}
Loan Type: ${accountSummaryData['Loan Type']}

Please investigate this matter.

Regards,
A FinPulse User
        `;

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;

        toast({
            title: 'Redirecting to Email Client',
            description: 'Please complete and send the email to submit your dispute.',
        });
    };

    return (
        <div className="fixed inset-0 w-full h-[100dvh] bg-gray-100 text-gray-900 flex flex-col overflow-hidden select-none overscroll-none">

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
                    className="fixed z-50 p-2 text-center text-white bg-gray-800 backdrop-blur rounded-lg shadow-xl pointer-events-none transition-opacity"
                    style={{ top: `${tooltipState.top}px`, left: `${tooltipState.left}px`, width: '140px' }}
                    dangerouslySetInnerHTML={{ __html: tooltipState.content }}
                />
            )}

            <div className="flex flex-col p-4 w-full h-full overflow-y-auto space-y-4">

                <header className="flex items-center justify-start shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/insights')}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </header>

                <div className="bg-white p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-4 border-b border-dotted border-gray-300 pb-4">
                        <h3 className="text-xl font-bold tracking-tight">Account Summary</h3>
                        <span className="text-xs font-medium bg-green-100 text-green-600 px-3 py-1 rounded-full border border-green-200 whitespace-nowrap">
                            {accountStatusData['Credit Facility Status']}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <TableRow label="Bank Name" value="HDFC" />
                        <TableRow label="Account Number" value={accountSummaryData['Account Number']} />
                        <TableRow label="High Credit" value={accountSummaryData['High Credit']} />
                        <TableRow label="Open Date" value={accountSummaryData['Open Date']} />
                        <TableRow label="EMI Amount" value={accountSummaryData['EMI Amount']} />
                        <TableRow label="Loan Type" value={accountSummaryData['Loan Type']} />
                        <TableRow label="Ownership" value={accountSummaryData['Ownership']} />
                        <TableRow label="Current Balance" value={accountSummaryData['Current Balance']} />
                    </div>

                    <motion.div
                        initial={false}
                        animate={{ height: showStatus ? 'auto' : 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-1 pt-2">
                            <TableRow label="Closed Date" value={accountSummaryData['Closed Date']} />
                            <TableRow label="Report and Certified" value={accountSummaryData['Report and Certified']} />
                            <TableRow label="Amount Over Due" value={accountStatusData['Amount Over Due']} />
                            <TableRow label="Settlement Amount" value={accountStatusData['Settlement Amount']} />
                            <TableRow label="Written-off Amount (Total)" value={accountStatusData['Written-off Amount (Total)']} />
                            <TableRow label="Written-off Amount (Principal)" value={accountStatusData['Written-off Amount (Principal)']} />
                            <TableRow label="Credit Facility Status" value={accountStatusData['Credit Facility Status']} />
                            <TableRow label="Suit-Filed/Wilful Default" value={accountStatusData['Suit-Filed/Wilful Default']} />
                        </div>
                    </motion.div>
                    <div className="relative pt-4 text-center">
                        <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        <button onClick={() => setShowStatus(!showStatus)} className="w-full flex justify-center items-center gap-2 text-sm text-gray-500">
                            <ChevronDown className={`w-4 h-4 transition-transform ${showStatus ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>


                {/* Payment History Section */}
                <Card className="flex-shrink-0 bg-white border-gray-200 shadow-sm overflow-hidden p-4">
                    <CardHeader className="p-0 shrink-0 flex flex-row items-center justify-between space-y-0 pb-4 mb-4 border-b border-dotted border-gray-300">
                        <div>
                            <CardTitle className="text-base font-bold text-gray-900">Payment History</CardTitle>
                        </div>
                        <div className="relative h-7 px-3 flex items-center justify-center bg-transparent border border-green-500 rounded-full text-xs font-semibold text-green-600 overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-green-100" style={{ width: `${onTimePercentage}%` }}></div>
                            <span className="relative z-10">{onTimePercentage}% On-Time</span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="outline"
                                className="h-7 px-2 text-xs rounded-full bg-gray-100 border-gray-300 text-gray-800"
                                onClick={() => handleYearNavigation('prev')}
                                disabled={currentYearIndex === 0}
                                aria-label="Previous Year"
                            >
                                {currentYearIndex > 0 && `‹ ${paymentHistoryData[currentYearIndex - 1].year}`}
                            </Button>

                            <Button
                                variant="outline"
                                className="h-7 px-2 text-xs rounded-full bg-gray-100 border-gray-300 text-gray-800"
                                onClick={() => handleYearNavigation('next')}
                                disabled={currentYearIndex === paymentHistoryData.length - 1}
                                aria-label="Next Year"
                            >
                                {currentYearIndex < paymentHistoryData.length - 1 && `${paymentHistoryData[currentYearIndex + 1].year} ›`}
                            </Button>
                        </div>

                        <div className="grid grid-cols-6 gap-y-3 gap-x-2 place-items-center w-full mb-4">
                            {monthNames.map((month, idx) => {
                                const status = paymentHistoryData[currentYearIndex].payments[idx];
                                const { class: statusClass, symbol, tooltip } = getStatusInfo(status as any);
                                return (
                                    <div key={month} className="flex flex-col items-center w-full gap-2">
                                        <span className="text-[10px] text-gray-500">{month}</span>
                                        <div
                                            className={cn(
                                                `w-6 h-6 rounded-full flex items-center justify-center 
                                                font-bold transition-transform active:scale-95 cursor-pointer 
                                                shadow-sm`, statusClass
                                            )}
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
                                <div className="w-2.5 h-2.5 rounded-full bg-[#52a447]"></div>
                                <span className="text-xs text-gray-500">On-Time</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <span className="text-xs text-gray-500">DPD</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                                <span className="text-xs text-gray-500">Not Reported</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="shrink-0 pt-2 mt-auto">
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="w-full h-12 flex items-center justify-center cursor-pointer group">
                                <div
                                    className="relative w-4/5 h-full bg-gray-800 rounded-full shadow-inner transition-all duration-300 ease-out flex items-center justify-center text-sm font-bold text-white group-hover:shadow-lg group-active:shadow-inner"
                                >
                                    <span className="z-10">Dispute Issue</span>
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-gray-900 border-gray-200">
                            <DialogHeader>
                                <DialogTitle>Select Dispute Type</DialogTitle>
                                <DialogDescription>
                                    Choose the type of error you want to report for this account.
                                </DialogDescription>
                            </DialogHeader>
                            <RadioGroup onValueChange={setDisputeType} className="my-4 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Data Error" id="r1" />
                                    <Label htmlFor="r1">Data Error</Label>
                                </div>
                                <p className="pl-6 text-xs text-muted-foreground">
                                    Select this if you see incorrect information in your account summary, such as a wrong loan amount, open date, or balance.
                                </p>
                                <div className="flex items-center space-x-2 pt-2">
                                    <RadioGroupItem value="Account Mismatch" id="r2" />
                                    <Label htmlFor="r2">Account Mismatch</Label>
                                </div>
                                <p className="pl-6 text-xs text-muted-foreground">
                                    Select this if this account does not belong to you or is incorrectly listed on your credit report.
                                </p>
                            </RadioGroup>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="submit" onClick={handleDisputeSubmit} className="bg-gray-800 text-white hover:bg-gray-700">Submit</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}

export default function AccountDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AccountDetailContent />
        </Suspense>
    );
}
