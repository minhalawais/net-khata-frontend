import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useServiceSupportAnalytics } from '../hooks/useServiceSupportAnalytics';
import { ServiceSupportKPIGrid } from '../components/ServiceSupportKPIGrid';
import { SupportAnalyticsCharts } from '../components/SupportAnalyticsCharts';
import { OpenComplaintsList } from '../components/OpenComplaintsList';
import { TechnicianPerformanceList } from '../components/TechnicianPerformanceList';
import { ServiceSupportFilterModal } from '../components/ServiceSupportFilterModal';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { EmptyState } from '../../../components/data/EmptyState';
import { colors, spacing, borderRadius, textStyles } from '../../../theme';

export const ServiceSupportScreen = () => {
    const { data, isLoading, isError, error, refetch } = useServiceSupportAnalytics();
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={colors.semantic.error} />
                <Text style={styles.errorTitle}>Failed to load analytics</Text>
                <Text style={styles.errorText}>
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.centerContainer}>
                <EmptyState
                    icon="document-text-outline"
                    title="No Data Available"
                    subtitle="There is no service and support data to display for the selected period."
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header Actions */}
            <View style={styles.headerRow}>
                <Text style={styles.screenTitle}>Service & Support</Text>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons name="filter" size={20} color={colors.neutral[700]} />
                    <Text style={styles.filterText}>Filters</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={false} // Handled by React Query's internal mechanisms smoothly
                        onRefresh={refetch}
                        colors={[colors.primary[600]]}
                        tintColor={colors.primary[600]}
                    />
                }
            >
                <ServiceSupportKPIGrid kpis={data.kpis} />
                <SupportAnalyticsCharts charts={data.charts} />
                <OpenComplaintsList complaints={data.tables.open_complaints} />
                <TechnicianPerformanceList technicians={data.tables.technician_summary} />
            </ScrollView>

            <ServiceSupportFilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                filterOptions={data.filters}
            />
        </View>
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
        padding: spacing.xl,
        backgroundColor: colors.background.primary,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
        backgroundColor: colors.background.primary,
    },
    screenTitle: {
        ...textStyles.screenTitle,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface.card,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        gap: spacing.xs,
    },
    filterText: {
        ...textStyles.body,
        fontWeight: '500',
    },
    errorTitle: {
        ...textStyles.sectionTitle,
        color: colors.semantic.error,
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
    },
    errorText: {
        ...textStyles.body,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    retryButton: {
        backgroundColor: colors.primary[600],
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    retryText: {
        ...textStyles.buttonMedium,
    }
});
