import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { EmployeeAnalyticsData } from '../types';
import { colors, spacing, textStyles, borderRadius, shadows } from '../../../theme';

interface EmployeeChartsProps {
    charts: EmployeeAnalyticsData['charts'];
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.lg * 2 - spacing.lg * 2;

export const EmployeeCharts: React.FC<EmployeeChartsProps> = ({ charts }) => {
    const chartConfig = {
        backgroundGradientFrom: colors.surface.card,
        backgroundGradientTo: colors.surface.card,
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
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

    const pieColors = [
        colors.primary[500],
        colors.semantic.success,
        colors.semantic.warning,
        colors.semantic.error,
        colors.semantic.info,
    ];

    // 1. Productivity Trend
    const productivityLabels = charts.productivity_trend.map(d => d.month).slice(-6);
    const productivityData = charts.productivity_trend.map(d => d.tasks).slice(-6);

    // 2. Satisfaction Trend
    const satisfactionLabels = charts.satisfaction_trend.map(d => d.month).slice(-6);
    const satisfactionData = charts.satisfaction_trend.map(d => d.rating).slice(-6);

    // 3. Role Distribution (Pie)
    const roleDistributionData = charts.role_distribution.map((item, index) => ({
        name: item.role,
        population: item.count,
        color: pieColors[index % pieColors.length],
        legendFontColor: colors.neutral[700],
        legendFontSize: textStyles?.bodySmall?.fontSize || 12,
    }));

    return (
        <View style={styles.container}>
            {/* Productivity Trend */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Productivity Trend</Text>
                <Text style={textStyles.bodySmall}>Tasks Completed (6 Mo)</Text>
                {productivityData.length > 1 ? (
                    <LineChart
                        data={{
                            labels: productivityLabels,
                            datasets: [{ data: productivityData, color: () => colors.semantic.info }],
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
                ) : (
                    <View style={styles.emptyChart}>
                        <Text style={styles.emptyText}>Not enough data for trend</Text>
                    </View>
                )}
            </View>

            {/* Satisfaction Trend */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Satisfaction Trend</Text>
                <Text style={textStyles.bodySmall}>Average CSAT Rating (6 Mo)</Text>
                {satisfactionData.length > 1 ? (
                    <LineChart
                        data={{
                            labels: satisfactionLabels,
                            datasets: [{ data: satisfactionData, color: () => colors.semantic.warning }],
                        }}
                        width={CHART_WIDTH}
                        height={220}
                        chartConfig={{
                            ...chartConfig,
                            decimalPlaces: 1, // display 4.5/etc for ratings natively
                        }}
                        bezier
                        style={styles.chart}
                        withDots={true}
                        withInnerLines={false}
                        withOuterLines={false}
                        segments={5} // ratings range 0 to 5
                    />
                ) : (
                    <View style={styles.emptyChart}>
                        <Text style={styles.emptyText}>Not enough data for trend</Text>
                    </View>
                )}
            </View>

            {/* Role Distribution */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Role Distribution</Text>
                {roleDistributionData.length > 0 ? (
                    <PieChart
                        data={roleDistributionData}
                        width={CHART_WIDTH}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"0"}
                        absolute={true}
                    />
                ) : (
                    <View style={styles.emptyChart}>
                        <Text style={styles.emptyText}>No role distribution</Text>
                    </View>
                )}
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
        marginHorizontal: -spacing.sm,
    },
    emptyChart: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    emptyText: {
        color: colors.neutral[400],
        fontSize: 14,
    }
});
