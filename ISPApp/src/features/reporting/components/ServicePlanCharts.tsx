import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { ServicePlanAnalyticsData } from '../types';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../../theme';

interface ServicePlanChartsProps {
    data: ServicePlanAnalyticsData['charts'];
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - (spacing.md * 2) - (spacing.md * 2);

export const ServicePlanCharts: React.FC<ServicePlanChartsProps> = ({ data }) => {

    // Safety check
    if (!data.revenue_by_plan?.length && !data.subscription_trends?.length) {
        return (
            <View style={styles.chartCard}>
                <Text style={textStyles.sectionTitle}>Analytics Breakdown</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Not enough data context</Text>
                </View>
            </View>
        );
    }

    const formatCurrency = (y: string) => {
        const num = Math.round(Number(y));
        if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
        return num.toString();
    };

    const validateChartData = (dataPoints: any[], extractFn: (item: any) => number) => {
        if (!dataPoints || dataPoints.length === 0) return [0];
        const values = dataPoints.map(extractFn);
        const allZeros = values.every(v => v === 0);
        return allZeros ? [0, 0] : values;
    };

    // 1. Revenue by Plan Bar Chart (Truncated names)
    const planLabels = (data.revenue_by_plan || []).map(d => d.name.length > 8 ? d.name.substring(0, 8) + '...' : d.name);
    const planRevenue = validateChartData(data.revenue_by_plan, d => d.value);

    // 2. Subscription Trends Line Chart 
    const trendLabels = (data.subscription_trends || []).map(d => d.month.substring(0, 3));
    const trendNew = validateChartData(data.subscription_trends, d => d.new);
    const trendChurn = validateChartData(data.subscription_trends, d => d.churn);

    const chartConfig = {
        backgroundGradientFrom: colors.neutral[50],
        backgroundGradientTo: colors.neutral[50],
        color: (opacity = 1) => `rgba(137, 168, 178, ${opacity})`, // primary Base
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        strokeWidth: 2,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        barPercentage: 0.6,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
        }
    };

    return (
        <View style={styles.container}>
            {/* Revenue By Plan Bar Chart */}
            <View style={styles.chartCard}>
                <View style={styles.cardHeader}>
                    <Text style={textStyles.sectionTitle}>Revenue by Plan</Text>
                    <Text style={styles.subtitle}>Direct plan revenue stream</Text>
                </View>

                <BarChart
                    data={{
                        labels: planLabels.length > 0 ? planLabels : ['No Data'],
                        datasets: [
                            {
                                data: planRevenue
                            }
                        ]
                    }}
                    width={CHART_WIDTH}
                    height={220}
                    chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Success fill
                        propsForLabels: { fontSize: 10 }
                    }}
                    yAxisLabel=""
                    yAxisSuffix=""
                    style={styles.chart}
                    fromZero
                    withInnerLines={true}
                    segments={4}
                />
            </View>

            {/* Subscription Trends Line Chart */}
            <View style={styles.chartCard}>
                <View style={styles.cardHeader}>
                    <Text style={textStyles.sectionTitle}>Subscription Trends</Text>
                    <Text style={styles.subtitle}>New acquisitions vs churn cycles</Text>
                </View>

                <LineChart
                    data={{
                        labels: trendLabels.length > 0 ? trendLabels : ['No Data'],
                        datasets: [
                            {
                                data: trendNew,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Success
                                strokeWidth: 2
                            },
                            {
                                data: trendChurn,
                                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Error
                                strokeWidth: 2
                            }
                        ],
                        legend: ['New Subs', 'Churn']
                    }}
                    width={CHART_WIDTH}
                    height={220}
                    chartConfig={{
                        ...chartConfig,
                        propsForLabels: { fontSize: 10 }
                    }}
                    bezier
                    formatYLabel={formatCurrency}
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
