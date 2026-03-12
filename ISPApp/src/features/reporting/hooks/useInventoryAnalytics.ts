import { useQuery } from '@tanstack/react-query';
import { ReportingService } from '../services/reporting.service';
import { useInventoryAnalyticsStore } from '../stores/useInventoryAnalytics.store';

export const useInventoryAnalytics = () => {
    const filters = useInventoryAnalyticsStore((state) => state.filters);

    return useQuery({
        queryKey: ['reporting', 'inventory', filters],
        queryFn: () => ReportingService.getInventoryAnalytics(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};
