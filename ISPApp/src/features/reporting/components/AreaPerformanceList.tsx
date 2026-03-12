import React from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { EmptyState } from '../../../components/data/EmptyState';

interface AreaPerformaceRow {
    area: string;
    total_customers: number;
    active_customers: number;
    revenue: number;
    arpu: number;
    collection_rate: number;
    satisfaction: number;
}

interface AreaPerformanceListProps {
    data: AreaPerformaceRow[];
}

export const AreaPerformanceList: React.FC<AreaPerformanceListProps> = ({ data }) => {

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `Rs ${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `Rs ${(val / 1000).toFixed(1)}K`;
        return `Rs ${val.toLocaleString()}`;
    };

    const renderItem: ListRenderItem<AreaPerformaceRow> = ({ item, index }) => (
        <View style={styles.card}>
            {/* Header: Rank + Name + Collection Badge */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <Text style={styles.areaTitle} numberOfLines={1}>{item.area}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    (item.collection_rate || 0) >= 90 ? styles.statusSuccess :
                        (item.collection_rate || 0) >= 75 ? styles.statusWarning : styles.statusError
                ]}>
                    <Text style={[
                        styles.statusText,
                        (item.collection_rate || 0) >= 90 ? styles.statusTextSuccess :
                            (item.collection_rate || 0) >= 75 ? styles.statusTextWarning : styles.statusTextError
                    ]}>
                        {(item.collection_rate || 0).toFixed(1)}% Col.
                    </Text>
                </View>
            </View>

            {/* Metrics 2x2 Grid */}
            <View style={styles.metricsGrid}>
                <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Active / Total</Text>
                    <Text style={styles.metricValue}>{item.active_customers} <Text style={styles.metricSubValue}>/ {item.total_customers}</Text></Text>
                </View>
                <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Revenue</Text>
                    <Text style={styles.metricValue}>{formatCurrency(item.revenue || 0)}</Text>
                </View>
                <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>ARPU</Text>
                    <Text style={styles.metricValue}>{formatCurrency(item.arpu || 0)}</Text>
                </View>
                <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Satisfaction</Text>
                    <View style={styles.satisfactionRow}>
                        <Ionicons name="star" size={14} color={colors.semantic.warning} />
                        <Text style={styles.metricValue}>{(item.satisfaction || 0).toFixed(1)}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <FlatList
            data={data}
            keyExtractor={(item, index) => `${item.area}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Assuming it sits inside a master ScrollView
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
    );
};

const styles = StyleSheet.create({
    listContainer: {
        gap: spacing.md,
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
    areaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[900],
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    statusSuccess: { backgroundColor: colors.semantic.successLight },
    statusWarning: { backgroundColor: colors.semantic.warningLight },
    statusError: { backgroundColor: colors.semantic.errorLight },
    statusText: { fontSize: 12, fontWeight: '600' },
    statusTextSuccess: { color: colors.semantic.successDark },
    statusTextWarning: { color: colors.semantic.warningDark },
    statusTextError: { color: colors.semantic.errorDark },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    metricBlock: {
        width: '47%', // roughly half minus gap
    },
    metricLabel: {
        fontSize: 12,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    metricSubValue: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.neutral[400],
    },
    satisfactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    emptyWrapper: {
        paddingVertical: spacing['2xl'],
    }
});
