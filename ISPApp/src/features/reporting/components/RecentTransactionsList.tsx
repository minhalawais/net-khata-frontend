import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InventoryAnalyticsData } from '../types';
import { colors, spacing, textStyles, borderRadius, shadows } from '../../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface RecentTransactionsListProps {
    transactions: InventoryAnalyticsData['tables']['recent_transactions'];
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <View style={[styles.card, styles.emptyCard]}>
                <Ionicons name="document-text-outline" size={32} color={colors.neutral[400]} />
                <Text style={[styles.cardTitle, { marginTop: spacing.sm }]}>No Transactions</Text>
                <Text style={textStyles.bodySmall}>There are no recent inventory movements.</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: spacing.md }]}>Recent Transactions</Text>

            <View style={styles.list}>
                {transactions.map((tx, index) => {
                    const isAssignment = tx.type.toLowerCase() === 'assignment';
                    const iconColor = isAssignment ? colors.semantic.info : colors.semantic.warning;
                    const bgColor = isAssignment ? colors.semantic.infoLight : colors.semantic.warningLight;
                    const iconName = isAssignment ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline';

                    return (
                        <View
                            key={tx.id}
                            style={[
                                styles.row,
                                index !== transactions.length - 1 && styles.borderBottom
                            ]}
                        >
                            <View style={styles.txInfo}>
                                <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                                    <Ionicons name={iconName} size={18} color={iconColor} />
                                </View>
                                <View>
                                    <Text style={textStyles.label}>{tx.item_type}</Text>
                                    <Text style={textStyles.bodySmall}>{tx.performed_by} • {tx.type}</Text>
                                </View>
                            </View>

                            <View style={styles.quantityContainer}>
                                <Text style={[
                                    styles.quantityText,
                                    { color: isAssignment ? colors.semantic.info : colors.semantic.warningDark }
                                ]}>
                                    {isAssignment ? '-' : '+'}{tx.quantity}
                                </Text>
                            </View>
                        </View>
                    );
                })}
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
        paddingVertical: spacing.sm,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    txInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    quantityText: {
        ...textStyles.buttonMedium,
    },
});
