import { useState, useCallback, useEffect } from 'react';
import { CustomerDashboardData, CustomerFilterState } from '../types';
import { ReportingService } from '../services/reporting.service';

const getPakistaniDate = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * 5);
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const useCustomerAnalytics = () => {
    const [data, setData] = useState<CustomerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const today = getPakistaniDate();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [filters, setFilters] = useState<CustomerFilterState>({
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today),
        areaId: 'all',
        subZoneId: 'all',
        ispId: 'all',
        servicePlanId: 'all',
        connectionType: 'all',
        status: 'all',
        compare: 'last_month',
        timeRange: 'mtd',
    });

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await ReportingService.getCustomerAnalytics(filters);
            setData(result);
        } catch (err: any) {
            console.error('CustomerAnalytics hook error:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch customer data');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateFilterTabs = (range: string) => {
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

        setFilters(prev => ({
            ...prev,
            timeRange: range,
            startDate: formatDate(startDate),
            endDate: formatDate(today)
        }));
    };

    const updateFilter = (newFilters: Partial<CustomerFilterState>) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            // Ensure child filters are reset if parent changes
            if (newFilters.areaId && newFilters.areaId !== prev.areaId) {
                updated.subZoneId = 'all';
            }
            return updated;
        });
    };

    return {
        data,
        isLoading,
        error,
        filters,
        updateFilter,
        updateFilterTabs,
        refresh: fetchData
    };
};
