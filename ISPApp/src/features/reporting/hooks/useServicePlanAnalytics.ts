import { useQuery } from '@tanstack/react-query';
import { ReportingService } from '../services/reporting.service';
import { ServicePlanFilterState } from '../types';

export const useServicePlanAnalytics = (filters: ServicePlanFilterState) => {
    return useQuery({
        queryKey: ['servicePlanAnalytics', filters],
        queryFn: () => ReportingService.getServicePlanAnalytics(filters),
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};
