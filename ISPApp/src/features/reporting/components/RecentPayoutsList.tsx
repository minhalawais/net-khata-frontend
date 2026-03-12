import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmployeeAnalyticsData } from '../types';
import { colors, spacing, textStyles, borderRadius, shadows } from '../../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface RecentPayoutsListProps {
    payouts: EmployeeAnalyticsData['tables']['recent_payouts'];
}

export const RecentPayoutsList: React.FC<RecentPayoutsListProps> = ({ payouts }) => {
    if (!payouts || payouts.length === 0) {
        return (
            <View style={[styles.card, styles.emptyCard]}>
                <Ionicons name="card-outline" size={32} color={colors.neutral[400]} />
                <Text style={[styles.cardTitle, { marginTop: spacing.sm }]}>No Payouts Yet</Text>
                <Text style={textStyles.bodySmall}>No recent payout history found.</Text>
            </View>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.cardTitle}>Recent Payouts</Text>
            </View>

            <View style={styles.list}>
                {payouts.map((payout, index) => (
                    <View
                        key={payout.id}
                        style={[
                            styles.row,
                            index !== payouts.length - 1 && styles.borderBottom
                        ]}
                    >
                        <View style={styles.payoutInfo}>
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={payout.type.toLowerCase().includes('salary') ? 'cash-outline' : 'receipt-outline'}
                                    size={18}
                                    color={colors.semantic.success}
                                />
                            </View>
                            <View>
                                <Text style={textStyles.label} numberOfLines={1}>{payout.employee}</Text>
                                <Text style={styles.dateText}>{payout.date ? new Date(payout.date).toLocaleDateString() : 'N/A'} • {payout.type.toUpperCase()}</Text>
                            </View>
                        </View>

                        <View style={styles.amountContainer}>
                            <Text style={styles.amountText}>{formatCurrency(payout.amount)}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        ...shadows.sm,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
    },
    header: {
        marginBottom: spacing.md,
    },
    cardTitle: {
        ...textStyles.sectionTitle,
    },
    list: {
        gap: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    payoutInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 2,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        backgroundColor: colors.semantic.successLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 11,
        color: colors.neutral[500],
        marginTop: 2,
    },
    amountContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.semantic.successDark,
    },
});
