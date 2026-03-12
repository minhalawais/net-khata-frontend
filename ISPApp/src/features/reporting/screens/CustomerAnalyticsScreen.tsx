import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useCustomerAnalytics } from '../hooks/useCustomerAnalytics';
import { KPIGrid, KPIRow } from '../components/KPIGrid';
import { KPICard } from '../components/KPICard';
import { SegmentCard } from '../components/SegmentCard';
import { CustomerAnalyticsCharts } from '../components/CustomerAnalyticsCharts';
import { AreaPerformanceList } from '../components/AreaPerformanceList';
import { DashboardFilterModal } from '../components/DashboardFilterModal';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { Screen } from '../../../components/Screen';
import { TopHeader } from '../../../components/navigation/TopHeader';
import { EmptyState } from '../../../components/data/EmptyState';
import { colors, spacing, textStyles, borderRadius } from '../../../theme';
import { CustomerFilterState } from '../types';

type Tab = 'overview' | 'areas' | 'at-risk';

export const CustomerAnalyticsScreen: React.FC = () => {
    const { data, isLoading, error, filters, updateFilter, refresh } = useCustomerAnalytics();
    const [filterVisible, setFilterVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const handleApplyFilters = (newFilters: Partial<CustomerFilterState>) => {
        updateFilter(newFilters);
    };

    if (isLoading && !data) {
        return (
            <Screen>
                <TopHeader title="Customer Analytics" />
                <DashboardSkeleton />
            </Screen>
        );
    }

    if (error && !data) {
        return (
            <Screen>
                <TopHeader title="Customer Analytics" />
                <View style={styles.centerContainer}>
                    <EmptyState
                        icon="alert-circle-outline"
                        title="Failed to Load Data"
                        subtitle={error}
                        actionLabel="Retry Connection"
                        onActionPress={refresh}
                    />
                </View>
            </Screen>
        );
    }

    if (!data) return null;

    const { kpis, segments, charts, tables, filters: filterOptions } = data;

    // Helper functions
    const formatValue = (val: number, isCurrency = false) => {
        if (isCurrency) {
            if (val >= 1000000) return `Rs ${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `Rs ${(val / 1000).toFixed(1)}K`;
            return `Rs ${val.toLocaleString()}`;
        }
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toLocaleString();
    };

    return (
        <Screen>
            <TopHeader
                title="Customer Analytics"
                rightAction={
                    <TouchableOpacity style={{ marginRight: spacing.md }} onPress={() => setFilterVisible(true)}>
                        <Ionicons name="filter" size={22} color={colors.neutral[700]} />
                    </TouchableOpacity>
                }
            />

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                {(['overview', 'areas', 'at-risk'] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[colors.primary[600]]} />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Segments Headers - Always Visible */}
                <View style={styles.segmentsGrid}>
                    <SegmentCard style={styles.segmentCardWrapper} label={segments.new.label} count={segments.new.count} icon="person-add" color={colors.semantic.success} />
                    <SegmentCard style={styles.segmentCardWrapper} label={segments.stable.label} count={segments.stable.count} icon="checkmark-circle" color={colors.semantic.info} />
                    <SegmentCard style={styles.segmentCardWrapper} label={segments.at_risk.label} count={segments.at_risk.count} icon="alert-circle" color={colors.semantic.warning} />
                    <SegmentCard style={styles.segmentCardWrapper} label={segments.churned.label} count={segments.churned.count} icon="person-remove" color={colors.semantic.error} />
                </View>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <View>
                        <Text style={styles.sectionHeader}>Core Metrics</Text>
                        <KPIGrid>
                            <KPIRow>
                                <KPICard
                                    title="Total Customers"
                                    value={formatValue(kpis.total_customers.value)}
                                    trend={kpis.total_customers.trend}
                                    isPositive={kpis.total_customers.is_positive}
                                    icon="people"
                                    color={colors.primary[600]}
                                />
                                <KPICard
                                    title="Active Rate"
                                    value={kpis.retention_rate.value.toFixed(1)}
                                    suffix="%"
                                    trend={kpis.retention_rate.trend}
                                    isPositive={kpis.retention_rate.is_positive}
                                    icon="analytics"
                                    color={colors.semantic.success}
                                />
                            </KPIRow>
                            <KPIRow>
                                <KPICard
                                    title="ARPU"
                                    value={formatValue(kpis.arpu.value, true)}
                                    trend={kpis.arpu.trend}
                                    isPositive={kpis.arpu.is_positive}
                                    icon="cash"
                                    color={colors.semantic.info}
                                />
                                <KPICard
                                    title="Churn Rate"
                                    value={kpis.churn_rate.value.toFixed(1)}
                                    suffix="%"
                                    trend={kpis.churn_rate.trend}
                                    isPositive={kpis.churn_rate.is_positive}
                                    icon="trending-down"
                                    color={colors.semantic.error}
                                    invertTrend
                                />
                            </KPIRow>
                        </KPIGrid>

                        <Text style={[styles.sectionHeader, { marginTop: spacing['2xl'] }]}>Analytics Charts</Text>
                        <CustomerAnalyticsCharts
                            customerGrowth={charts.customer_growth}
                            servicePlanPopularity={charts.service_plan_popularity}
                            connectionTypes={charts.connection_types}
                            ispDistribution={charts.isp_distribution}
                            tenureDistribution={charts.tenure_distribution}
                        />
                    </View>
                )}

                {/* AREAS TAB */}
                {activeTab === 'areas' && (
                    <View>
                        <Text style={styles.sectionHeader}>Area Performance</Text>
                        <AreaPerformanceList data={tables.area_performance} />
                    </View>
                )}

                {/* AT-RISK TAB (Placeholder/Skeleton mapping) */}
                {activeTab === 'at-risk' && (
                    <View>
                        <Text style={styles.sectionHeader}>At-Risk Customers</Text>
                        <View style={styles.emptyCardWrapper}>
                            {/* Reusing EmptyState to signify this table is coming in Phase X if At-Risk specific list wasn't explicitly modeled in Phase 1.1 layout standards yet. We'll map it simple for now */}
                            {tables.at_risk_customers.length === 0 ? (
                                <EmptyState icon="shield-checkmark-outline" title="Zero At-Risk Customers" subtitle="Your retention rate is flawless right now." />
                            ) : (
                                <Text style={styles.devNote}>List implementation using Card Anatomy for At-Risk coming shortly.</Text>
                            )}
                        </View>
                    </View>
                )}

            </ScrollView>

            <DashboardFilterModal
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                filters={filters as any} // Reusing the same modal, cast acceptable as keys match loosely. If strict, extend modal.
                onApply={handleApplyFilters as any}
                options={{
                    areas: filterOptions?.areas || [],
                    isps: filterOptions?.isps || []
                }}
            />
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.xs,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: colors.primary[600],
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.neutral[500],
    },
    tabTextActive: {
        color: colors.primary[600],
        fontWeight: '600',
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing['4xl'],
    },
    sectionHeader: {
        ...textStyles.sectionTitle,
        color: colors.neutral[800],
        marginBottom: spacing.md,
    },
    segmentsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    segmentCardWrapper: {
        width: '47%',
    },
    // Force children to take approx 48% width accounting for gap
    emptyCardWrapper: {
        paddingVertical: spacing['2xl'],
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200]
    },
    devNote: {
        padding: spacing.xl,
        textAlign: 'center',
        color: colors.neutral[400],
        fontStyle: 'italic'
    }
});
