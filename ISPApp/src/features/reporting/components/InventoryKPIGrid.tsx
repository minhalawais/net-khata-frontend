import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { InventoryAnalyticsData } from '../types';
import { KPICard } from './KPICard';
import { colors, spacing } from '../../../theme';

interface InventoryKPIGridProps {
    data: InventoryAnalyticsData['kpis'];
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

export const InventoryKPIGrid: React.FC<InventoryKPIGridProps> = ({ data }) => {
    return (
        <View style={styles.container}>
            {/* Row 1 */}
            <View style={styles.row}>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Total Items"
                        value={data.total_items.value.toLocaleString()}
                        icon="cube-outline"
                        color={colors.primary[600]}
                    />
                </View>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Total Value"
                        value={data.total_value.value.toLocaleString()}
                        icon="cash-outline"
                        color={colors.semantic.success}
                    />
                </View>
            </View>

            {/* Row 2 */}
            <View style={styles.row}>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="In Stock"
                        value={data.in_stock.value.toLocaleString()}
                        icon="archive-outline"
                        color={colors.semantic.info}
                    />
                </View>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Assigned"
                        value={data.assigned.value.toLocaleString()}
                        icon="person-add-outline"
                        color={colors.semantic.warning}
                    />
                </View>
            </View>

            {/* Row 3 - Alerts & Turnover */}
            <View style={styles.row}>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Low Stock Alerts"
                        value={data.low_stock.value.toString()}
                        icon="alert-circle-outline"
                        color={data.low_stock.value > 0 ? colors.semantic.error : colors.semantic.success}
                    />
                </View>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Turnover Rate"
                        value={`${data.turnover_rate.value}x`}
                        icon="sync-outline"
                        color={colors.semantic.info}
                    />
                </View>
            </View>

            {/* Row 4 - Assignment & Returns */}
            <View style={styles.row}>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Avg Assignment"
                        value={`${data.avg_assignment_days.value}d`}
                        icon="time-outline"
                        color={colors.primary[500]}
                    />
                </View>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Returns"
                        value={data.returns.value.toString()}
                        icon="return-down-back-outline"
                        color={colors.semantic.warning}
                        trend={data.returns.trend}
                        isPositive={data.returns.is_positive}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
});
