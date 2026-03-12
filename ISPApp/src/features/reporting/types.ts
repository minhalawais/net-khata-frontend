export interface KPIData {
    value: number;
    previous: number;
    trend: number;
    is_positive: boolean;
}

export interface FilterState {
    startDate: string;
    endDate: string;
    areaId: string;
    ispId: string;
    servicePlanId: string;
    paymentMethod: string;
    compare: string;
    timeRange: string;
}

export interface ServiceSupportFilterState {
    startDate: string;
    endDate: string;
    status: string;
    priority: string;
    areaId: string;
    technicianId: string;
    compare: string;
    timeRange: string;
}

export interface InventoryFilterState {
    startDate: string;
    endDate: string;
    itemType: string;
    supplierId: string;
    status: string;
    compare: string;
    timeRange: string;
}

export interface EmployeeFilterState {
    startDate: string;
    endDate: string;
    role: string;
    status: string;
    compare: string;
    timeRange: string;
}

export interface DashboardData {
    kpis: {
        collections: KPIData;
        outstanding: KPIData;
        net_cash_flow: KPIData;
        collection_efficiency: KPIData;
        active_customers: KPIData;
        new_customers: KPIData;
        churned_customers: KPIData;
        growth_rate: KPIData;
        open_complaints: KPIData;
        avg_resolution_time: KPIData;
        pending_tasks: KPIData;
        completion_rate: KPIData;
        arpu: KPIData;
        gross_margin: KPIData;
        avg_days_to_pay: KPIData;
        recovery_rate: KPIData;
    };
    charts: {
        revenue_trend: any[];
        customer_growth: any[];
        payment_methods: any[];
        top_areas: any[];
        isp_analysis: any[];
        expense_breakdown: any[];
    };
    tables: {
        top_plans: any[];
        overdue_invoices: any[];
    };
    filters: {
        areas: { id: string; name: string }[];
        isps: { id: string; name: string }[];
        service_plans: { id: string; name: string }[];
        payment_methods: string[];
        compare_options: { value: string; label: string }[];
    };
}

export interface CustomerFilterState {
    startDate: string;
    endDate: string;
    areaId: string;
    subZoneId: string;
    ispId: string;
    servicePlanId: string;
    connectionType: string;
    status: string;
    compare: string;
    timeRange: string;
}

export interface CustomerSegment {
    count: number;
    label: string;
}

export interface CustomerDashboardData {
    kpis: {
        total_customers: KPIData;
        active_customers: KPIData;
        new_customers: KPIData;
        churned_customers: KPIData;
        acquisition_rate: KPIData;
        churn_rate: KPIData;
        net_growth_rate: KPIData;
        retention_rate: KPIData;
        arpu: KPIData;
        avg_lifetime_months: KPIData;
        clv: KPIData;
        avg_invoice: KPIData;
        avg_satisfaction: KPIData;
        complaint_rate: KPIData;
        avg_days_to_recharge: KPIData;
        equipment_ownership_rate: KPIData;
    };
    charts: {
        customer_growth: any[];
        area_distribution: any[];
        service_plan_popularity: any[];
        connection_types: any[];
        isp_distribution: any[];
        tenure_distribution: any[];
        payment_behavior: any[];
    };
    tables: {
        area_performance: any[];
        at_risk_customers: any[];
        newest_customers: any[];
        longest_tenure: any[];
    };
    segments: {
        new: CustomerSegment;
        stable: CustomerSegment;
        at_risk: CustomerSegment;
        churned: CustomerSegment;
    };
    filters: {
        areas: { id: string; name: string }[];
        sub_zones: { id: string; name: string; area_id: string }[];
        isps: { id: string; name: string }[];
        service_plans: { id: string; name: string }[];
        connection_types: string[];
    };
}

export interface BankOption {
    id: string;
    name: string;
}

export interface UnifiedFinancialKPIs {
    total_revenue: number;
    total_collections: number;
    total_isp_payments: number;
    total_expenses: number;
    total_extra_income: number;
    net_cash_flow: number;
    collection_efficiency: number;
    operating_profit?: number;
    total_initial_balance?: number;
    adjusted_cash_flow?: number;
}

