import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { OperationalMetricsData, ServiceRequestData } from '../types';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../../theme';

interface OperationsPerformanceInsightsProps {
    metrics: OperationalMetricsData;
    serviceRequests: ServiceRequestData[];
}

export const OperationsPerformanceInsights: React.FC<OperationsPerformanceInsightsProps> = ({
    metrics,
    serviceRequests
}) => {

    const renderGaugeLine = (
        label: string,
        currentRaw: number | string,
        percentage: number,
        color: string,
        prefix: string = '',
        suffix: string = ''
    ) => (
        <View style={styles.gaugeContainer}>
            <View style={styles.gaugeHeader}>
                <Text style={styles.gaugeLabel}>{label}</Text>
                <Text style={styles.gaugeValue}>{prefix}{currentRaw}{suffix}</Text>
            </View>
            <View style={styles.gaugeTrack}>
                <View
                    style={[
                        styles.gaugeFill,
                        { width: `${Math.min(Math.max(percentage, 0), 100)}%`, backgroundColor: color }
                    ]}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={textStyles.sectionTitle}>Performance Insights</Text>
                <Text style={styles.subtitle}>
                    Key operational metrics and trend analysis
                </Text>
            </View>

            {/* Network Health Card */}
            <View style={styles.insightCard}>
                <View style={styles.cardTitleRow}>
                    <Ionicons name="pulse" size={20} color={colors.semantic.success} style={styles.cardIcon} />
                    <Text style={textStyles.cardTitle}>Network Health</Text>
                </View>
                {renderGaugeLine('Current Uptime', metrics.averageUptime, metrics.averageUptime, colors.semantic.success, '', '%')}
                {renderGaugeLine('Target SLA', 99.5, 95, colors.semantic.success, '', '%')}
            </View>

            {/* Response Times Card */}
            <View style={styles.insightCard}>
                <View style={styles.cardTitleRow}>
                    <Ionicons name="speedometer" size={20} color={colors.primary[500]} style={styles.cardIcon} />
                    <Text style={textStyles.cardTitle}>Response Times</Text>
                </View>
                {renderGaugeLine('Avg Latency', metrics.averageLatency, 70, colors.primary[500], '', 'ms')}
                {renderGaugeLine('Target < 30ms', 'Met', 100, colors.semantic.success)}
            </View>

            {/* Service Efficiency Card */}
            <View style={styles.insightCard}>
                <View style={styles.cardTitleRow}>
                    <Ionicons name="construct" size={20} color={colors.secondary[500]} style={styles.cardIcon} />
                    <Text style={textStyles.cardTitle}>Service Efficiency</Text>
                </View>
                {renderGaugeLine('Resolution Rate', 94.2, 94.2, colors.secondary[500], '', '%')}
                {renderGaugeLine('Avg Resolution', metrics.avgResolutionTime, 80, colors.secondary[500], '', 'hrs')}
            </View>

            {/* Breakdown Mini-Stats */}
            <View style={[styles.insightCard, styles.breakdownCard]}>
                <Text style={[textStyles.cardTitle, styles.breakdownTitle]}>Service Breakdown</Text>
                <View style={styles.breakdownGrid}>
                    {serviceRequests.map((req, index) => {
                        const percentage = (req.count / metrics.totalServiceRequests) * 100;
                        const palette = [colors.primary[500], colors.semantic.success, colors.semantic.warning, colors.semantic.error, colors.secondary[500]];
                        const dotColor = palette[index % palette.length];

                        return (
                            <View key={req.type} style={styles.breakdownItem}>
                                <View style={styles.breakdownHeader}>
                                    <View style={[styles.dot, { backgroundColor: dotColor }]} />
                                    <Text style={styles.breakdownType} numberOfLines={1}>{req.type}</Text>
                                </View>
                                <Text style={styles.breakdownCount}>{req.count}</Text>
                                <Text style={styles.breakdownPercent}>({percentage.toFixed(1)}%)</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    header: {
        marginBottom: spacing.md,
    },
    subtitle: {
        ...textStyles.bodySmall,
        color: colors.neutral[500],
        marginTop: spacing.xs,
    },
    insightCard: {
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardIcon: {
        marginRight: spacing.sm,
    },
    gaugeContainer: {
        marginBottom: spacing.sm,
    },
    gaugeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    gaugeLabel: {
        ...textStyles.label,
        color: colors.neutral[600],
    },
    gaugeValue: {
        ...textStyles.body,
        fontWeight: '700',
        color: colors.neutral[900],
    },
    gaugeTrack: {
        height: 6,
        backgroundColor: colors.neutral[200],
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    gaugeFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    breakdownCard: {
        marginTop: spacing.sm,
    },
    breakdownTitle: {
        marginBottom: spacing.md,
    },
    breakdownGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing.xs,
    },
    breakdownItem: {
        width: '33.33%',
        padding: spacing.xs,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    breakdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
        width: '100%',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.xs,
    },
    breakdownType: {
        ...textStyles.bodySmall,
        color: colors.neutral[600],
        textAlign: 'center',
        flexShrink: 1,
    },
    breakdownCount: {
        ...textStyles.body,
        fontWeight: '700',
        color: colors.neutral[900],
        marginBottom: 2,
    },
    breakdownPercent: {
        ...textStyles.bodySmall,
        color: colors.neutral[500],
    }
});
