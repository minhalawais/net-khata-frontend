import { useQuery } from '@tanstack/react-query';
import { ReportingService } from '../services/reporting.service';
import { RegionalFilterState } from '../types';

export const useRegionalAnalytics = (filters: RegionalFilterState) => {
    return useQuery({
        queryKey: ['regionalAnalytics', filters],
        queryFn: () => ReportingService.getRegionalAnalytics(filters),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        retry: 2,
    });
};
