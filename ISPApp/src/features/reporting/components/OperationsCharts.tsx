import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { NetworkPerformanceData, ServiceRequestData } from '../types';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../../theme';

interface OperationsChartsProps {
    networkData: NetworkPerformanceData[];
    serviceData: ServiceRequestData[];
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - (spacing.md * 2) - (spacing.md * 2);

export const OperationsCharts: React.FC<OperationsChartsProps> = ({ networkData, serviceData }) => {

    const chartConfig = {
        backgroundGradientFrom: colors.neutral[50],
        backgroundGradientTo: colors.neutral[50],
        color: (opacity = 1) => `rgba(137, 168, 178, ${opacity})`, // primary base
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

    // 1. Network Performance (Mapping Web's dual-axis logic natively) 
    // * Due to rn-chart-kit limits, we will map just Uptime as the primary critical indicator, 
    // or we map Uptime vs Latency if scaled appropriately. Here Uptime (99%+) vs Latency (20ms+) visually clash,
    // so we plot Uptime specifically as the headline trajectory, since Latency is mapped in Insights next.
    const networkLabels = networkData.map(d => d.month);
    const networkUptime = networkData.map(d => d.uptime);

    // 2. Service Requests Bar
    const serviceLabels = serviceData.map(d => {
        // Truncate cleanly for mobile X-axis space
        if (d.type === 'Billing Inquiry') return 'Billing';
        if (d.type === 'Cancellation') return 'Cxl';
        if (d.type === 'Installation') return 'Install';
        return d.type;
    });
    const serviceCounts = serviceData.map(d => d.count);

    return (
        <View style={styles.container}>
            {/* Network Uptime Performance */}
            <View style={styles.chartCard}>
                <View style={styles.cardHeader}>
                    <Text style={textStyles.sectionTitle}>Network Reliability</Text>
                    <Text style={styles.subtitle}>Monthly uptime percentage tracking</Text>
                </View>

                {networkData.length > 0 ? (
                    <LineChart
                        data={{
                            labels: networkLabels,
                            datasets: [{
                                data: networkUptime,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Success Green
                                strokeWidth: 3
                            }]
                        }}
                        width={CHART_WIDTH}
                        height={220}
                        chartConfig={{
                            ...chartConfig,
                            decimalPlaces: 1, // Need decimal for 99.9% tracking
                        }}
                        bezier
                        style={styles.chart}
                        withInnerLines={true}
                        yAxisSuffix="%"
                        segments={4}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No network data available</Text>
                    </View>
                )}
            </View>

            {/* Service Requests Distribution */}
            <View style={styles.chartCard}>
                <View style={styles.cardHeader}>
                    <Text style={textStyles.sectionTitle}>Request Distribution</Text>
                    <Text style={styles.subtitle}>Volume by service ticket type</Text>
                </View>

                {serviceData.length > 0 ? (
                    <BarChart
                        data={{
                            labels: serviceLabels,
                            datasets: [{
                                data: serviceCounts
                            }]
                        }}
                        width={CHART_WIDTH}
                        height={240}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(137, 168, 178, ${opacity})`, // primary fill
                            propsForLabels: { fontSize: 9 }
                        }}
                        yAxisLabel=""
                        yAxisSuffix=""
                        style={styles.chart}
                        fromZero
                        withInnerLines={true}
                        showValuesOnTopOfBars={true}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No request data available</Text>
                    </View>
                )}
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
