import { useQuery } from '@tanstack/react-query';
import { ReportingService } from '../services/reporting.service';

export const useCollectionsAnalytics = () => {
    return useQuery({
        queryKey: ['collectionsAnalytics'],
        queryFn: () => ReportingService.getCollectionsAnalytics(),
        staleTime: 10 * 60 * 1000,
        refetchInterval: 10 * 60 * 1000,
        retry: 2,
    });
};
