import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useEmployeeAnalytics } from '../hooks/useEmployeeAnalytics';
import { TopHeader } from '../../../components/navigation/TopHeader';
import { EmptyState } from '../../../components/data/EmptyState';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { EmployeeKPIGrid } from '../components/EmployeeKPIGrid';
import { EmployeeCharts } from '../components/EmployeeCharts';
import { TopPerformersList } from '../components/TopPerformersList';
import { RecentPayoutsList } from '../components/RecentPayoutsList';
import { EmployeeFilterModal } from '../components/EmployeeFilterModal';
import { colors, spacing } from '../../../theme';

export const EmployeeAnalyticsScreen = () => {
    const { data: analyticsData, isLoading, isError, error, refetch, isFetching } = useEmployeeAnalytics();
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    // Initial mount refetch ensuring fresh state
    useEffect(() => {
        refetch();
    }, [refetch]);

    if (isLoading && !analyticsData) {
        return (
            <View style={styles.container}>
                <TopHeader title="Employee Analytics" />
                <DashboardSkeleton />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.container}>
                <TopHeader title="Employee Analytics" />
                <EmptyState
                    title="Failed to load analytics"
                    subtitle={(error as Error)?.message || 'There was a problem communicating with the server.'}
                    icon="alert-circle-outline"
                    actionLabel="Retry"
                    onActionPress={() => refetch()}
                />
            </View>
        );
    }

    if (!analyticsData) {
        return (
            <View style={styles.container}>
                <TopHeader title="Employee Analytics" />
                <EmptyState
                    title="No Data Available"
                    subtitle="There is no employee performance data for the selected period."
                    icon="bar-chart-outline"
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TopHeader
                title="Employee Analytics"
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                        colors={[colors.primary[600]]}
                    />
                }
            >
                <EmployeeKPIGrid data={analyticsData.kpis} />

                <View style={styles.spacer} />
                <EmployeeCharts charts={analyticsData.charts} />

                <View style={styles.spacer} />
                <TopPerformersList performers={analyticsData.tables.top_performers} />

                <View style={styles.spacer} />
                <RecentPayoutsList payouts={analyticsData.tables.recent_payouts} />

                {/* Bottom Padding */}
                <View style={{ height: spacing['4xl'] }} />
            </ScrollView>

            <EmployeeFilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                availableRoles={analyticsData.filters?.roles || []}
                availableStatuses={analyticsData.filters?.statuses || []}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
    },
    spacer: {
        height: spacing.xl,
    },
});
