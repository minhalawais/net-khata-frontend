import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { RegionalAnalyticsData } from '../types';
import { colors, spacing, borderRadius, textStyles } from '../../../theme';

interface RegionalChartsProps {
    data: RegionalAnalyticsData['charts'];
}

const { width } = Dimensions.get('window');

// Generic Fallback when we don't have enough data
const EmptyChartFallback = ({ message }: { message: string }) => (
    <View style={styles.emptyChartContainer}>
        <Text style={styles.emptyChartText}>{message}</Text>
    </View>
);

export const RegionalCharts: React.FC<RegionalChartsProps> = ({ data }) => {
    const chartWidth = width - spacing.lg * 2 - spacing.lg * 2; // Screen width - Screen Pad - Card Pad

    const chartConfig = {
        backgroundColor: colors.surface.card,
        backgroundGradientFrom: colors.surface.card,
        backgroundGradientTo: colors.surface.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => colors.neutral[500],
        style: {
            borderRadius: borderRadius.lg,
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
        },
    };

    // 1. Revenue by Area (Top 5 Areas to fit screen, sorted)
    const sortedRevenue = [...(data.revenue_by_area || [])].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const revenueLabels = sortedRevenue.map(a => a.area.length > 8 ? a.area.substring(0, 8) + '...' : a.area);
    const revenueValues = sortedRevenue.map(a => a.revenue / 1000); // Plotting in thousands "k"

    // 2. Growth Trends Data Prep
    const growthLabels = data.growth_trends && data.growth_trends.length > 0 ? data.growth_trends.map(dt => dt.month.substring(0, 3)) : [];
    // Extract series keys (exclude 'month')
    const growthKeys = data.growth_trends && data.growth_trends.length > 0
        ? Object.keys(data.growth_trends[0]).filter(k => k !== 'month').slice(0, 3) // Max 3 lines to avoid clutter
        : [];

    const lineColors = [
        (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
        (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
        (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Orange
    ];

    const growthDatasets = growthKeys.map((key, index) => ({
        data: data.growth_trends.map(t => typeof t[key] === 'number' ? t[key] : 0),
        color: lineColors[index % lineColors.length],
        strokeWidth: 2,
    }));

    // 3. Service Distribution Pie
    const pieColors = [
        colors.primary[500],
        colors.semantic.success,
        colors.semantic.warning,
        colors.semantic.error,
        colors.secondary[500],
    ];

    const pieData = (data.service_distribution || []).map((item, index) => ({
        name: item.name,
        population: item.value,
        color: pieColors[index % pieColors.length],
        legendFontColor: colors.neutral[700],
        legendFontSize: 11
    }));

    // 4. Complaint Hotspots
    const sortedComplaints = [...(data.complaint_hotspots || [])].sort((a, b) => b.complaints - a.complaints).slice(0, 5);
    const complaintLabels = sortedComplaints.map(a => a.area.length > 8 ? a.area.substring(0, 8) + '...' : a.area);
    const complaintValues = sortedComplaints.map(a => a.complaints);

    return (
        <View style={styles.container}>
            {/* Revenue by Area Bar Chart */}
            <View style={styles.chartCard}>
                <Text style={textStyles.sectionTitle}>Top Areas by Revenue (PKR '000s)</Text>
                {revenueValues.length > 0 ? (
                    <BarChart
                        data={{
                            labels: revenueLabels,
                            datasets: [{ data: revenueValues }]
                        }}
                        width={chartWidth}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="k"
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(137, 168, 178, ${opacity})`, // colors.primary[500] approx
                        }}
                        style={styles.chart}
                        showValuesOnTopOfBars={true}
                        withInnerLines={false}
                    />
                ) : (
                    <EmptyChartFallback message="Not enough data for Revenue by Area" />
                )}
            </View>

            {/* Growth Trends Line Chart */}
            <View style={styles.chartCard}>
                <Text style={textStyles.sectionTitle}>New Connections Trend</Text>
                {growthLabels.length > 1 && growthDatasets.length > 0 ? (
                    <LineChart
                        data={{
                            labels: growthLabels,
                            datasets: growthDatasets,
                            legend: growthKeys.map(k => k.length > 8 ? k.substring(0, 8) + '...' : k)
                        }}
                        width={chartWidth}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withInnerLines={false}
                        withOuterLines={false}
                    />
                ) : (
                    <EmptyChartFallback message="Not enough trend data" />
                )}
            </View>

            {/* Service Popularity Pie Chart */}
            <View style={styles.chartCard}>
                <Text style={textStyles.sectionTitle}>Service Plan Popularity</Text>
                {pieData.length > 0 ? (
                    <PieChart
                        data={pieData}
                        width={chartWidth}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"0"}
                        center={[10, 0]}
                        absolute
                    />
                ) : (
                    <EmptyChartFallback message="Not enough data for plan popularity" />
                )}
            </View>

            {/* Complaint Hotspots Bar Chart */}
            <View style={styles.chartCard}>
                <Text style={textStyles.sectionTitle}>Complaint Hotspots</Text>
                {complaintValues.length > 0 ? (
                    <BarChart
                        data={{
                            labels: complaintLabels,
                            datasets: [{ data: complaintValues }]
                        }}
                        width={chartWidth}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Error red
                        }}
                        style={styles.chart}
                        showValuesOnTopOfBars={true}
                        withInnerLines={false}
                    />
                ) : (
                    <EmptyChartFallback message="No complaint data recorded" />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    chartCard: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    chart: {
        marginVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignSelf: 'center',
    },
    emptyChartContainer: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
    },
    emptyChartText: {
        color: colors.neutral[400],
        fontSize: 14,
    }
});
