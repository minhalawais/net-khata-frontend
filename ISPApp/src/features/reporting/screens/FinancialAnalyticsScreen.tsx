import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinancialAnalytics } from '../hooks/useFinancialAnalytics';
import { useFinancialAnalyticsStore } from '../stores/useFinancialAnalytics.store';
import { useShallow } from 'zustand/react/shallow';
import { TopHeader } from '../../../components/navigation/TopHeader';
import { KPIGrid, KPIRow } from '../components/KPIGrid';
import { KPICard } from '../components/KPICard';
import { CashFlowAnalysis } from '../components/CashFlowAnalysis';
import { BankAccountAnalysis } from '../components/BankAccountAnalysis';
import { ISPPaymentAnalysis } from '../components/ISPPaymentAnalysis';
import { UnifiedFinancialFilterModal } from '../components/UnifiedFinancialFilterModal';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { EmptyState } from '../../../components/data/EmptyState';
import { colors, spacing } from '../../../theme';

const formatCurrency = (amount: number) => {
    return 'PKR ' + (amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const FinancialAnalyticsScreen = () => {
    const { data, isLoading, isError, error, refetch } = useFinancialAnalytics();

    // Subscribe to the full filter object and actions with useShallow
    const filters = useFinancialAnalyticsStore(useShallow((state) => ({
        startDate: state.startDate,
        endDate: state.endDate,
        bankAccount: state.bankAccount,
        paymentMethod: state.paymentMethod,
        invoiceStatus: state.invoiceStatus,
        ispPaymentType: state.ispPaymentType,
        expenseType: state.expenseType,
        timeRange: state.timeRange,
        setFilter: state.setFilter,
        setQuickFilter: state.setQuickFilter,
        resetFilters: state.resetFilters,
    })));

    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    if (isLoading && !data) {
        return (
            <View style={styles.container}>
                <TopHeader title="Financial Analytics" />
                <DashboardSkeleton />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.container}>
                <TopHeader title="Financial Analytics" />
                <View style={styles.centerOuter}>
                    <EmptyState
                        icon="alert-circle-outline"
                        title="Unable to load dashboard"
                        subtitle={(error as Error)?.message || "Please check your connection and try again."}
                        actionLabel="Try Again"
                        onActionPress={refetch}
                    />
                </View>
            </View>
        );
    }

    if (!data) return null;

    const handleApplyFilters = (newFilters: any) => {
        if (!newFilters) return;
        Object.entries(newFilters).forEach(([key, value]) => {
            filters.setFilter(key as any, value as string);
        });
    };

    // Prepare KPIs
    const kpiItems = data.kpis ? [
        {
            title: "Total Revenue",
            value: data.kpis.total_revenue,
            type: "currency" as const,
            icon: "cash-outline",
            color: colors.primary[600],
        },
        {
            title: "Net Cash Flow",
            value: data.kpis.net_cash_flow,
            type: "currency" as const,
            icon: "swap-vertical-outline",
            color: colors.semantic.success,
            trend: 0, // Mock trend since not present in unified
            isPositive: data.kpis.net_cash_flow >= 0,
        },
        {
            title: "Collections",
            value: data.kpis.total_collections,
            type: "currency" as const,
            icon: "wallet-outline",
            color: colors.semantic.info,
        },
        {
            title: "Total Expenses",
            value: data.kpis.total_expenses,
            type: "currency" as const,
            icon: "trending-down-outline",
            color: colors.semantic.error,
        }
    ] : [];

    return (
        <View style={styles.container}>
            <TopHeader
                title="Financial Analytics"
                rightAction={
                    <TouchableOpacity
                        style={{ padding: spacing.xs }}
                        onPress={() => setIsFilterModalVisible(true)}
                    >
                        <Ionicons name="filter-outline" size={24} color={colors.neutral[700]} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[colors.primary[600]]} />
                }
            >
                {/* 1. Core KPIs */}
                {kpiItems.length > 0 && (
                    <KPIGrid>
                        <KPIRow>
                            <KPICard {...kpiItems[0]} value={formatCurrency(kpiItems[0].value)} />
                            <KPICard {...kpiItems[1]} value={formatCurrency(kpiItems[1].value)} />
                        </KPIRow>
                        <KPIRow>
                            <KPICard {...kpiItems[2]} value={formatCurrency(kpiItems[2].value)} />
                            <KPICard {...kpiItems[3]} value={formatCurrency(kpiItems[3].value)} />
                        </KPIRow>
                    </KPIGrid>
                )}

                {/* 2. Cash Flow Trends */}
                {data.cash_flow && <CashFlowAnalysis data={data.cash_flow} />}

                {/* 3. Bank Account Performance */}
                {data.bank_performance && <BankAccountAnalysis data={data.bank_performance} />}

                {/* 4. ISP Payment Analytics */}
                {data.isp_payments && <ISPPaymentAnalysis data={data.isp_payments} />}
            </ScrollView>

            <UnifiedFinancialFilterModal
                visible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                filters={filters}
                onApply={handleApplyFilters}
                bankAccounts={data.bank_accounts || []}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing['4xl'],
    },
    centerOuter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    }
});
