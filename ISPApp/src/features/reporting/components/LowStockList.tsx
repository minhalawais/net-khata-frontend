import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InventoryAnalyticsData } from '../types';
import { colors, spacing, textStyles, borderRadius, shadows } from '../../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface LowStockListProps {
    items: InventoryAnalyticsData['tables']['low_stock_items'];
}

export const LowStockList: React.FC<LowStockListProps> = ({ items }) => {
    if (!items || items.length === 0) {
        return (
            <View style={[styles.card, styles.emptyCard]}>
                <Ionicons name="checkmark-circle-outline" size={32} color={colors.semantic.success} />
                <Text style={[styles.cardTitle, { marginTop: spacing.sm }]}>Stock Healthy</Text>
                <Text style={textStyles.bodySmall}>All item quantities are above threshold levels.</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.cardTitle}>Low Stock Items</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{items.length} Alerts</Text>
                </View>
            </View>

            <View style={styles.list}>
                {items.map((item, index) => (
                    <View
                        key={item.id}
                        style={[
                            styles.row,
                            index !== items.length - 1 && styles.borderBottom
                        ]}
                    >
                        <View style={styles.itemInfo}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="warning-outline" size={16} color={colors.semantic.error} />
                            </View>
                            <View>
                                <Text style={textStyles.label}>{item.item_type}</Text>
                                <Text style={textStyles.bodySmall}>{item.supplier}</Text>
                            </View>
                        </View>

                        <View style={styles.quantityContainer}>
                            <Text style={styles.currentQuantity}>{item.quantity}</Text>
                            <Text style={textStyles.bodySmall}> / {item.threshold}</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitle: {
        ...textStyles.sectionTitle,
    },
    badge: {
        backgroundColor: colors.semantic.errorLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    badgeText: {
        ...textStyles.badge,
        color: colors.semantic.errorDark,
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
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.md,
        backgroundColor: colors.semantic.errorLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currentQuantity: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.semantic.error,
    },
});