export interface CashFlowData {
    monthly_trends: Array<{
        month: string;
        inflow: number;
        outflow: number;
        isp_outflow: number;
        expense_outflow: number;
        net_flow: number;
        adjusted_flow: number;
    }>;
    inflow_breakdown: Array<{ method: string; amount: number }>;
    outflow_breakdown: Array<{ type: string; amount: number }>;
    initial_balance?: number;
    total_adjusted_flow?: number;
}

export interface BankAccountAnalytics {
    bank_name: string;
    account_number: string;
    account_title?: string;
    collections: number;
    extra_income?: number;
    payments: number;
    isp_payments: number;
    expenses: number;
    net_flow: number;
    initial_balance?: number;
    current_balance?: number;
    adjusted_balance?: number;
    utilization_rate: number;
}

export interface ISPPaymentAnalytics {
    payment_types: Array<{
        type: string;
        total_amount: number;
        avg_amount: number;
        payment_count: number;
    }>;
    bank_account_breakdown: Array<{
        bank_name: string;
        account_number: string;
        total_amount: number;
        avg_amount: number;
        payment_count: number;
    }>;
    bandwidth_analysis: Array<{
        month: string;
        total_cost: number;
        total_usage: number;
        cost_per_gb: number;
    }>;
    total_isp_payments: number;
}

export interface UnifiedFinancialData {
    kpis: UnifiedFinancialKPIs;
    cash_flow: CashFlowData;
    bank_performance: BankAccountAnalytics[];
    isp_payments: ISPPaymentAnalytics;
    bank_accounts: BankOption[];
    income_analysis?: any;
    revenue_expense?: any;
    financial_waterfall?: any;
    three_line_trend?: any;
    cash_payments?: {
        collections: number;
        payments: number;
        isp_payments?: number;
        expenses?: number;
        extra_income?: number;
        net_flow: number;
    };
    filters?: any;
    initial_balance_summary?: {
        total_initial_balance: number;
        accounts_with_balance: number;
        average_balance: number;
    };
}

export interface UnifiedFinancialFilterState {
    startDate: string;
    endDate: string;
    bankAccount: string;
    paymentMethod: string;
    invoiceStatus: string;
    ispPaymentType: string;
    expenseType: string;
    timeRange: string;
}

export interface ServiceSupportData {
    kpis: {
        total_complaints: KPIData;
        open_complaints: KPIData;
        avg_resolution_time: KPIData;
        fcr_rate: KPIData;
        avg_satisfaction: KPIData;
        sla_compliance: KPIData;
        pending_tasks: KPIData;
        overdue_tasks: KPIData;
    };
    charts: {
        complaint_trend: Array<{ week: string; new: number; resolved: number }>;
        status_distribution: Array<{ status: string; count: number }>;
        resolution_time: Array<{ bucket: string; count: number }>;
        technician_performance: Array<{ name: string; completed: number }>;
    };
    tables: {
        open_complaints: Array<{
            id: string | number;
            ticket_number: string;
            customer_name: string;
            status: string;
            assigned_to: string;
        }>;
        technician_summary: Array<{
            id: string | number;
            name: string;
            resolved: number;
            avg_resolution_hours: number;
            csat_score: number;
        }>;
    };
    filters: {
        areas: Array<{ id: string; name: string }>;
        technicians: Array<{ id: string; name: string }>;
        statuses: string[];
        priorities: string[];
    };
}

export interface InventoryAnalyticsData {
    kpis: {
        total_items: KPIData;
        total_value: KPIData;
        in_stock: KPIData;
        assigned: KPIData;
        low_stock: KPIData;
        turnover_rate: KPIData;
        avg_assignment_days: KPIData;
        returns: KPIData;
    };
    charts: {
        stock_by_type: Array<{ type: string; quantity: number }>;
        movement_trend: Array<{ month: string; assignments: number; returns: number }>;
        value_distribution: Array<{ type: string; value: number }>;
        assignment_status: Array<{ status: string; count: number }>;
    };
    tables: {
        low_stock_items: Array<{
            id: string | number;
            item_type: string;
            quantity: number;
            threshold: number;
            supplier: string;
        }>;
        recent_transactions: Array<{
            id: string | number;
            type: string;
            item_type: string;
            quantity: number;
            performed_by: string;
        }>;
    };
    filters: {
        item_types: string[];
        suppliers: Array<{ id: string; name: string }>;
        statuses: string[];
    };
}

