import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../../theme';
import { RegionalFilterState } from '../types';

interface RegionalFilterModalProps {
    visible: boolean;
    onClose: () => void;
    currentFilters: RegionalFilterState;
    onApply: (filters: Partial<RegionalFilterState>) => void;
    metadata: {
        areas: Array<{ id: string; name: string }>;
        plans: Array<{ id: string; name: string }>;
    };
}

const TIME_RANGES = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Month to Date', value: 'mtd' },
    { label: 'Quarter to Date', value: 'qtd' },
    { label: 'Year to Date', value: 'ytd' }
];

const COMAPRE_OPTIONS = [
    { label: 'vs Last Month', value: 'last_month' },
    { label: 'vs Last Year', value: 'last_year' }
];

export const RegionalFilterModal: React.FC<RegionalFilterModalProps> = ({
    visible,
    onClose,
    currentFilters,
    onApply,
    metadata
}) => {
    const [localFilters, setLocalFilters] = useState<RegionalFilterState>(currentFilters);

    React.useEffect(() => {
        if (visible) {
            setLocalFilters(currentFilters);
        }
    }, [visible, currentFilters]);

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        // Just reset back to current store filters for now, or trigger a complete reset
        onClose();
    };

    const toggleArea = (areaId: string) => {
        setLocalFilters(prev => {
            const exists = prev.areaIds.includes(areaId);
            if (exists) {
                return { ...prev, areaIds: prev.areaIds.filter(id => id !== areaId) };
            }
            return { ...prev, areaIds: [...prev.areaIds, areaId] };
        });
    };

    const isAllAreas = localFilters.areaIds.length === 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={textStyles.sectionTitle}>Filter Regional Data</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.neutral[500]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Time Range */}
                        <Text style={styles.sectionTitle}>Time Range</Text>
                        <View style={styles.chipContainer}>
                            {TIME_RANGES.map((range) => (
                                <TouchableOpacity
                                    key={range.value}
                                    style={[
                                        styles.chip,
                                        localFilters.timeRange === range.value && styles.activeChip
                                    ]}
                                    onPress={() => setLocalFilters({ ...localFilters, timeRange: range.value })}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        localFilters.timeRange === range.value && styles.activeChipText
                                    ]}>
                                        {range.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Compare */}
                        <Text style={styles.sectionTitle}>Compare</Text>
                        <View style={styles.chipContainer}>
                            {COMAPRE_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.chip,
                                        localFilters.compare === opt.value && styles.activeChip
                                    ]}
                                    onPress={() => setLocalFilters({ ...localFilters, compare: opt.value })}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        localFilters.compare === opt.value && styles.activeChipText
                                    ]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Areas (Multi-Select) */}
                        <Text style={styles.sectionTitle}>Areas</Text>
                        <View style={styles.chipContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.chip,
                                    isAllAreas && styles.activeChip
                                ]}
                                onPress={() => setLocalFilters({ ...localFilters, areaIds: [] })}
                            >
                                <Text style={[
                                    styles.chipText,
                                    isAllAreas && styles.activeChipText
                                ]}>
                                    All Areas
                                </Text>
                            </TouchableOpacity>
                            {(metadata?.areas || []).map((area) => {
                                const isSelected = localFilters.areaIds.includes(area.id);
                                return (
                                    <TouchableOpacity
                                        key={area.id}
                                        style={[styles.chip, isSelected && styles.activeChip]}
                                        onPress={() => toggleArea(area.id)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                                            {area.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Plans */}
                        <Text style={styles.sectionTitle}>Service Plan</Text>
                        <View style={styles.chipContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.chip,
                                    localFilters.planId === 'all' && styles.activeChip
                                ]}
                                onPress={() => setLocalFilters({ ...localFilters, planId: 'all' })}
                            >
                                <Text style={[
                                    styles.chipText,
                                    localFilters.planId === 'all' && styles.activeChipText
                                ]}>
                                    All Plans
                                </Text>
                            </TouchableOpacity>
                            {(metadata?.plans || []).map((plan) => (
                                <TouchableOpacity
                                    key={plan.id}
                                    style={[
                                        styles.chip,
                                        localFilters.planId === plan.id && styles.activeChip
                                    ]}
                                    onPress={() => setLocalFilters({ ...localFilters, planId: plan.id })}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        localFilters.planId === plan.id && styles.activeChipText
                                    ]}>
                                        {plan.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetText}>Cancel</Text>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface.card,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '80%',
        paddingTop: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    closeButton: {
        padding: spacing.xs,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
    },
    sectionTitle: {
        ...textStyles.body,
        color: colors.neutral[900],
        marginBottom: spacing.sm,
        marginTop: spacing.lg,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[50],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    activeChip: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[500],
    },
    chipText: {
        ...textStyles.bodySmall,
        color: colors.neutral[600],
    },
    activeChipText: {
        color: colors.primary[700],
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        gap: spacing.md,
        marginTop: spacing.md,
    },
    resetButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
    },
    resetText: {
        ...textStyles.buttonMedium,
        color: colors.neutral[700],
    },
    applyButton: {
        flex: 2,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        ...shadows.sm,
    },
    applyText: {
        ...textStyles.buttonMedium,
        color: colors.white,
    },
});
