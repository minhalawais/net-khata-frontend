import { useState, useCallback, useEffect } from 'react';
import { DashboardData, FilterState } from '../types';
import { ReportingService } from '../services/reporting.service';

const getPakistaniDate = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 5));
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const useExecutiveDashboard = () => {
    const today = getPakistaniDate();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [filters, setFilters] = useState<FilterState>({
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today),
        areaId: 'all',
        ispId: 'all',
        servicePlanId: 'all',
        paymentMethod: 'all',
        compare: 'last_month',
        timeRange: 'mtd'
    });

    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await ReportingService.getExecutiveDashboard(filters);
            setData(result);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const updateFilter = (newFilters: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return {
        data,
        isLoading,
        error,
        filters,
        updateFilter,
        refresh: fetchDashboard
    };
};
