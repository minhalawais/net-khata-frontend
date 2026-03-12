import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { UnifiedFinancialFilterState, BankOption } from '../types';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../../theme';

interface UnifiedFilterModalProps {
    visible: boolean;
    onClose: () => void;
    filters: UnifiedFinancialFilterState;
    onApply: (newFilters: Partial<UnifiedFinancialFilterState>) => void;
    bankAccounts: BankOption[];
}

export const UnifiedFinancialFilterModal: React.FC<UnifiedFilterModalProps> = ({
    visible,
    onClose,
    filters,
    onApply,
    bankAccounts
}) => {
    const [localFilters, setLocalFilters] = useState<UnifiedFinancialFilterState>(filters);

    useEffect(() => {
        if (visible) {
            setLocalFilters(filters);
        }
    }, [visible, filters]);

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        setLocalFilters(prev => ({
            ...prev,
            timeRange: 'mtd',
            bankAccount: 'all',
            paymentMethod: 'all',
            ispPaymentType: 'all',
            expenseType: 'all'
        }));
    };

    const timeRanges = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'Last 7 Days' },
        { id: 'mtd', label: 'Month to Date' },
        { id: 'qtd', label: 'Quarter to Date' },
        { id: 'ytd', label: 'Year to Date' },
    ];

    const paymentMethods = [
        { id: 'all', label: 'All Methods' },
        { id: 'cash', label: 'Cash' },
        { id: 'online', label: 'Online Transfer' },
        { id: 'bank_transfer', label: 'Bank Transfer' },
        { id: 'credit_card', label: 'Credit Card' },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <Text style={textStyles.body}>Filters</Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: spacing.xs }}>
                            <Ionicons name="close" size={24} color={colors.neutral[700]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionTitle}>Time Range</Text>
                        <View style={styles.chipGroup}>
                            {timeRanges.map(range => (
                                <TouchableOpacity
                                    key={range.id}
                                    style={[
                                        styles.chip,
                                        localFilters.timeRange === range.id && styles.chipActive
                                    ]}
                                    onPress={() => setLocalFilters(prev => ({ ...prev, timeRange: range.id }))}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        localFilters.timeRange === range.id && styles.chipTextActive
                                    ]}>
                                        {range.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Configurations</Text>

                        <View style={styles.selectGroup}>
                            <Text style={styles.selectLabel}>Bank Account</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                <TouchableOpacity
                                    style={[styles.chip, localFilters.bankAccount === 'all' && styles.chipActive]}
                                    onPress={() => setLocalFilters(prev => ({ ...prev, bankAccount: 'all' }))}
                                >
                                    <Text style={[styles.chipText, localFilters.bankAccount === 'all' && styles.chipTextActive]}>
                                        All Accounts
                                    </Text>
                                </TouchableOpacity>
                                {bankAccounts.map(bank => (
                                    <TouchableOpacity
                                        key={bank.id}
                                        style={[styles.chip, localFilters.bankAccount === bank.id && styles.chipActive]}
                                        onPress={() => setLocalFilters(prev => ({ ...prev, bankAccount: bank.id }))}
                                    >
                                        <Text style={[styles.chipText, localFilters.bankAccount === bank.id && styles.chipTextActive]}>
                                            {bank.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.selectGroup}>
                            <Text style={styles.selectLabel}>Payment Method</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {paymentMethods.map(method => (
                                    <TouchableOpacity
                                        key={method.id}
                                        style={[styles.chip, localFilters.paymentMethod === method.id && styles.chipActive]}
                                        onPress={() => setLocalFilters(prev => ({ ...prev, paymentMethod: method.id }))}
                                    >
                                        <Text style={[styles.chipText, localFilters.paymentMethod === method.id && styles.chipTextActive]}>
                                            {method.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={styles.applyText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.surface.overlay,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingTop: spacing.lg,
        maxHeight: '80%',
        ...shadows.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
    content: {
        paddingHorizontal: spacing.xl,
    },
    sectionTitle: {
        ...textStyles.bodySmall,
        color: colors.neutral[800],
        marginBottom: spacing.md,
        marginTop: spacing.lg,
    },
    chipGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
        marginRight: spacing.sm,
    },
    chipActive: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.neutral[700],
    },
    chipTextActive: {
        color: colors.white,
    },
    selectGroup: {
        marginBottom: spacing.lg,
    },
    selectLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.neutral[500],
        marginBottom: spacing.sm,
    },
    horizontalScroll: {
        flexDirection: 'row',
        paddingBottom: spacing.sm,
    },
    actions: {
        flexDirection: 'row',
        padding: spacing.xl,
        paddingBottom: spacing['4xl'],
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        gap: spacing.md,
    },
    resetButton: {
        flex: 1,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    resetText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[700],
    },
    applyButton: {
        flex: 2,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[600],
    },
    applyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
    },
});
