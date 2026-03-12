import { create } from 'zustand';
import { RegionalFilterState } from '../types';

interface RegionalAnalyticsStore {
    filters: RegionalFilterState;
    setFilters: (newFilters: Partial<RegionalFilterState>) => void;
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
        endDate: formatDate(today),
    };
};

const defaultFilters: RegionalFilterState = {
    ...getInitialDates(),
    areaIds: [],
    planId: 'all',
    compare: 'last_month',
    timeRange: 'mtd'
};

export const useRegionalAnalyticsStore = create<RegionalAnalyticsStore>((set) => ({
    filters: defaultFilters,
    setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
    resetFilters: () => set({ filters: defaultFilters }),
}));
