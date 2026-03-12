import { useQuery } from '@tanstack/react-query';
import { ReportingService } from '../services/reporting.service';
import { useEmployeeAnalyticsStore } from '../stores/useEmployeeAnalytics.store';

export const useEmployeeAnalytics = () => {
    const filters = useEmployeeAnalyticsStore((state) => state.filters);

    return useQuery({
        queryKey: ['reporting', 'employee', filters],
        queryFn: () => ReportingService.getEmployeeAnalytics(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        retry: 2,
    });
};
