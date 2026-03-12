import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { ReportingService } from '../services/reporting.service';
import { useFinancialAnalyticsStore } from '../stores/useFinancialAnalytics.store';

export const useFinancialAnalytics = () => {
    // Subscribe to all filters from Zustand store with shallow comparison to avoid infinite loop
    const filters = useFinancialAnalyticsStore(useShallow((state) => ({
        startDate: state.startDate,
        endDate: state.endDate,
        bankAccount: state.bankAccount,
        paymentMethod: state.paymentMethod,
        invoiceStatus: state.invoiceStatus,
        ispPaymentType: state.ispPaymentType,
        expenseType: state.expenseType,
        timeRange: state.timeRange,
    })));

    return useQuery({
        queryKey: ['financial_analytics', filters],
        queryFn: () => ReportingService.getFinancialAnalytics(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};
