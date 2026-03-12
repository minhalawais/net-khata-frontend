import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { colors, spacing, textStyles } from '../../../theme';
import { TopHeader } from '../../../components/navigation/TopHeader';
import { EmptyState } from '../../../components/data/EmptyState';
import { DashboardSkeleton } from '../components/DashboardSkeleton';

import { useRegionalAnalytics } from '../hooks/useRegionalAnalytics';
import { useRegionalAnalyticsStore } from '../stores/useRegionalAnalytics.store';

import { RegionalKPIGrid } from '../components/RegionalKPIGrid';
import { RegionalCharts } from '../components/RegionalCharts';
import { RegionalPerformanceList } from '../components/RegionalPerformanceList';
import { CriticalZonesList } from '../components/CriticalZonesList';
import { RegionalFilterModal } from '../components/RegionalFilterModal';
import { MainDrawerParamList } from '../../../navigation/MainNavigator';

type RegionalScreenNavigationProp = DrawerNavigationProp<MainDrawerParamList, 'RegionalAnalysis'>;

export const RegionalAnalyticsScreen: React.FC = () => {
    const navigation = useNavigation<RegionalScreenNavigationProp>();

    // Global filter state map
    const filters = useRegionalAnalyticsStore(state => state.filters);
    const setFilters = useRegionalAnalyticsStore(state => state.setFilters);

    // Modal state
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    // API Query
    const { data, isLoading, isError, error, refetch, isFetching } = useRegionalAnalytics(filters);

    const onRefresh = React.useCallback(() => {
        refetch();
    }, [refetch]);

    const activeFilterCount = (filters.areaIds.length > 0 ? 1 : 0) + (filters.planId !== 'all' ? 1 : 0);

    return (
        <View style={styles.container}>
            <TopHeader
                title="Regional Analysis"
                rightAction={
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Ionicons name="filter-outline" size={20} color={colors.neutral[700]} />
                        {activeFilterCount > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                }
            />

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
                {isLoading ? (
                    <DashboardSkeleton />
                ) : isError ? (
                    <View style={styles.centerContainer}>
                        <EmptyState
                            icon="alert-circle-outline"
                            title="Failed to load Data"
                            subtitle={error instanceof Error ? error.message : "An unexpected API error occurred."}
                            actionLabel="Try Again"
                            onActionPress={refetch}
                        />
                    </View>
                ) : !data ? (
                    <View style={styles.centerContainer}>
                        <EmptyState
                            icon="map-outline"
                            title="No Area Data Available"
                            subtitle="No analytical footprint could be found for the queried parameters."
                        />
                    </View>
                ) : (
                    <>
                        {/* KPI Grid */}
                        {data.kpis && <RegionalKPIGrid data={data.kpis} />}

                        {/* Critical Area Warnings Alert list (rendered at top if any exist) */}
                        {data.tables?.critical_zones && data.tables.critical_zones.length > 0 && (
                            <CriticalZonesList data={data.tables.critical_zones} />
                        )}

                        {/* Charts Array */}
                        {data.charts && <RegionalCharts data={data.charts} />}

                        {/* Area Performance Dense Table mapping */}
                        {data.tables?.area_performance && data.tables.area_performance.length > 0 && (
                            <RegionalPerformanceList data={data.tables.area_performance} />
                        )}
                    </>
                )}
            </ScrollView>

            {data?.filters && (
                <RegionalFilterModal
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
        padding: spacing.lg,
        paddingBottom: spacing['3xl'],
    },
    centerContainer: {
        paddingVertical: spacing['3xl'],
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButton: {
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
        borderColor: colors.white,
    },
    filterBadgeText: {
        color: colors.white,
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 3,
    }
});
