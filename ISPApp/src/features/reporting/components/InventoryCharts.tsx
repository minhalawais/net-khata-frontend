import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { InventoryAnalyticsData } from '../types';
import { colors, spacing, textStyles, borderRadius, shadows } from '../../../theme';

interface InventoryChartsProps {
    charts: InventoryAnalyticsData['charts'];
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.lg * 2 - spacing.lg * 2; // screen - padding - card padding

export const InventoryCharts: React.FC<InventoryChartsProps> = ({ charts }) => {
    const chartConfig = {
        backgroundGradientFrom: colors.surface.card,
        backgroundGradientTo: colors.surface.card,
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // primary-600 logic
        labelColor: (opacity = 1) => colors.neutral[500],
        strokeWidth: 2,
        useShadowColorFromDataset: false,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: colors.white,
        },
        decimalPlaces: 0,
    };

    const chartColors = [
        colors.semantic.success,
        colors.semantic.info,
        colors.semantic.warning,
        colors.semantic.error,
        colors.primary[500],
    ];

    // 1. Movement Trend
    const movementLabels = charts.movement_trend.map(d => d.month).slice(-6); // Keep to recent 6 to avoid clutter
    const assignmentsData = charts.movement_trend.map(d => d.assignments).slice(-6);
    const returnsData = charts.movement_trend.map(d => d.returns).slice(-6);

    // 2. Value Distribution (Pie)
    const pieData = charts.value_distribution.map((item, index) => ({
        name: item.type,
        population: item.value,
        color: chartColors[index % chartColors.length],
        legendFontColor: colors.neutral[700],
        legendFontSize: textStyles?.bodySmall?.fontSize || 12,
    }));

    // 3. Assignment Status (Pie)
    const assignmentStatusData = charts.assignment_status.map((item, index) => ({
        name: item.status,
        population: item.count,
        color: index === 0 ? colors.semantic.success : index === 1 ? colors.semantic.info : colors.primary[500],
        legendFontColor: colors.neutral[700],
        legendFontSize: textStyles?.bodySmall?.fontSize || 12,
    }));

    return (
        <View style={styles.container}>
            {/* Movement Trend */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Movement Trend</Text>
                <Text style={textStyles.bodySmall}>Assignments vs Returns (6 Mo)</Text>
                <LineChart
                    data={{
                        labels: movementLabels,
                        datasets: [
                            { data: assignmentsData, color: () => colors.semantic.info },
                            { data: returnsData, color: () => colors.semantic.warning },
                        ],
                        legend: ["Assigned", "Returned"]
                    }}
                    width={CHART_WIDTH}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    withDots={true}
                    withInnerLines={false}
                    withOuterLines={false}
                />
            </View>

            {/* Value Distribution */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Value Distribution</Text>
                <PieChart
                    data={pieData}
                    width={CHART_WIDTH}
                    height={200}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"0"}
                    absolute={false} // show percentages? keeping abstract for value scale
                />
            </View>

            {/* Assignment Status */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Assignment Status</Text>
                <PieChart
                    data={assignmentStatusData}
                    width={CHART_WIDTH}
                    height={200}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"0"}
                    absolute={true} // show absolute counts
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        ...shadows.sm,
    },
    cardTitle: {
        ...textStyles.sectionTitle,
        marginBottom: spacing.xs,
    },
    chart: {
        marginTop: spacing.md,
        borderRadius: borderRadius.md,
        marginHorizontal: -spacing.sm, // Bleed chart slightly for better label alignment
    },
});
