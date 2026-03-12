import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { ServicePlanAnalyticsData } from '../types';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../../theme';

interface ServicePlanPerformanceListProps {
    data: ServicePlanAnalyticsData['tables']['plan_performance'];
}

export const ServicePlanPerformanceList: React.FC<ServicePlanPerformanceListProps> = ({ data }) => {

    // Safety check
    if (!data || data.length === 0) return null;

    const formatCurrency = (amount: number) => {
        return `Rs ${amount.toLocaleString()}`;
    };

    const renderItem = ({ item }: { item: ServicePlanPerformanceListProps['data'][0] }) => {
        const isHighChurn = item.churn_rate > 5;

        return (
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Text style={styles.planName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: isHighChurn ? colors.semantic.error + '15' : colors.semantic.success + '15' }]}>
                        <Text style={[styles.badgeText, { color: isHighChurn ? colors.semantic.error : colors.semantic.success }]}>
                            {item.churn_rate}% Churn
                        </Text>
                    </View>
                </View>

                <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Price</Text>
                        <Text style={styles.metricValue}>{formatCurrency(item.price)}</Text>
                    </View>
                    <View style={[styles.metricItem, styles.centerMetric]}>
                        <Text style={styles.metricLabel}>Subscribers</Text>
                        <Text style={styles.metricValue}>{item.subscribers.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.metricItem, styles.rightMetric]}>
                        <Text style={styles.metricLabel}>Revenue</Text>
                        <Text style={[styles.metricValue, { color: colors.semantic.success }]}>
                            {formatCurrency(item.revenue)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={textStyles.sectionTitle}>Performance Matrix</Text>
                <Text style={styles.subtitle}>
                    Detailed overview of individual service plan metrics
                </Text>
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                scrollEnabled={false} // Since this is placed inside a ScrollView parent
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
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
    separator: {
        height: spacing.sm,
    },
    card: {
        backgroundColor: colors.neutral[50], // surface.card equivalent
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    planName: {
        ...textStyles.cardTitle,
        color: colors.neutral[900],
        flex: 1,
        marginRight: spacing.sm,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        ...textStyles.badge,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        padding: spacing.sm,
        borderRadius: borderRadius.md,
    },
    metricItem: {
        flex: 1,
    },
    centerMetric: {
        alignItems: 'center',
    },
    rightMetric: {
        alignItems: 'flex-end',
    },
    metricLabel: {
        ...textStyles.label,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    metricValue: {
        ...textStyles.body,
        fontWeight: '700',
        color: colors.neutral[800],
    }
});
