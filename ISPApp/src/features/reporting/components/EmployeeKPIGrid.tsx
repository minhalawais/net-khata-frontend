import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { EmployeeAnalyticsData } from '../types';
import { KPICard } from './KPICard';
import { colors, spacing } from '../../../theme';

interface EmployeeKPIGridProps {
    data: EmployeeAnalyticsData['kpis'];
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

export const EmployeeKPIGrid: React.FC<EmployeeKPIGridProps> = ({ data }) => {
    return (
        <View style={styles.container}>
            {/* Row 1 - Overview */}
            <View style={styles.row}>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Total Employees"
                        value={data.total_employees.value}
                        icon="people-outline"
                        color={colors.primary[600]}
                    />
                </View>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Total Salary (Mo)"
                        value={data.total_salary.value.toLocaleString()}
                        icon="briefcase-outline"
                        color={colors.semantic.info}
                    />
                </View>
            </View>

            {/* Row 2 - Financials */}
            <View style={styles.row}>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Pending Balance"
                        value={data.pending_balance.value.toLocaleString()}
                        icon="wallet-outline"
                        color={colors.semantic.warning}
                    />
                </View>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Paid This Period"
                        value={data.paid_period.value.toLocaleString()}
                        icon="cash-outline"
                        color={colors.semantic.success}
                        trend={data.paid_period.trend}
                        isPositive={data.paid_period.is_positive}
                    />
                </View>
            </View>

            {/* Row 3 - Tasks & Complaints */}
            <View style={styles.row}>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Tasks Completed"
                        value={data.tasks_completed.value.toLocaleString()}
                        icon="checkmark-circle-outline"
                        color={colors.semantic.info}
                        trend={data.tasks_completed.trend}
                        isPositive={data.tasks_completed.is_positive}
                    />
                </View>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Complaints Done"
                        value={data.complaints_resolved.value.toLocaleString()}
                        icon="shield-checkmark-outline"
                        color={colors.primary[500]}
                        trend={data.complaints_resolved.trend}
                        isPositive={data.complaints_resolved.is_positive}
                    />
                </View>
            </View>

            {/* Row 4 - CSAT & Top Performers */}
            <View style={styles.row}>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Avg Satisfaction"
                        value={`${data.avg_satisfaction.value}/5`}
                        icon="star-outline"
                        color={colors.semantic.warning}
                        trend={data.avg_satisfaction.trend}
                        isPositive={data.avg_satisfaction.is_positive}
                    />
                </View>
                <View style={{ width: CARD_WIDTH }}>
                    <KPICard
                        title="Top Performer"
                        value={data.top_performer.value.toString()} // Assuming string name comes here
                        icon="ribbon-outline"
                        color={colors.semantic.success}
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
