import { create } from 'zustand';
import { ServicePlanFilterState } from '../types';

interface ServicePlanAnalyticsStore {
    filters: ServicePlanFilterState;
    setFilters: (filters: Partial<ServicePlanFilterState>) => void;
    resetFilters: () => void;
}

const getInitialDateRange = () => {
    const today = new Date();
    // Start of current month (MTD defaults usually align with web)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Format YYYY-MM-DD
    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    return {
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today),
    };
};

const defaultFilters: ServicePlanFilterState = {
    ...getInitialDateRange(),
    planIds: [],
    status: 'all',
    compare: 'last_month',
    timeRange: 'mtd'
};

export const useServicePlanAnalyticsStore = create<ServicePlanAnalyticsStore>((set) => ({
    filters: defaultFilters,
    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
    })),
    resetFilters: () => set({ filters: defaultFilters }),
}));
