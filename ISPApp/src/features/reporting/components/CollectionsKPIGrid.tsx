import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { CollectionsAnalyticsData } from '../types';
import { KPICard } from './KPICard';
import { colors, spacing } from '../../../theme';

interface CollectionsKPIGridProps {
    metrics: CollectionsAnalyticsData['metrics'];
}

// Ensure cards fill equal responsive width natively
const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

export const CollectionsKPIGrid: React.FC<CollectionsKPIGridProps> = ({ metrics }) => {
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `Rs ${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(1)}k`;
        return `Rs ${amount.toLocaleString()}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.gridRow}>
                <KPICard
                    title="Total Recovered"
                    value={formatCurrency(metrics.totalRecovered || 0)}
                    icon="cash-outline"
                    color={colors.semantic.success}
                />
                <KPICard
                    title="Total Outstanding"
                    value={formatCurrency(metrics.totalOutstanding || 0)}
                    icon="alert-circle-outline"
                    color={colors.semantic.warning}
                />
            </View>
            <View style={styles.gridRow}>
                <KPICard
                    title="Recovery Rate"
                    value={`${(metrics.recoveryRate || 0).toFixed(1)}%`}
                    icon="pie-chart-outline"
                    color={colors.primary[500]}
                />
                <KPICard
                    title="Avg Collection Time"
                    value={`${metrics.avgCollectionTime || 0} days`}
                    icon="time-outline"
                    color={colors.secondary[500]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        gap: spacing.md,
    }
});
