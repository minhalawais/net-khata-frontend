import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius, shadows } from '../../../theme';

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - (spacing.lg * 2) - (spacing.lg * 2);

const chartConfig = {
    backgroundColor: colors.surface.card,
    backgroundGradientFrom: colors.surface.card,
    backgroundGradientTo: colors.surface.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: colors.primary[600]
    }
};

const CHART_PIE_COLORS = [
    colors.primary[600],
    colors.semantic.success,
    colors.semantic.warning,
    colors.semantic.error,
    colors.semantic.info,
    colors.semantic.info
];

interface CustomerAnalyticsChartsProps {
    customerGrowth: any[];
    servicePlanPopularity: any[];
    connectionTypes: any[];
    ispDistribution: any[];
    tenureDistribution: any[];
}

export const CustomerAnalyticsCharts: React.FC<CustomerAnalyticsChartsProps> = ({
    customerGrowth = [],
    servicePlanPopularity = [],
    connectionTypes = [],
    ispDistribution = [],
    tenureDistribution = []
}) => {
    // Transform Customer Growth (Net / Total logic via Line instead of huge ComposedChart)
    const growthLabels = (customerGrowth || []).map(d => d?.month_short || '');
    const growthTotal = (customerGrowth || []).map(d => d?.total || 0);

    // Connection Types Pie
    const connectionData = (connectionTypes || []).map((d, i) => ({
        name: d?.type || 'Unknown',
        population: d?.count || 0,
        color: CHART_PIE_COLORS[i % CHART_PIE_COLORS.length],
        legendFontColor: colors.neutral[700],
        legendFontSize: 11
    })).filter(d => d.population > 0);

    // ISP Distribution Pie
    const ispData = (ispDistribution || []).map((d, i) => ({
        name: d?.name || 'Unknown',
        population: d?.customers || 0,
        color: CHART_PIE_COLORS[i % CHART_PIE_COLORS.length],
        legendFontColor: colors.neutral[700],
        legendFontSize: 11
    })).filter(d => d.population > 0);

    // Service Plan Popularity Bar
    const planLabels = (servicePlanPopularity || []).slice(0, 5).map(d => (d?.name || '').substring(0, 8));
    const planValues = (servicePlanPopularity || []).slice(0, 5).map(d => d?.subscribers || 0);

    // Tenure Bar
    const tenureLabels = (tenureDistribution || []).map(d => (d?.tenure || '').replace(' Months', 'm').replace(' Years', 'y'));
    const tenureValues = (tenureDistribution || []).map(d => d?.count || 0);

    return (
        <View style={styles.container}>
            {/* Customer Net Growth Line */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Total Active Trend</Text>
                {growthTotal.length > 0 ? (
                    <LineChart
                        data={{
                            labels: growthLabels,
                            datasets: [{ data: growthTotal }]
                        }}
                        width={chartWidth}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No Growth Data</Text></View>
                )}
            </View>

            {/* Connection Types Pie */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Connection Types</Text>
                {connectionData.length > 0 ? (
                    <PieChart
                        data={connectionData}
                        width={chartWidth}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No Connection Data</Text></View>
                )}
            </View>

            {/* ISP Distribution Pie */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>ISP Distribution</Text>
                {ispData.length > 0 ? (
                    <PieChart
                        data={ispData}
                        width={chartWidth}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No ISP Data</Text></View>
                )}
            </View>

            {/* Service Plan Popularity Bar */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Top 5 Plans</Text>
                {planValues.length > 0 ? (
                    <BarChart
                        data={{
                            labels: planLabels,
                            datasets: [{ data: planValues }]
                        }}
                        width={chartWidth}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // success
                        }}
                        style={styles.chart}
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No Plan Data</Text></View>
                )}
            </View>

            {/* Tenure Distribution Bar */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Customer Tenure</Text>
                {tenureValues.length > 0 ? (
                    <BarChart
                        data={{
                            labels: tenureLabels,
                            datasets: [{ data: tenureValues }]
                        }}
                        width={chartWidth}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, // semantic.indigo
                        }}
                        style={styles.chart}
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No Tenure Data</Text></View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing['2xl'],
        marginBottom: spacing['2xl'],
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
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: spacing.lg,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    emptyChart: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: colors.neutral[400],
        fontSize: 14,
    }
});
