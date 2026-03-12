import { useQuery } from '@tanstack/react-query';
import { ReportingService } from '../services/reporting.service';

export const useOperationsAnalytics = () => {
    return useQuery({
        queryKey: ['operationsAnalytics'],
        queryFn: () => ReportingService.getOperationsAnalytics(),
        staleTime: 5 * 60 * 1000,
    });
};
