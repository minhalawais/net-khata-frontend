import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '../../../theme';
import { TopHeader } from '../../../components/navigation/TopHeader';
import { EmptyState } from '../../../components/data/EmptyState';
import { DashboardSkeleton } from '../components/DashboardSkeleton';

import { useOperationsAnalytics } from '../hooks/useOperationsAnalytics';
import { OperationsKPIGrid } from '../components/OperationsKPIGrid';
import { OperationsCharts } from '../components/OperationsCharts';
import { OperationsPerformanceInsights } from '../components/OperationsPerformanceInsights';

export const OperationsAnalyticsScreen: React.FC = () => {
    const navigation = useNavigation<DrawerNavigationProp<any>>();

    const {
        data,
        isLoading,
        error,
        refetch,
        isFetching
    } = useOperationsAnalytics();

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

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
                        title="Failed to load Operations Metrics"
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
                        icon="construct-outline"
                        title="No Operations Data"
                        subtitle="Operational tracking data is currently unavailable."
                        actionLabel="Refresh Data"
                        onActionPress={() => refetch()}
                    />
                </View>
            );
        }

        return (
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching && !isLoading}
                        onRefresh={onRefresh}
                        colors={[colors.primary[500]]}
                    />
                }
            >
                <OperationsKPIGrid data={data.metrics} />
                <OperationsCharts
                    networkData={data.networkPerformanceData}
                    serviceData={data.serviceRequestsData}
                />
                <OperationsPerformanceInsights
                    metrics={data.metrics}
                    serviceRequests={data.serviceRequestsData}
                />
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <TopHeader
                title="Operations"
                rightAction={
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => refetch()}
                    >
                        <Ionicons name="refresh-outline" size={20} color={colors.neutral[700]} />
                    </TouchableOpacity>
                }
            />
            {renderContent()}
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
    headerButton: {
        padding: spacing.sm,
    }
});
