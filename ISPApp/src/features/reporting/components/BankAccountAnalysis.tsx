import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { BankAccountAnalytics } from '../types';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../../theme';

interface BankAccountAnalysisProps {
    data: BankAccountAnalytics[];
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const formatCurrency = (amount: number) => {
    return 'PKR ' + amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const BankAccountAnalysis: React.FC<BankAccountAnalysisProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const renderItem = ({ item }: { item: BankAccountAnalytics }) => {
        // Determine color based on net flow
        const isPositive = item.net_flow >= 0;
        const flowColor = isPositive ? colors.semantic.success : colors.semantic.error;

        // Utilization rate visual
        const fillWidth = `${Math.min(Math.max(item.utilization_rate || 0, 0), 100)}%`;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={textStyles.cardTitle}>{item.bank_name}</Text>
                        <Text style={textStyles.bodySmall}>{item.account_title}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={textStyles.bodySmall}>{item.account_number}</Text>
                        <View style={[styles.badge, { backgroundColor: isPositive ? colors.semantic.successLight : colors.semantic.errorLight }]}>
                            <Text style={[textStyles.bodySmall, { color: flowColor, fontWeight: '600' }]}>
                                {isPositive ? '+' : ''}{formatCurrency(item.net_flow)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.metricsRow}>
                    <View style={styles.metric}>
                        <View>
                            <Text style={textStyles.bodySmall}>Current Balance</Text>
                            <Text style={[textStyles.body, { color: colors.neutral[900], fontWeight: 'bold' }]}>
                                {formatCurrency(item.current_balance)}
                            </Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={textStyles.bodySmall}>Month Inflow</Text>
                        <Text style={[textStyles.body, { color: colors.semantic.success }]}>{formatCurrency(item.collections)}</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={[textStyles.bodySmall, styles.progressLabel]}>Utilization</Text>
                        <Text style={[textStyles.bodySmall, styles.progressPercent]}>
                            {(item.utilization_rate || 0).toFixed(1)}%
                        </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: fillWidth as any }]} />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={[textStyles.sectionTitle, { marginBottom: spacing.md }]}>Bank Accounts Overview</Text>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.bank_name}-${item.account_number}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                snapToInterval={CARD_WIDTH + spacing.md}
                decelerationRate="fast"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginRight: spacing.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    bankName: {
        color: colors.neutral[900],
        fontWeight: '600',
    },
    accountNumber: {
        color: colors.neutral[500],
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    metric: {
        flex: 1,
    },
    metricLabel: {
        color: colors.neutral[500],
        marginBottom: 2,
    },
    progressContainer: {
        marginTop: 'auto',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    progressLabel: {
        color: colors.neutral[600],
        fontWeight: '500',
    },
    progressPercent: {
        color: colors.primary[700],
        fontWeight: '600',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary[500],
        borderRadius: borderRadius.full,
    },
});
