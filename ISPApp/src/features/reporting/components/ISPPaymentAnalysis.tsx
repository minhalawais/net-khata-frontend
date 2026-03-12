import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ISPPaymentAnalytics } from '../types';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

interface ISPPaymentAnalysisProps {
    data: ISPPaymentAnalytics;
}

const formatCurrency = (amount: number) => {
    return 'PKR ' + (amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const ISPPaymentAnalysis: React.FC<ISPPaymentAnalysisProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<'types' | 'banks' | 'bandwidth'>('types');

    if (!data) return null;

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: keyof typeof Ionicons.glyphMap }) => {
        const isActive = activeTab === id;
        return (
            <TouchableOpacity
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => setActiveTab(id)}
            >
                <Ionicons name={icon} size={16} color={isActive ? colors.primary[700] : colors.neutral[500]} />
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    const renderTypeItem = ({ item }: any) => {
        const percentage = data.total_isp_payments > 0 ? (item.total_amount / data.total_isp_payments) * 100 : 0;
        return (
            <View style={styles.listItem}>
                <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.type?.replace(/_/g, ' ').toUpperCase()}</Text>
                    <Text style={textStyles.bodySmall}>Penalty: {formatCurrency(item.penalty_amount)}</Text>
                </View>
                <View style={styles.itemFooter}>
                    <Text style={styles.itemSubtitle}>{item.payment_count} transactions</Text>
                    <Text style={styles.itemSubtitle}>{percentage.toFixed(1)}%</Text>
                </View>
                <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: colors.secondary[500] }]} />
                </View>
            </View>
        );
    };

    const renderBankItem = ({ item }: any) => {
        const totalBankPayments = data.bank_account_breakdown?.reduce((sum, b) => sum + b.total_amount, 0) || 1;
        const percentage = (item.total_amount / totalBankPayments) * 100;
        return (
            <View style={styles.listItem}>
                <View style={styles.itemHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={textStyles.body}>{item.type}</Text>
                        <Text style={[textStyles.bodySmall, { color: colors.neutral[500], marginTop: 2 }]}>
                            {item.account_number}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[textStyles.buttonMedium, { color: colors.primary[600] }]}>View Details</Text>
                        <Text style={[textStyles.body, { color: colors.neutral[900] }]}>
                            {formatCurrency(item.total_amount)}
                        </Text>
                    </View>
                </View>
                <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: colors.primary[500] }]} />
                </View>
            </View>
        );
    };

    const renderBandwidthItem = ({ item }: any) => {
        return (
            <View style={styles.listItem}>
                <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.month}</Text>
                    <Text style={styles.itemAmount}>{formatCurrency(item.total_cost)}</Text>
                </View>
                <View style={styles.itemFooter}>
                    <Text style={styles.itemSubtitle}>Usage: {item.total_usage} GB</Text>
                    <Text style={styles.itemSubtitle}>Rate: {item.cost_per_gb?.toFixed(2)} / GB</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={[textStyles.sectionTitle, { marginBottom: spacing.md }]}>ISP Payment Analysis</Text>
            <Text style={[textStyles.body, styles.description]}>
                Total Payments: <Text style={{ fontWeight: '700', color: colors.neutral[900] }}>{formatCurrency(data.total_isp_payments || 0)}</Text>
            </Text>

            <View style={styles.iconContainer}>
                <Ionicons name="swap-vertical-outline" size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.tabsContainer}>
                <TabButton id="types" label="Types" icon="pie-chart-outline" />
                <TabButton id="banks" label="Banks" icon="business-outline" />
                <TabButton id="bandwidth" label="Bandwidth" icon="speedometer-outline" />
            </View>

            <View style={styles.listContainer}>
                {activeTab === 'types' && (
                    <FlatList
                        data={data.payment_types}
                        renderItem={renderTypeItem}
                        keyExtractor={(item, index) => `type-${item.type}-${index}`}
                        scrollEnabled={false}
                    />
                )}
                {activeTab === 'banks' && (
                    <FlatList
                        data={data.bank_account_breakdown}
                        renderItem={renderBankItem}
                        keyExtractor={(item, index) => `bank-${item.account_number}-${index}`}
                        scrollEnabled={false}
                    />
                )}
                {activeTab === 'bandwidth' && (
                    <FlatList
                        data={data.bandwidth_analysis}
                        renderItem={renderBandwidthItem}
                        keyExtractor={(item, index) => `bw-${item.month}-${index}`}
                        scrollEnabled={false}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        alignItems: 'center',
    },
    description: {
        color: colors.neutral[500],
        marginBottom: spacing.lg,
    },
    iconContainer: {
        padding: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary[50],
        marginBottom: spacing.lg,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.lg,
        padding: 4,
        marginBottom: spacing.lg,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    activeTabButton: {
        backgroundColor: colors.surface.card,
        ...shadows.sm,
    },
    tabLabel: {
        ...textStyles.buttonMedium,
        color: colors.neutral[500],
    },
    activeTabLabel: {
        color: colors.primary[700],
    },
    listContainer: {
        gap: spacing.md,
    },
    listItem: {
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    itemTitle: {
        ...textStyles.body,
        color: colors.neutral[900],
        fontWeight: '600',
    },
    itemAmount: {
        ...textStyles.body,
        color: colors.neutral[900],
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    itemSubtitle: {
        ...textStyles.bodySmall,
        color: colors.neutral[500],
    },
    progressBg: {
        height: 6,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
});
