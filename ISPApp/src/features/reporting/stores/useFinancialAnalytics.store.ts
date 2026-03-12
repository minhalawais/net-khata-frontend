import { create } from 'zustand';
import { UnifiedFinancialFilterState } from '../types';

const getPakistaniDate = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * 5); // PKT is UTC+5
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const today = getPakistaniDate();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

interface FinancialAnalyticsStore extends UnifiedFinancialFilterState {
    setFilter: (key: keyof UnifiedFinancialFilterState, value: string) => void;
    setQuickFilter: (timeRange: string) => void;
    resetFilters: () => void;
}

export const useFinancialAnalyticsStore = create<FinancialAnalyticsStore>((set, get) => ({
    // Default State
    startDate: formatDate(startOfMonth),
    endDate: formatDate(today),
    bankAccount: 'all',
    paymentMethod: 'all',
    invoiceStatus: 'all',
    ispPaymentType: 'all',
    expenseType: 'all',
    timeRange: 'mtd',

    // Actions
    setFilter: (key, value) => set({ [key]: value }),

    setQuickFilter: (timeRange) => {
        const todayDate = getPakistaniDate();
        let startDate = new Date(todayDate);

        switch (timeRange) {
            case 'today':
                startDate = new Date(todayDate);
                break;
            case 'week':
                startDate.setDate(todayDate.getDate() - 7);
                break;
            case 'mtd':
                startDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
                break;
            case 'qtd':
                const quarter = Math.floor(todayDate.getMonth() / 3);
                startDate = new Date(todayDate.getFullYear(), quarter * 3, 1);
                break;
            case 'ytd':
                startDate = new Date(todayDate.getFullYear(), 0, 1);
                break;
            case 'last_month':
                startDate = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
                const endDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 0);
                return set({
                    timeRange,
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate),
                });
        }

        set({
            timeRange,
            startDate: formatDate(startDate),
            endDate: formatDate(getPakistaniDate()),
        });
    },

    resetFilters: () => set({
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today),
        bankAccount: 'all',
        paymentMethod: 'all',
        invoiceStatus: 'all',
        ispPaymentType: 'all',
        expenseType: 'all',
        timeRange: 'mtd',
    })
}));
