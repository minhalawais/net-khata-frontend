import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { RegionalAnalyticsData } from '../types';
import { KPICard } from './KPICard';
import { colors, spacing, textStyles } from '../../../theme';

interface RegionalKPIGridProps {
    data: RegionalAnalyticsData['kpis'];
}

const { width } = Dimensions.get('window');

export const RegionalKPIGrid: React.FC<RegionalKPIGridProps> = ({ data }) => {
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `Rs ${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(1)}k`;
        return `Rs ${amount}`;
    };

    return (
        <View style={styles.container}>
            <Text style={textStyles.sectionTitle}>Financial Performance</Text>
            <View style={styles.gridRow}>
                <KPICard
                    title="Revenue (Paid)"
                    value={formatCurrency(data.total_revenue?.value || 0)}
                    icon="cash-outline"
                    color={colors.semantic.success}
                    trend={data.total_revenue?.trend}
                    isPositive={data.total_revenue?.is_positive}
                />
                <KPICard
                    title="Outstanding Dues"
                    value={formatCurrency(data.outstanding_dues?.value || 0)}
                    icon="wallet-outline"
                    color={colors.semantic.warning}
                />
            </View>
            <View style={styles.gridRow}>
                <KPICard
                    title="Collection Rate"
                    value={`${data.collection_rate?.value || 0}%`}
                    icon="pie-chart-outline"
                    color={colors.primary[500]}
                />
                <KPICard
                    title="Avg Revenue/User"
                    value={formatCurrency(data.arpu?.value || 0)}
                    icon="grid-outline"
                    color={colors.secondary[500]}
                />
            </View>

            <Text style={[textStyles.sectionTitle, { marginTop: spacing.md }]}>Operational Metrics</Text>
            <View style={styles.gridRow}>
                <KPICard
                    title="Active Users"
                    value={(data.active_users?.value || 0).toLocaleString()}
                    icon="people-outline"
                    color={colors.primary[500]}
                    trend={data.active_users?.trend}
                    isPositive={data.active_users?.is_positive}
                />
                <KPICard
                    title="New Connections"
                    value={(data.new_connections?.value || 0).toString()}
                    icon="person-add-outline"
                    color={colors.semantic.success}
                    trend={data.new_connections?.trend}
                    isPositive={data.new_connections?.is_positive}
                />
            </View>
            <View style={styles.gridRow}>
                <KPICard
                    title="Complaint Rate"
                    value={`${data.complaint_rate?.value || 0}%`}
                    icon="alert-circle-outline"
                    color={(data.complaint_rate?.value || 0) > 5 ? colors.semantic.error : colors.semantic.success}
                />
                <KPICard
                    title="Churn Rate"
                    value={`${data.churn_rate?.value || 0}%`}
                    icon="person-remove-outline"
                    color={(data.churn_rate?.value || 0) > 2 ? colors.semantic.error : colors.semantic.success}
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
