import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { CashFlowData } from '../types';
import { colors, spacing, borderRadius, textStyles } from '../../../theme';

interface CashFlowAnalysisProps {
    data: CashFlowData;
}

const { width } = Dimensions.get('window');

// Formatting helper
const formatCurrency = (amount: number) => {
    return 'PKR ' + amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const CashFlowAnalysis: React.FC<CashFlowAnalysisProps> = ({ data }) => {
    const chartWidth = width - spacing.lg * 2 - spacing.lg * 2; // Screen width - Screen padding - Card padding

    const totalInflow = data.inflow_breakdown.reduce((sum, item) => sum + item.amount, 0);
    const totalOutflow = data.monthly_trends.reduce((sum, item) => sum + item.outflow, 0);
    const totalIspOutflow = data.monthly_trends.reduce((sum, item) => sum + item.isp_outflow, 0);
    const totalExpenseOutflow = data.monthly_trends.reduce((sum, item) => sum + item.expense_outflow, 0);

    // Chart Data Preparation
    const labels = data.monthly_trends.map(t => t.month.substring(0, 3)); // Short month names

    const chartData = {
        labels: labels.length > 0 ? labels : ['N/A'],
        datasets: [
            {
                data: data.monthly_trends.length > 0 ? data.monthly_trends.map(t => t.inflow) : [0],
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
                strokeWidth: 2
            },
            {
                data: data.monthly_trends.length > 0 ? data.monthly_trends.map(t => t.isp_outflow) : [0],
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red
                strokeWidth: 2
            },
            {
                data: data.monthly_trends.length > 0 ? data.monthly_trends.map(t => t.expense_outflow) : [0],
                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`, // Orange
                strokeWidth: 2
            }
        ],
        legend: ['Inflow', 'ISP', 'Expenses']
    };

    const SummaryCard = ({ title, amount, subtitle, colorClass }: any) => (
        <View style={[styles.summaryCard, { backgroundColor: colorClass.bg, borderColor: colorClass.border }]}>
            <Text style={[{ color: colorClass.text }, textStyles.bodySmall, styles.summaryTitle]}>{title}</Text>
            <Text style={[textStyles.cardTitle, { marginBottom: spacing.md, color: colors.white }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(amount)}
            </Text>
            {subtitle && (
                <Text style={[styles.summarySubtitle, { color: colorClass.text }]}>{subtitle}</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={textStyles.sectionTitle}>Cash Flow Analysis</Text>
            <Text style={[textStyles.body, styles.description]}>
                Monthly cash inflows, outflows, and net position
            </Text>

            {/* Summary Stats Grid */}
            <View style={styles.gridContainer}>
                <View style={styles.gridRow}>
                    <SummaryCard
                        title="Total Inflow"
                        amount={totalInflow}
                        colorClass={{ bg: '#ecfdf5', border: '#d1fae5', text: '#047857', value: '#065f46' }}
                    />
                    <SummaryCard
                        title="Total Outflow"
                        amount={totalOutflow}
                        subtitle={`ISP: ${formatCurrency(totalIspOutflow)}\nExp: ${formatCurrency(totalExpenseOutflow)}`}
                        colorClass={{ bg: '#fef2f2', border: '#fee2e2', text: '#b91c1c', value: '#991b1b' }}
                    />
                </View>
                <View style={styles.gridRow}>
                    <SummaryCard
                        title="Initial Balance"
                        amount={data.initial_balance || 0}
                        colorClass={{ bg: '#fdf4ff', border: '#fae8ff', text: '#a21caf', value: '#86198f' }}
                    />
                    <SummaryCard
                        title="Adjusted Flow"
                        amount={data.total_adjusted_flow || 0}
                        colorClass={{ bg: '#eff6ff', border: '#dbeafe', text: '#1d4ed8', value: '#1e40af' }}
                    />
                </View>
            </View>

            {/* Cash Flow Trends */}
            <Text style={[textStyles.sectionTitle, styles.chartTitle]}>Cash Flow Trends</Text>
            <View style={styles.chartContainer}>
                <LineChart
                    data={chartData}
                    width={chartWidth}
                    height={220}
                    chartConfig={{
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
                    }}
                    bezier
                    style={styles.chart}
                    withInnerLines={false}
                    withOuterLines={false}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    description: {
        color: colors.neutral[500],
        marginBottom: spacing.xl,
    },
    gridContainer: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    gridRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    summaryCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryTitle: {
        fontWeight: '500',
        marginBottom: spacing.xs,
    },
    summarySubtitle: {
        fontSize: 10,
        marginTop: spacing.xs,
        textAlign: 'center',
        lineHeight: 14,
    },
    chartTitle: {
        marginBottom: spacing.lg,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: -spacing.md,
    },
    chart: {
        borderRadius: borderRadius.lg,
    }
});
