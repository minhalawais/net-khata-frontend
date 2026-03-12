import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ServicePlanFilterState } from '../types';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../../theme';

interface ServicePlanFilterModalProps {
    visible: boolean;
    onClose: () => void;
    currentFilters: ServicePlanFilterState;
    onApply: (filters: Partial<ServicePlanFilterState>) => void;
    metadata: {
        plans: Array<{ id: string; name: string }>;
        statuses: string[];
    };
}

const TIME_RANGES = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Past 7 Days' },
    { id: 'mtd', label: 'This Month' },
    { id: 'qtd', label: 'This Quarter' },
    { id: 'ytd', label: 'Year to Date' }
];

const COMPARISON_PERIODS = [
    { id: 'last_month', label: 'vs Last Month' },
    { id: 'last_year', label: 'vs Last Year' }
];

export const ServicePlanFilterModal: React.FC<ServicePlanFilterModalProps> = ({
    visible,
    onClose,
    currentFilters,
    onApply,
    metadata
}) => {
    const [localFilters, setLocalFilters] = useState<ServicePlanFilterState>(currentFilters);

    // Sync when modal opens
    useEffect(() => {
        if (visible) {
            setLocalFilters(currentFilters);
        }
    }, [visible, currentFilters]);

    const handleApply = () => {
        // Date math logic (MTD, YTD, etc) should ideally exist inside the store setFilters wrapper, 
        // but for immediate mapping, we apply TimeRange back to the store and rely on 
        // the store/server logic to extrapolate exact date bounds, or map it here inline:

        let newStartDate = new Date();
        const today = new Date();

        // Formatter helper
        const formatDate = (d: Date) => {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        const range = localFilters.timeRange;
        if (range === 'today') newStartDate = today;
        else if (range === 'week') newStartDate.setDate(today.getDate() - 7);
        else if (range === 'mtd') newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        else if (range === 'qtd') newStartDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        else if (range === 'ytd') newStartDate = new Date(today.getFullYear(), 0, 1);

        onApply({
            ...localFilters,
            startDate: formatDate(newStartDate),
            endDate: formatDate(today)
        });
        onClose();
    };

    const togglePlan = (planId: string) => {
        setLocalFilters(prev => {
            const planIds = [...prev.planIds];
            if (planIds.includes(planId)) {
                return { ...prev, planIds: planIds.filter(id => id !== planId) };
            } else {
                return { ...prev, planIds: [...planIds, planId] };
            }
        });
    };

    const isPlanSelected = (planId: string) => localFilters.planIds.includes(planId);

    // Safety check - empty array means "All"
    const isAllPlansSelected = localFilters.planIds.length === 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <SafeAreaView style={styles.safeArea}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={textStyles.sectionTitle}>Filter Analytics</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.neutral[600]} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                            {/* Time Range */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>TIME RANGE</Text>
                                <View style={styles.chipContainer}>
                                    {TIME_RANGES.map(range => (
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
                            </View>

                            {/* Service Plans (Multi-Select) */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.sectionLabel}>SERVICE PLANS</Text>
                                    <Text style={styles.helperText}>(Multiple allowed)</Text>
                                </View>
                                <View style={styles.chipContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.chip,
                                            isAllPlansSelected && styles.chipActive
                                        ]}
                                        onPress={() => setLocalFilters(prev => ({ ...prev, planIds: [] }))}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            isAllPlansSelected && styles.chipTextActive
                                        ]}>
                                            All Plans
                                        </Text>
                                    </TouchableOpacity>

                                    {metadata?.plans?.map(plan => (
                                        <TouchableOpacity
                                            key={plan.id}
                                            style={[
                                                styles.chip,
                                                isPlanSelected(plan.id) && styles.chipActive
                                            ]}
                                            onPress={() => togglePlan(plan.id)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                isPlanSelected(plan.id) && styles.chipTextActive
                                            ]}>
                                                {plan.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Comparison Period */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>COMPARE AGAINST</Text>
                                <View style={styles.chipContainer}>
                                    {COMPARISON_PERIODS.map(period => (
                                        <TouchableOpacity
                                            key={period.id}
                                            style={[
                                                styles.chip,
                                                localFilters.compare === period.id && styles.chipActive
                                            ]}
                                            onPress={() => setLocalFilters(prev => ({ ...prev, compare: period.id }))}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                localFilters.compare === period.id && styles.chipTextActive
                                            ]}>
                                                {period.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                        </ScrollView>

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setLocalFilters({
                                        planIds: [],
                                        status: 'all',
                                        compare: 'last_month',
                                        timeRange: 'mtd',
                                        startDate: '',
                                        endDate: ''
                                    });
                                }}
                            >
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={handleApply}
                            >
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)', // Slate-900 with opacity
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.neutral[50], // surface equivalent
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
        ...shadows.lg,
    },
    safeArea: {
        flex: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    closeButton: {
        padding: spacing.xs,
        marginRight: -spacing.xs,
    },
    scrollView: {
        padding: spacing.xl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    sectionLabel: {
        ...textStyles.label,
        color: colors.neutral[500],
        marginBottom: spacing.sm,
    },
    helperText: {
        ...textStyles.bodySmall,
        color: colors.neutral[400],
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    chipActive: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[200],
    },
    chipText: {
        ...textStyles.body,
        fontWeight: '500',
        color: colors.neutral[600],
    },
    chipTextActive: {
        color: colors.primary[700],
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        gap: spacing.md,
    },
    resetButton: {
        flex: 1,
        paddingVertical: spacing.md,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    resetButtonText: {
        ...textStyles.buttonMedium,
        color: colors.neutral[700],
    },
    applyButton: {
        flex: 2,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    applyButtonText: {
        ...textStyles.buttonMedium,
        color: colors.neutral[50], // Instead of white map to highest neutral
    },
});
