import axiosInstance from '../../../../config/axios';
import { DashboardData, FilterState, CustomerDashboardData, CustomerFilterState, UnifiedFinancialData, UnifiedFinancialFilterState, ServiceSupportData, ServiceSupportFilterState, InventoryAnalyticsData, InventoryFilterState, EmployeeAnalyticsData, EmployeeFilterState, RegionalFilterState, RegionalAnalyticsData, CollectionsAnalyticsData, ServicePlanAnalyticsData, ServicePlanFilterState, OperationsAnalyticsData } from '../types';

export const ReportingService = {
    getExecutiveDashboard: async (filters: FilterState): Promise<DashboardData> => {
        try {
            const params = new URLSearchParams({
                start_date: filters.startDate,
                end_date: filters.endDate,
                area_id: filters.areaId,
                isp_id: filters.ispId,
                service_plan_id: filters.servicePlanId,
                payment_method: filters.paymentMethod,
                compare: filters.compare
            });

            const response = await axiosInstance.get(`/dashboard/executive-advanced?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getCustomerAnalytics: async (filters: CustomerFilterState): Promise<CustomerDashboardData> => {
        try {
            const params = new URLSearchParams({
                start_date: filters.startDate,
                end_date: filters.endDate,
                area_id: filters.areaId,
                sub_zone_id: filters.subZoneId,
                isp_id: filters.ispId,
                service_plan_id: filters.servicePlanId,
                connection_type: filters.connectionType,
                status: filters.status,
                compare: filters.compare
            });

            const response = await axiosInstance.get(`/dashboard/customer-advanced?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getFinancialAnalytics: async (filters: UnifiedFinancialFilterState): Promise<UnifiedFinancialData> => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append("start_date", filters.startDate);
            if (filters.endDate) params.append("end_date", filters.endDate);
            if (filters.bankAccount && filters.bankAccount !== "all") params.append("bank_account_id", filters.bankAccount);
            if (filters.paymentMethod && filters.paymentMethod !== "all") params.append("payment_method", filters.paymentMethod);
            if (filters.invoiceStatus && filters.invoiceStatus !== "all") params.append("invoice_status", filters.invoiceStatus);
            if (filters.ispPaymentType && filters.ispPaymentType !== "all") params.append("isp_payment_type", filters.ispPaymentType);
            if (filters.expenseType && filters.expenseType !== "all") params.append("expense_type", filters.expenseType);

            const response = await axiosInstance.get(`/dashboard/unified-financial?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getServiceSupportAnalytics: async (filters: ServiceSupportFilterState): Promise<ServiceSupportData> => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append("start_date", filters.startDate);
            if (filters.endDate) params.append("end_date", filters.endDate);
            if (filters.status && filters.status !== "all") params.append("status", filters.status);
            if (filters.priority && filters.priority !== "all") params.append("priority", filters.priority);
            if (filters.areaId && filters.areaId !== "all") params.append("area_id", filters.areaId);
            if (filters.technicianId && filters.technicianId !== "all") params.append("technician_id", filters.technicianId);
            if (filters.compare) params.append("compare", filters.compare);

            const response = await axiosInstance.get(`/dashboard/service-support-advanced?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getInventoryAnalytics: async (filters: InventoryFilterState): Promise<InventoryAnalyticsData> => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append("start_date", filters.startDate);
            if (filters.endDate) params.append("end_date", filters.endDate);
            if (filters.itemType && filters.itemType !== "all") params.append("item_type", filters.itemType);
            if (filters.supplierId && filters.supplierId !== "all") params.append("supplier_id", filters.supplierId);
            if (filters.status && filters.status !== "all") params.append("status", filters.status);
            if (filters.compare) params.append("compare", filters.compare);

            const response = await axiosInstance.get(`/dashboard/inventory-advanced?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getEmployeeAnalytics: async (filters: EmployeeFilterState): Promise<EmployeeAnalyticsData> => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append("start_date", filters.startDate);
            if (filters.endDate) params.append("end_date", filters.endDate);
            if (filters.role && filters.role !== "all") params.append("role", filters.role);
            if (filters.status && filters.status !== "all") params.append("status", filters.status);
            if (filters.compare) params.append("compare", filters.compare);

            const response = await axiosInstance.get(`/dashboard/employee-advanced?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getRegionalAnalytics: async (filters: RegionalFilterState): Promise<RegionalAnalyticsData> => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append("start_date", filters.startDate);
            if (filters.endDate) params.append("end_date", filters.endDate);
            if (filters.areaIds && filters.areaIds.length > 0) params.append("area_ids", filters.areaIds.join(','));
            else params.append("area_ids", "all");
            if (filters.planId && filters.planId !== "all") params.append("plan_id", filters.planId);
            if (filters.compare) params.append("compare", filters.compare);

            const response = await axiosInstance.get(`/dashboard/regional-advanced?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getCollectionsAnalytics: async (): Promise<CollectionsAnalyticsData> => {
        try {
            const response = await axiosInstance.get(`/dashboard/recovery-collections`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getServicePlanAnalytics: async (filters: ServicePlanFilterState): Promise<ServicePlanAnalyticsData> => {
        try {
            const params = new URLSearchParams({
                start_date: filters.startDate,
                end_date: filters.endDate,
                plan_ids: filters.planIds.length > 0 ? filters.planIds.join(',') : 'all',
                status: filters.status,
                compare: filters.compare
            }).toString();
            const response = await axiosInstance.get(`/dashboard/service-plan-advanced?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getOperationsAnalytics: async (): Promise<OperationsAnalyticsData> => {
        // Return simulated mock payload exactly duplicating the Web dashboard structure since `/dashboard/operational-metrics` is not active on backend.
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    networkPerformanceData: [
                        { month: "Jan", uptime: 99.9, latency: 20 },
                        { month: "Feb", uptime: 99.8, latency: 22 },
                        { month: "Mar", uptime: 99.95, latency: 18 },
                        { month: "Apr", uptime: 99.7, latency: 25 },
                        { month: "May", uptime: 99.85, latency: 21 },
                        { month: "Jun", uptime: 99.9, latency: 19 },
                    ],
                    serviceRequestsData: [
                        { type: "Installation", count: 150 },
                        { type: "Repair", count: 100 },
                        { type: "Upgrade", count: 80 },
                        { type: "Cancellation", count: 30 },
                        { type: "Billing Inquiry", count: 120 },
                    ],
                    metrics: {
                        averageUptime: 99.85,
                        averageLatency: 20.8,
                        totalServiceRequests: 480,
                        avgResolutionTime: 4.5
                    }
                });
            }, 600); // UI artificial load delay for skeleton handling
        });
    }
};
