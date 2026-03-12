import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { ServiceSupportData } from '../types';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../../theme';

interface SupportAnalyticsChartsProps {
    charts: ServiceSupportData['charts'];
}

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - spacing.lg * 4;

const chartConfig = {
    backgroundColor: colors.surface.card,
    backgroundGradientFrom: colors.surface.card,
    backgroundGradientTo: colors.surface.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
        borderRadius: borderRadius.md,
    },
    propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: colors.primary[600]
    },
    useShadowColorFromDataset: false,
};

export const SupportAnalyticsCharts = ({ charts }: SupportAnalyticsChartsProps) => {

    // Formatting Data for react-native-chart-kit LineChart
    const trendData = {
        labels: charts.complaint_trend.map(d => d.week),
        datasets: [
            {
                data: charts.complaint_trend.map(d => d.new),
                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Warning - New
                strokeWidth: 2,
            },
            {
                data: charts.complaint_trend.map(d => d.resolved),
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Success - Resolved
                strokeWidth: 2,
            }
        ],
        legend: ["New", "Resolved"]
    };

    // Formatting Data for PieChart
    const statusColors: Record<string, string> = {
        open: colors.semantic.warning,
        in_progress: colors.semantic.info,
        resolved: colors.semantic.success,
        closed: colors.neutral[500]
    };

    const pieData = charts.status_distribution.map((item, index) => ({
        name: item.status,
        population: item.count,
        color: statusColors[item.status] || colors.primary[400 + (index * 100)] || colors.primary[500],
        legendFontColor: colors.neutral[700],
        legendFontSize: 12
    }));

    // Formatting Data for BarChart (Resolution Time)
    const resolutionBarData = {
        labels: charts.resolution_time.map(d => d.bucket),
        datasets: [
            {
                data: charts.resolution_time.map(d => d.count),
            }
        ]
    };

    return (
        <View style={styles.container}>
            {/* Complaint Trend */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Complaint Trend</Text>
                {charts.complaint_trend.length > 0 ? (
                    <LineChart
                        data={trendData}
                        width={chartWidth}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chartStyle}
                        withInnerLines={false}
                        withOuterLines={true}
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No trend data available</Text></View>
                )}
            </View>

            {/* Status Distribution */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Status Distribution</Text>
                {charts.status_distribution.length > 0 ? (
                    <PieChart
                        data={pieData}
                        width={chartWidth}
                        height={220}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"0"}
                        center={[10, 0]}
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No status data available</Text></View>
                )}
            </View>

            {/* Resolution Time Distribution */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Resolution Time</Text>
                {charts.resolution_time.length > 0 ? (
                    <BarChart
                        data={resolutionBarData}
                        width={chartWidth}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Info Color
                            fillShadowGradientFrom: colors.semantic.info,
                            fillShadowGradientFromOpacity: 0.8,
                            fillShadowGradientTo: colors.semantic.info,
                            fillShadowGradientToOpacity: 0.8,
                        }}
                        style={styles.chartStyle}
                        showBarTops={false}
                        withInnerLines={false}
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No resolution data available</Text></View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
    chartCard: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        ...shadows.sm,
    },
    chartTitle: {
        ...textStyles.cardTitle,
        marginBottom: spacing.lg,
    },
    chartStyle: {
        marginVertical: spacing.sm,
        borderRadius: borderRadius.md,
        marginLeft: -spacing.md,
    },
    emptyChart: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        ...textStyles.bodySmall,
    }
});
