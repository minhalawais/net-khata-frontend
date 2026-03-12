import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius, shadows } from '../../../theme';

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - (spacing.lg * 2) - (spacing.lg * 2); // Screen padding + Card padding

const chartConfig = {
    backgroundColor: colors.surface.card,
    backgroundGradientFrom: colors.surface.card,
    backgroundGradientTo: colors.surface.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // primary[600]
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // neutral[500]
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: colors.primary[600]
    }
};

interface ChartsProps {
    revenueTrend: any[];
    customerGrowth: any[];
    paymentMethods: any[];
    topAreas: any[];
}

export const DashboardCharts: React.FC<ChartsProps> = ({
    revenueTrend,
    customerGrowth,
    paymentMethods,
    topAreas
}) => {
    // Transform Data for react-native-chart-kit
    const revLabels = revenueTrend?.map(d => d.month_short) || [];
    const revCollected = revenueTrend?.map(d => d.collected) || [];

    const custLabels = customerGrowth?.map(d => d.month_short) || [];
    const custTotal = customerGrowth?.map(d => d.total) || [];

    const pieColors = [colors.primary[600], colors.semantic.success, colors.semantic.warning, colors.semantic.error, colors.semantic.info];
    const pieData = paymentMethods?.map((d, index) => ({
        name: d.method,
        population: d.amount,
        color: pieColors[index % pieColors.length],
        legendFontColor: colors.neutral[700],
        legendFontSize: 11
    })) || [];

    return (
        <View style={styles.container}>
            {/* Revenue Trend */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Revenue Collection</Text>
                {revenueTrend && revenueTrend.length > 0 ? (
                    <LineChart
                        data={{
                            labels: revLabels,
                            datasets: [{
                                data: revCollected
                            }]
                        }}
                        width={chartWidth}
                        height={220}
                        yAxisLabel="Rs "
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        formatYLabel={(yValue) => parseInt(yValue) >= 1000 ? `${(parseInt(yValue) / 1000).toFixed(0)}k` : yValue}
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No Revenue Data</Text></View>
                )}
            </View>

            {/* Customer Growth */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Active Customers</Text>
                {customerGrowth && customerGrowth.length > 0 ? (
                    <BarChart
                        data={{
                            labels: custLabels,
                            datasets: [{
                                data: custTotal
                            }]
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
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No Customer Data</Text></View>
                )}
            </View>

            {/* Payment Methods */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Payment Methods</Text>
                {pieData && pieData.length > 0 ? (
                    <PieChart
                        data={pieData}
                        width={chartWidth}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <View style={styles.emptyChart}><Text style={styles.emptyText}>No Payment Data</Text></View>
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
