import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles, borderRadius, shadows } from '../../../theme';
import { Screen } from '../../../components/Screen';
import { TopHeader } from '../../../components/navigation/TopHeader';
import { useExecutiveDashboard } from '../hooks/useExecutiveDashboard';
import { KPICard } from '../components/KPICard';
import { KPIGrid, KPIRow } from '../components/KPIGrid';
import { DashboardCharts } from '../components/DashboardCharts';
import { DashboardFilterModal } from '../components/DashboardFilterModal';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { EmptyState } from '../../../components/data/EmptyState';
import { FilterState } from '../types';

export const ExecutiveDashboardScreen: React.FC = () => {
    const { data, isLoading, error, filters, updateFilter, refresh } = useExecutiveDashboard();
    const [filterVisible, setFilterVisible] = useState(false);

    const handleApplyFilters = (newFilters: Partial<FilterState>) => {
        updateFilter(newFilters);
    };

    if (isLoading && !data) {
        return (
            <Screen>
                <TopHeader title="Executive Summary" />
                <DashboardSkeleton />
            </Screen>
        );
    }

    if (error && !data) {
        return (
            <Screen>
                <TopHeader title="Executive Summary" />
                <View style={styles.centerContainer}>
                    <EmptyState
                        icon="alert-circle-outline"
                        title="Failed to Load Dashboard"
                        subtitle={error}
                        actionLabel="Retry"
                        onActionPress={refresh}
                    />
                </View>
            </Screen>
        );
    }

    if (!data) return null;

    const { kpis, charts, tables, filters: filterOptions } = data;

    // Helper functions for formatting
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
                title="Executive Summary"
                rightAction={
                    <TouchableOpacity style={{ marginRight: spacing.md }} onPress={() => setFilterVisible(true)}>
                        <Ionicons name="filter" size={22} color={colors.neutral[700]} />
                    </TouchableOpacity>
                }
            />
            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[colors.primary[600]]} />
                    }
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Financial KPIs */}
                    <Text style={styles.sectionHeader}>Financial Overview</Text>
                    <KPIGrid>
                        <KPIRow>
                            <KPICard
                                title="Total Collections"
                                value={formatValue(kpis.collections.value, true)}
                                trend={kpis.collections.trend}
                                isPositive={kpis.collections.is_positive}
                                icon="cash"
                                color={colors.semantic.success}
                            />
                            <KPICard
                                title="Outstanding"
                                value={formatValue(kpis.outstanding.value, true)}
                                trend={kpis.outstanding.trend}
                                isPositive={kpis.outstanding.is_positive}
                                icon="alert-circle"
                                color={colors.semantic.warning}
                                invertTrend
                            />
                        </KPIRow>
                        <KPIRow>
                            <KPICard
                                title="Net Cash Flow"
                                value={formatValue(kpis.net_cash_flow.value, true)}
                                trend={kpis.net_cash_flow.trend}
                                isPositive={kpis.net_cash_flow.is_positive}
                                icon="trending-up"
                                color={colors.semantic.info}
                            />
                            <KPICard
                                title="Efficiency"
                                value={kpis.collection_efficiency.value.toFixed(1)}
                                suffix="%"
                                trend={kpis.collection_efficiency.trend}
                                isPositive={kpis.collection_efficiency.is_positive}
                                icon="analytics"
                                color={colors.semantic.info}
                            />
                        </KPIRow>
                    </KPIGrid>

                    {/* Customer KPIs */}
                    <Text style={styles.sectionHeader}>Customer Metrics</Text>
                    <KPIGrid>
                        <KPIRow>
                            <KPICard
                                title="Active Customers"
                                value={formatValue(kpis.active_customers.value)}
                                trend={kpis.active_customers.trend}
                                isPositive={kpis.active_customers.is_positive}
                                icon="people"
                                color={colors.primary[600]}
                            />
                            <KPICard
                                title="Growth Rate"
                                value={kpis.growth_rate.value.toFixed(1)}
                                suffix="%"
                                trend={kpis.growth_rate.trend}
                                isPositive={kpis.growth_rate.is_positive}
                                icon="cellular"
                                color={colors.semantic.info}
                            />
                        </KPIRow>
                    </KPIGrid>

                    {/* Charts */}
                    <DashboardCharts
                        revenueTrend={charts.revenue_trend}
                        customerGrowth={charts.customer_growth}
                        paymentMethods={charts.payment_methods}
                        topAreas={charts.top_areas}
                    />

                    {/* Overdue Invoices List replacing the hardcoded table */}
                    <View style={styles.listSection}>
                        <View style={styles.listHeader}>
                            <Text style={styles.listTitle}>Overdue Invoices</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{tables.overdue_invoices.length} Pending</Text>
                            </View>
                        </View>

                        {tables.overdue_invoices.length === 0 ? (
                            <View style={styles.emptyList}>
                                <Ionicons name="checkmark-circle" size={32} color={colors.semantic.success} />
                                <Text style={styles.emptyListText}>No overdue invoices!</Text>
                            </View>
                        ) : (
                            tables.overdue_invoices.slice(0, 5).map((inv, index) => (
                                <View key={inv.id || index} style={styles.listItem}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {inv.customer_name?.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.itemContent}>
                                        <Text style={styles.itemName} numberOfLines={1}>{inv.customer_name}</Text>
                                        <Text style={styles.itemSub} numberOfLines={1}>{inv.invoice_number}</Text>
                                    </View>
                                    <View style={styles.itemTrailing}>
                                        <Text style={styles.itemAmount}>{formatValue(inv.amount, true)}</Text>
                                        <View style={[
                                            styles.daysBadge,
                                            inv.days_overdue > 30 ? styles.daysBadgeRed :
                                                inv.days_overdue > 14 ? styles.daysBadgeOrange : styles.daysBadgeYellow
                                        ]}>
                                            <Text style={[
                                                styles.daysBadgeText,
                                                inv.days_overdue > 30 ? styles.daysBadgeTextRed :
                                                    inv.days_overdue > 14 ? styles.daysBadgeTextOrange : styles.daysBadgeTextYellow
                                            ]}>{inv.days_overdue}d</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                </ScrollView>

                <DashboardFilterModal
                    visible={filterVisible}
                    onClose={() => setFilterVisible(false)}
                    filters={filters}
                    onApply={handleApplyFilters}
                    options={{
                        areas: filterOptions?.areas || [],
                        isps: filterOptions?.isps || []
                    }}
                />
            </View>
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
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing['4xl'],
    },
    headerButton: {
        paddingHorizontal: spacing.md,
    },
    sectionHeader: {
        ...textStyles.sectionTitle,
        color: colors.neutral[800],
        marginBottom: spacing.md,
    },
    listSection: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        ...shadows.sm,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    badge: {
        backgroundColor: colors.semantic.errorLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.semantic.errorDark,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary[700],
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.neutral[800],
        marginBottom: 2,
    },
    itemSub: {
        fontSize: 12,
        color: colors.neutral[500],
    },
    itemTrailing: {
        alignItems: 'flex-end',
    },
    itemAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 4,
    },
    daysBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    daysBadgeRed: { backgroundColor: colors.semantic.errorLight },
    daysBadgeOrange: { backgroundColor: colors.semantic.warningLight },
    daysBadgeYellow: { backgroundColor: colors.semantic.warningLight }, // Reusing warning colors for simplicity
    daysBadgeText: { fontSize: 10, fontWeight: '600' },
    daysBadgeTextRed: { color: colors.semantic.errorDark },
    daysBadgeTextOrange: { color: colors.semantic.warningDark },
    daysBadgeTextYellow: { color: colors.semantic.warningDark },
    emptyList: {
        padding: spacing['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    emptyListText: {
        color: colors.neutral[500],
        fontSize: 14,
        fontWeight: '500',
    }
});
