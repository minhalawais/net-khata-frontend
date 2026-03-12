import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OperationalMetricsData } from '../types';
import { KPICard } from './KPICard';
import { colors, spacing } from '../../../theme';

interface OperationsKPIGridProps {
    data: OperationalMetricsData;
}

export const OperationsKPIGrid: React.FC<OperationsKPIGridProps> = ({ data }) => {

    if (!data) return null;

    return (
        <View style={styles.container}>
            <View style={styles.gridRow}>
                <KPICard
                    title="Average Uptime"
                    value={`${data.averageUptime}%`}
                    icon="pulse-outline"
                    color={colors.semantic.success}
                />
                <KPICard
                    title="Average Latency"
                    value={`${data.averageLatency} ms`}
                    icon="speedometer-outline"
                    color={colors.primary[500]}
                />
            </View>
            <View style={styles.gridRow}>
                <KPICard
                    title="Service Requests"
                    value={data.totalServiceRequests.toLocaleString()}
                    icon="construct-outline"
                    color={colors.secondary[500]}
                />
                <KPICard
                    title="Avg Resolution"
                    value={`${data.avgResolutionTime} hrs`}
                    icon="time-outline"
                    color={colors.semantic.warning}
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
