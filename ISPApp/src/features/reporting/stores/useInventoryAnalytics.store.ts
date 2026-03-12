import { create } from 'zustand';
import { InventoryFilterState } from '../types';

interface InventoryStore {
    filters: InventoryFilterState;
    setFilters: (filters: Partial<InventoryFilterState>) => void;
    setQuickFilter: (range: 'today' | 'week' | 'mtd' | 'qtd' | 'ytd') => void;
    resetFilters: () => void;
}

const getPakistaniDate = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 5));
};

const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getInitialDates = () => {
    const today = getPakistaniDate();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today)
    };
};

const defaultFilters: InventoryFilterState = {
    ...getInitialDates(),
    itemType: 'all',
    supplierId: 'all',
    status: 'all',
    compare: 'last_month',
    timeRange: 'mtd'
};

export const useInventoryAnalyticsStore = create<InventoryStore>((set) => ({
    filters: defaultFilters,

    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters }
        })),

    setQuickFilter: (range) => {
        const today = getPakistaniDate();
        let startDate: Date;

        switch (range) {
            case 'today':
                startDate = today;
                break;
            case 'week':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                break;
            case 'mtd':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'qtd':
                const quarter = Math.floor(today.getMonth() / 3);
                startDate = new Date(today.getFullYear(), quarter * 3, 1);
                break;
            case 'ytd':
                startDate = new Date(today.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        }

        set((state) => ({
            filters: {
                ...state.filters,
                timeRange: range,
                startDate: formatDate(startDate),
                endDate: formatDate(today)
            }
        }));
    },

    resetFilters: () =>
        set({ filters: defaultFilters })
}));
