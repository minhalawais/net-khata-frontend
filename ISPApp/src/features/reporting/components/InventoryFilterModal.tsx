import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useInventoryAnalyticsStore } from '../stores/useInventoryAnalytics.store';
import { InventoryAnalyticsData } from '../types';
import { colors, spacing, textStyles, borderRadius, shadows } from '../../../theme';
import { Picker } from '@react-native-picker/picker'; // requires @react-native-picker/picker

interface InventoryFilterModalProps {
    visible: boolean;
    onClose: () => void;
    metadata?: InventoryAnalyticsData['filters'];
}

export const InventoryFilterModal: React.FC<InventoryFilterModalProps> = ({ visible, onClose, metadata }) => {
    const { filters, setFilters, setQuickFilter, resetFilters } = useInventoryAnalyticsStore();

    const QUICK_FILTERS = [
        { label: 'Today', value: 'today' },
        { label: '7 Days', value: 'week' },
        { label: 'Month', value: 'mtd' },
        { label: 'Quarter', value: 'qtd' },
        { label: 'Year', value: 'ytd' },
    ] as const;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Refine Inventory Data</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={10}>
                            <Ionicons name="close" size={24} color={colors.neutral[500]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Quick Filters */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Time Range</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                {QUICK_FILTERS.map((filter) => {
                                    const isActive = filters.timeRange === filter.value;
                                    return (
                                        <TouchableOpacity
                                            key={filter.value}
                                            style={[styles.chip, isActive && styles.chipActive]}
                                            onPress={() => setQuickFilter(filter.value)}
                                        >
                                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                                {filter.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Compare */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Compare Previous</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={filters.compare}
                                    onValueChange={(val) => setFilters({ compare: val })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="vs Last Month" value="last_month" color={colors.neutral[800]} />
                                    <Picker.Item label="vs Last Year" value="last_year" color={colors.neutral[800]} />
                                </Picker>
                            </View>
                        </View>

                        {/* Item Type */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Item Type</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={filters.itemType}
                                    onValueChange={(val) => setFilters({ itemType: val })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="All Types" value="all" color={colors.neutral[800]} />
                                    {metadata?.item_types.map((type) => (
                                        <Picker.Item key={type} label={type} value={type} color={colors.neutral[800]} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Supplier */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Supplier</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={filters.supplierId}
                                    onValueChange={(val) => setFilters({ supplierId: val })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="All Suppliers" value="all" color={colors.neutral[800]} />
                                    {metadata?.suppliers.map((s) => (
                                        <Picker.Item key={s.id} label={s.name} value={s.id} color={colors.neutral[800]} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={resetFilters}
                        >
                            <Text style={styles.resetText}>Reset All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={onClose}
                        >
                            <Text style={styles.applyText}>View Results</Text>
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
        backgroundColor: colors.surface.card,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        height: '80%',
        ...shadows.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    title: {
        ...textStyles.sectionTitle,
    },
    content: {
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...textStyles.label,
        marginBottom: spacing.sm,
    },
    chipScroll: {
        flexDirection: 'row',
        marginHorizontal: -spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[100],
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    chipActive: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[500],
    },
    chipText: {
        color: colors.neutral[600],
        fontWeight: '500',
        fontSize: 14,
    },
    chipTextActive: {
        color: colors.primary[700],
    },
    pickerContainer: {
        backgroundColor: colors.surface.input,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        gap: spacing.md,
    },
    resetButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
    },
    resetText: {
        ...textStyles.buttonMedium,
        color: colors.neutral[700],
    },
    applyButton: {
        flex: 2,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        backgroundColor: colors.primary[600],
    },
    applyText: {
        ...textStyles.buttonMedium,
    },
});