export interface EmployeeAnalyticsData {
    kpis: {
        total_employees: KPIData;
        total_salary: KPIData;
        pending_balance: KPIData;
        paid_period: KPIData;
        tasks_completed: KPIData;
        complaints_resolved: KPIData;
        avg_satisfaction: KPIData;
        top_performer: KPIData;
    };
    charts: {
        performance_by_employee: Array<{ name: string; tasks: number }>;
        productivity_trend: Array<{ month: string; tasks: number }>;
        role_distribution: Array<{ role: string; count: number }>;
        satisfaction_trend: Array<{ month: string; rating: number }>;
    };
    tables: {
        top_performers: Array<{
            id: string | number;
            name: string;
            role: string;
            tasks: number;
            satisfaction: number;
            balance: number;
        }>;
        recent_payouts: Array<{
            id: string | number;
            employee: string;
            type: string;
            amount: number;
            date: string;
        }>;
    };
    filters: {
        roles: string[];
        statuses: string[];
    };
}

export interface RegionalFilterState {
    startDate: string;
    endDate: string;
    areaIds: string[];
    planId: string;
    compare: string;
    timeRange: string;
}

export interface RegionalAnalyticsData {
    kpis: {
        total_revenue: KPIData;
        outstanding_dues: KPIData;
        collection_rate: KPIData;
        arpu: KPIData;
        active_users: KPIData;
        new_connections: KPIData;
        complaint_rate: KPIData;
        churn_rate: KPIData;
    };
    charts: {
        revenue_by_area: Array<{ area: string; revenue: number }>;
        growth_trends: any[]; // dynamic keys for areas
        service_distribution: Array<{ name: string; value: number }>;
        complaint_hotspots: Array<{ area: string; complaints: number }>;
    };
    tables: {
        area_performance: Array<{
            id: string | number;
            name: string;
            users: number;
            revenue: number;
            arpu: number;
            complaints: number;
        }>;
        critical_zones: Array<{
            area: string;
            issue: string;
            value: string;
            supervisor: string;
        }>;
    };
    filters: {
        areas: Array<{ id: string; name: string }>;
        plans: Array<{ id: string; name: string }>;
    };
}

export interface CollectionsAnalyticsData {
    metrics: {
        totalRecovered: number;
        totalOutstanding: number;
        recoveryRate: number;
        avgCollectionTime: number;
    };
    recoveryPerformanceData: Array<{
        month: string;
        recovered: number;
        outstanding: number;
    }>;
    dailyRecoveryTrend: Array<{
        date: string;
        recovered: number;
    }>;
    outstandingByAgeData: Array<{
        name: string;
        value: number;
    }>;
}

export interface ServicePlanFilterState {
    startDate: string;
    endDate: string;
    planIds: string[];
    status: string;
    compare: string;
    timeRange: string;
}

export interface ServicePlanAnalyticsData {
    kpis: {
        total_revenue: KPIData;
        active_subs: KPIData;
        arpu: KPIData;
        new_subs: KPIData;
        churn_subs: KPIData;
        retention_rate: KPIData;
        top_rev_plan: KPIData;
        top_vol_plan: KPIData;
    };
    charts: {
        revenue_by_plan: Array<{
            name: string;
            value: number;
        }>;
        subscription_trends: Array<{
            month: string;
            new: number;
            churn: number;
        }>;
        market_share: Array<{
            name: string;
            value: number;
        }>;
        revenue_vs_volume: Array<{
            name: string;
            volume: number;
            revenue: number;
        }>;
    };
    tables: {
        plan_performance: Array<{
            id: string;
            name: string;
            price: number;
            subscribers: number;
            revenue: number;
            churn_rate: number;
        }>;
        recent_activity: any[];
    };
    filters: {
        plans: Array<{ id: string; name: string }>;
        statuses: string[];
    };
}

export interface NetworkPerformanceData {
    month: string;
    uptime: number;
    latency: number;
}

export interface ServiceRequestData {
    type: string;
    count: number;
}

export interface OperationalMetricsData {
    averageUptime: number;
    averageLatency: number;
    totalServiceRequests: number;
    avgResolutionTime: number;
}

export interface OperationsAnalyticsData {
    networkPerformanceData: NetworkPerformanceData[];
    serviceRequestsData: ServiceRequestData[];
    metrics: OperationalMetricsData;
}
