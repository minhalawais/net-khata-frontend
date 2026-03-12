import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { colors, spacing } from '../../../theme';
import { TopHeader } from '../../../components/navigation/TopHeader';
import { EmptyState } from '../../../components/data/EmptyState';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { CollectionsKPIGrid } from '../components/CollectionsKPIGrid';
import { CollectionsCharts } from '../components/CollectionsCharts';
import { OutstandingAgingList } from '../components/OutstandingAgingList';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { useCollectionsAnalytics } from '../hooks/useCollectionsAnalytics';

export const CollectionsAnalyticsScreen: React.FC = () => {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const [refreshing, setRefreshing] = useState(false);

    // No filters for collections, fetched as-is
    const {
        data,
        isLoading,
        error,
        refetch,
        isRefetching
    } = useCollectionsAnalytics();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const renderContent = () => {
        if (isLoading && !isRefetching && !data) {
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
                        title="Failed to load Collections Analytics"
                        subtitle={error instanceof Error ? error.message : "An unexpected API error occurred."}
                        actionLabel="Try Again"
                        onActionPress={refetch}
                    />
                </View>
            );
        }

        if (!data) {
            return (
                <View style={styles.stateContainer}>
                    <EmptyState
                        icon="document-text-outline"
                        title="No Data Available"
                        subtitle="We couldn't find any collection metrics at this time."
                        actionLabel="Refresh Data"
                        onActionPress={refetch}
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
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary[500]]}
                        tintColor={colors.primary[500]}
                    />
                }
            >
                <CollectionsKPIGrid metrics={data.metrics} />
                <CollectionsCharts data={data} />
                <OutstandingAgingList data={data.outstandingByAgeData} />
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <TopHeader
                title="Collections Analytics"
                rightAction={
                    <TouchableOpacity onPress={() => refetch()}>
                        <Ionicons name="refresh-outline" size={24} color={colors.neutral[700]} />
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
    }
});
