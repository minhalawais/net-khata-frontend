import { useQuery } from '@tanstack/react-query';
import { ReportingService } from '../services/reporting.service';
import { useServiceSupportAnalyticsStore } from '../stores/useServiceSupportAnalytics.store';

export const useServiceSupportAnalytics = () => {
    const filters = useServiceSupportAnalyticsStore((state) => state.filters);

    return useQuery({
        queryKey: ['reporting', 'service-support', filters],
        queryFn: () => ReportingService.getServiceSupportAnalytics(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};
