import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { colors, spacing } from '../../../theme';
import { TopHeader } from '../../../components/navigation/TopHeader';
import { EmptyState } from '../../../components/data/EmptyState';
import { DashboardSkeleton } from '../components/DashboardSkeleton';

import { useServicePlanAnalyticsStore } from '../stores/useServicePlanAnalytics.store';
import { useServicePlanAnalytics } from '../hooks/useServicePlanAnalytics';

import { ServicePlanKPIGrid } from '../components/ServicePlanKPIGrid';
import { ServicePlanCharts } from '../components/ServicePlanCharts';
import { ServicePlanPerformanceList } from '../components/ServicePlanPerformanceList';
import { ServicePlanFilterModal } from '../components/ServicePlanFilterModal';

export const ServicePlanAnalyticsScreen: React.FC = () => {
    const navigation = useNavigation<DrawerNavigationProp<any>>();

    const filters = useServicePlanAnalyticsStore(state => state.filters);
    const setFilters = useServicePlanAnalyticsStore(state => state.setFilters);

    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const {
        data,
        isLoading,
        error,
        refetch,
        isFetching
    } = useServicePlanAnalytics(filters);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const activeFilterCount = (filters.planIds.length > 0 ? 1 : 0) + (filters.timeRange !== 'mtd' ? 1 : 0);

    const renderContent = () => {
        if (isLoading && !data) {
            return (
                <View style={styles.stateContainer}>
                    <DashboardSkeleton />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.stateContainer}>
                    <EmptyState
                        icon="alert-circle-outline"
                        title="Failed to load Service Plans"
                        subtitle={error instanceof Error ? error.message : "An unexpected API error occurred."}
                        actionLabel="Try Again"
                        onActionPress={() => refetch()}
                    />
                </View>
            );
        }

        if (!data) {
            return (
                <View style={styles.stateContainer}>
                    <EmptyState
                        icon="cube-outline"
                        title="No Plans Available"
                        subtitle="We couldn't find any plan metrics for the selected parameters."
                        actionLabel="Clear Filters"
                        onActionPress={() => useServicePlanAnalyticsStore.getState().resetFilters()}
                    />
                </View>
            );
        }

        return (
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching && !isLoading}
                        onRefresh={onRefresh}
                        colors={[colors.primary[500]]}
                    />
                }
            >
                <ServicePlanKPIGrid data={data.kpis} />
                <ServicePlanCharts data={data.charts} />
                <ServicePlanPerformanceList data={data.tables?.plan_performance} />
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <TopHeader
                title="Service Plans"
                rightAction={
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => refetch()}
                        >
                            <Ionicons name="refresh-outline" size={20} color={colors.neutral[700]} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setFilterModalVisible(true)}
                        >
                            <Ionicons name="filter-outline" size={20} color={colors.neutral[700]} />
                            {activeFilterCount > 0 && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                }
            />
            {renderContent()}

            {data?.filters && (
                <ServicePlanFilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    currentFilters={filters}
                    onApply={(newFilters) => setFilters(newFilters)}
                    metadata={data.filters}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[100],
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl * 2,
    },
    stateContainer: {
        flex: 1,
        padding: spacing.lg,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    headerButton: {
        padding: spacing.sm,
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: colors.semantic.error,
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.neutral[50],
    },
    filterBadgeText: {
        color: colors.neutral[50], // Map to white equivalent
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 3,
    }
});
