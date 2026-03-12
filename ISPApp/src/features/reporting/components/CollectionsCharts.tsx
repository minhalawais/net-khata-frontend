import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { CollectionsAnalyticsData } from '../types';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../../theme';

interface CollectionsChartsProps {
    data: CollectionsAnalyticsData;
}

const { width } = Dimensions.get('window');
// Padding: 16 (left/right screen) + 16 (card padding) = 32 on each side = 64 total padding
const CHART_WIDTH = width - (spacing.md * 2) - (spacing.md * 2);

export const CollectionsCharts: React.FC<CollectionsChartsProps> = ({ data }) => {

    // Safety check for empty data
    if (!data.recoveryPerformanceData?.length && !data.dailyRecoveryTrend?.length) {
        return (
            <View style={styles.chartCard}>
                <Text style={textStyles.sectionTitle}>Performance Analytics</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Not enough data to generate charts</Text>
                </View>
            </View>
        );
    }

    const validateChartData = (dataPoints: any[], extractFn: (item: any) => number) => {
        if (!dataPoints || dataPoints.length === 0) return [0];
        const values = dataPoints.map(extractFn);
        const allZeros = values.every(v => v === 0);
        return allZeros ? [0, 0] : values; // Prevent Infinity crash in chart-kit
    };

    // Formatting currency for Y-axis
    const formatYLabel = (y: string) => {
        const num = Math.round(Number(y));
        if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
        return num.toString();
    };

    // 1. Recovery Performance Line Chart (Recovered vs Outstanding)
    // Map data points
    const labels1 = data.recoveryPerformanceData?.map(d => d.month.substring(0, 3)) || [];
    const recoveredData = validateChartData(data.recoveryPerformanceData, d => d.recovered);
    const outstandingData = validateChartData(data.recoveryPerformanceData, d => d.outstanding);

    // 2. Daily Recovery Trend
    // Take fewer labels to avoid overlapping on x-axis (e.g., every 5 days depending on length)
    const trendData = data.dailyRecoveryTrend || [];
    const step = Math.max(1, Math.floor(trendData.length / 6));
    const labels2 = trendData.map((d, i) => (i % step === 0 ? d.date.substring(5) : ''));
    const recoveredDailyData = validateChartData(trendData, d => d.recovered);

    const chartConfig = {
        backgroundGradientFrom: colors.neutral[50],
        backgroundGradientTo: colors.neutral[50],
        color: (opacity = 1) => `rgba(137, 168, 178, ${opacity})`, // primary Base
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // neutral 500
        strokeWidth: 2,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
        }
    };

    return (
        <View style={styles.container}>

            {/* Recovery Performance Chart */}
            <View style={styles.chartCard}>
                <View style={styles.cardHeader}>
                    <Text style={textStyles.sectionTitle}>Recovery Performance</Text>
                    <Text style={styles.subtitle}>Monthly recovered vs outstanding amounts</Text>
                </View>

                <LineChart
                    data={{
                        labels: labels1.length > 0 ? labels1 : ['No Data'],
                        datasets: [
                            {
                                data: recoveredData,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // success
                                strokeWidth: 2
                            },
                            {
                                data: outstandingData,
                                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // warning
                                strokeWidth: 2
                            }
                        ],
                        legend: ['Recovered', 'Outstanding']
                    }}
                    width={CHART_WIDTH}
                    height={220}
                    chartConfig={{
                        ...chartConfig,
                        propsForLabels: { fontSize: 10 }
                    }}
                    bezier
                    formatYLabel={formatYLabel}
                    style={styles.chart}
                    withInnerLines={true}
                    segments={4}
                />
            </View>

            {/* Daily Recovery Trend Chart */}
            <View style={styles.chartCard}>
                <View style={styles.cardHeader}>
                    <Text style={textStyles.sectionTitle}>Daily Recovery Activity</Text>
                    <Text style={styles.subtitle}>Real-time daily collection trend (Last 30 Days)</Text>
                </View>

                <LineChart
                    data={{
                        labels: labels2.length > 0 ? labels2 : ['No Data'],
                        datasets: [
                            {
                                data: recoveredDailyData,
                                color: (opacity = 1) => `rgba(137, 168, 178, ${opacity})`, // primary
                                strokeWidth: 2
                            }
                        ]
                    }}
                    width={CHART_WIDTH}
                    height={220}
                    chartConfig={{
                        ...chartConfig,
                        propsForLabels: { fontSize: 10 }
                    }}
                    bezier
                    formatYLabel={formatYLabel}
                    style={styles.chart}
                    withInnerLines={true}
                    segments={4}
                />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing.lg,
        marginBottom: spacing.xl,
    },
    chartCard: {
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    cardHeader: {
        marginBottom: spacing.lg,
    },
    subtitle: {
        ...textStyles.bodySmall,
        color: colors.neutral[500],
        marginTop: spacing.xs,
    },
    chart: {
        marginVertical: spacing.sm,
        borderRadius: borderRadius.md,
        alignSelf: 'center',
    },
    emptyContainer: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
    },
    emptyText: {
        ...textStyles.body,
        color: colors.neutral[500],
    }
});
