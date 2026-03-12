import React from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../../theme';
import { EmptyState } from '../../../components/data/EmptyState';
import { RegionalAnalyticsData } from '../types';

interface RegionalPerformanceListProps {
    data: RegionalAnalyticsData['tables']['area_performance'];
}

export const RegionalPerformanceList: React.FC<RegionalPerformanceListProps> = ({ data }) => {

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `Rs ${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `Rs ${(val / 1000).toFixed(1)}K`;
        return `Rs ${val.toLocaleString()}`;
    };

    const renderItem: ListRenderItem<RegionalAnalyticsData['tables']['area_performance'][0]> = ({ item, index }) => (
        <View style={styles.card}>
            {/* Header: Rank + Name + Issues Badge */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <Text style={textStyles.body} numberOfLines={1}>{item.name}</Text>
                </View>
                {item.complaints > 0 && (
                    <View style={[styles.statusBadge, styles.statusError]}>
                        <Text style={[styles.statusText, styles.statusTextError]}>
                            {item.complaints} Issues
                        </Text>
                    </View>
                )}
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
                <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Users</Text>
                    <Text style={textStyles.body}>{item.users}</Text>
                </View>
                <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Revenue</Text>
                    <Text style={[textStyles.body, { color: colors.semantic.successDark }]}>
                        {formatCurrency(item.revenue || 0)}
                    </Text>
                </View>
                <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>ARPU</Text>
                    <Text style={textStyles.body}>{formatCurrency(item.arpu || 0)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={textStyles.sectionTitle}>Area Performance</Text>
            <FlatList
                data={data}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={
                    <View style={styles.emptyWrapper}>
                        <EmptyState
                            icon="map-outline"
                            title="No Area Data"
                            subtitle="Geographical performance data is unavailable."
                        />
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    listContainer: {
        gap: spacing.md,
        marginTop: spacing.md,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        padding: spacing.lg,
        ...shadows.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.sm,
    },
    rankBadge: {
        backgroundColor: colors.neutral[100],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
    },
    rankText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.neutral[700],
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    statusError: { backgroundColor: colors.semantic.errorLight },
    statusText: { fontSize: 12, fontWeight: '600' },
    statusTextError: { color: colors.semantic.errorDark },
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricBlock: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 12,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    emptyWrapper: {
        paddingVertical: spacing.xl,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.lg,
        borderStyle: 'dashed'
    }
});
