import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventoryAnalytics } from '../hooks/useInventoryAnalytics';
import { TopHeader } from '../../../components/navigation/TopHeader';
import { EmptyState } from '../../../components/data/EmptyState';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { InventoryKPIGrid } from '../components/InventoryKPIGrid';
import { InventoryCharts } from '../components/InventoryCharts';
import { LowStockList } from '../components/LowStockList';
import { RecentTransactionsList } from '../components/RecentTransactionsList';
import { InventoryFilterModal } from '../components/InventoryFilterModal';
import { colors, spacing } from '../../../theme';

export const InventoryAnalyticsScreen = () => {
    const { data, isLoading, isError, error, refetch } = useInventoryAnalytics();
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    // Trigger immediate refetch upon mount to ensure live data
    useEffect(() => {
        refetch();
    }, []);

    const renderContent = () => {
        if (isLoading && !data) {
            return (
                <View style={styles.scrollContent}>
                    <DashboardSkeleton />
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.centerContainer}>
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

        if (!data) {
            return (
                <View style={styles.centerContainer}>
                    <EmptyState
                        title="No Data Available"
                        subtitle="There is no inventory data for the selected period."
                    />
                </View>
            );
        }

        return (
            <View style={styles.scrollContent}>
                <InventoryKPIGrid data={data.kpis} />
                <InventoryCharts charts={data.charts} />
                <View style={styles.splitRow}>
                    <View style={{ flex: 1 }}>
                        <LowStockList items={data.tables.low_stock_items} />
                    </View>
                </View>
                <RecentTransactionsList transactions={data.tables.recent_transactions} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TopHeader
                title="Inventory Analytics"
                rightAction={
                    <TouchableOpacity
                        onPress={() => setFilterModalVisible(true)}
                        style={{ padding: spacing.xs, marginRight: spacing.sm, borderRadius: 8, backgroundColor: colors.neutral[50] }}
                    >
                        <Ionicons name="filter-outline" size={24} color={colors.neutral[700]} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollGrow}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && !!data}
                        onRefresh={refetch}
                        colors={[colors.primary[600]]}
                        tintColor={colors.primary[600]}
                    />
                }
            >
                {renderContent()}
            </ScrollView>

            <InventoryFilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                metadata={data?.filters}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollGrow: {
        flexGrow: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    splitRow: {
        flexDirection: 'row',
        gap: spacing.lg,
    }
});
