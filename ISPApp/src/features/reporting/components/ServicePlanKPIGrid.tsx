import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ServicePlanAnalyticsData } from '../types';
import { KPICard } from './KPICard';
import { colors, spacing } from '../../../theme';

interface ServicePlanKPIGridProps {
    data: ServicePlanAnalyticsData['kpis'];
}

export const ServicePlanKPIGrid: React.FC<ServicePlanKPIGridProps> = ({ data }) => {
    const formatCurrency = (amount: number | string) => {
        const num = Number(amount);
        if (num >= 1000000) return `Rs ${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `Rs ${(num / 1000).toFixed(1)}k`;
        return `Rs ${num.toLocaleString()}`;
    };

    const formatNumber = (amount: number | string) => {
        const num = Number(amount);
        if (num >= 10000) return `${(num / 1000).toFixed(1)}k`;
        return num.toLocaleString();
    };

    return (
        <View style={styles.container}>
            <View style={styles.gridRow}>
                <KPICard
                    title="Total Revenue"
                    value={formatCurrency(data.total_revenue.value)}
                    trend={data.total_revenue.trend}
                    isPositive={data.total_revenue.is_positive}
                    icon="cash-outline"
                    color={colors.semantic.success}
                />
                <KPICard
                    title="Active Subs"
                    value={formatNumber(data.active_subs.value)}
                    trend={data.active_subs.trend}
                    isPositive={data.active_subs.is_positive}
                    icon="people-outline"
                    color={colors.primary[500]}
                />
            </View>
            <View style={styles.gridRow}>
                <KPICard
                    title="ARPU"
                    value={formatCurrency(data.arpu.value)}
                    trend={data.arpu.trend}
                    isPositive={data.arpu.is_positive}
                    icon="layers-outline"
                    color={colors.secondary[500]}
                />
                <KPICard
                    title="New / Churn"
                    value={`${data.new_subs.value} / ${data.churn_subs.value}`}
                    trend={data.new_subs.trend}
                    isPositive={data.new_subs.is_positive}
                    icon="person-add-outline"
                    color={colors.semantic.info}
                />
            </View>
            <View style={styles.gridRow}>
                <KPICard
                    title="Retention"
                    value={`${data.retention_rate.value}%`}
                    icon="repeat-outline"
                    color={colors.semantic.info}
                />
                <KPICard
                    title="Top Plan (Volume)"
                    value={String(data.top_vol_plan.value)}
                    icon="cube-outline"
                    color={colors.primary[600]}
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
