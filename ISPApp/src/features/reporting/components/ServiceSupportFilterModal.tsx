import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useServiceSupportAnalyticsStore } from '../stores/useServiceSupportAnalytics.store';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../../theme';

interface ServiceSupportFilterModalProps {
    visible: boolean;
    onClose: () => void;
    filterOptions: {
        areas: { id: string; name: string }[];
        technicians: { id: string; name: string }[];
        statuses: string[];
        priorities: string[];
    } | undefined;
}

export const ServiceSupportFilterModal = ({ visible, onClose, filterOptions }: ServiceSupportFilterModalProps) => {
    const { filters, setFilters, resetFilters } = useServiceSupportAnalyticsStore();

    // Local state for dates before applying
    const [localStartDate, setLocalStartDate] = useState(new Date(filters.startDate));
    const [localEndDate, setLocalEndDate] = useState(new Date(filters.endDate));
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleApply = () => {
        setFilters({
            startDate: localStartDate.toISOString().split('T')[0],
            endDate: localEndDate.toISOString().split('T')[0],
        });
        onClose();
    };

    const renderChip = (
        label: string,
        isSelected: boolean,
        onPress: () => void
    ) => (
        <TouchableOpacity
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={onPress}
        >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderSelectOption = (
        title: string,
        value: string,
        options: { value: string; label: string }[],
        onChange: (val: string) => void
    ) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[styles.chip, value === opt.value && styles.chipSelected]}
                        onPress={() => onChange(opt.value)}
                    >
                        <Text style={[styles.chipText, value === opt.value && styles.chipTextSelected]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Filters</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close" size={24} color={colors.neutral[800]} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Time Range Preset */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Time Range</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {[
                                { label: 'Today', value: 'today' },
                                { label: 'Last 7 Days', value: 'week' },
                                { label: 'This Month', value: 'mtd' },
                                { label: 'This Quarter', value: 'qtd' },
                                { label: 'This Year', value: 'ytd' },
                            ].map(preset => (
                                renderChip(
                                    preset.label,
                                    filters.timeRange === preset.value,
                                    () => {
                                        useServiceSupportAnalyticsStore.getState().setQuickFilter(preset.value as any);
                                        // Update local date state to reflect quick filter
                                        setLocalStartDate(new Date(useServiceSupportAnalyticsStore.getState().filters.startDate));
                                        setLocalEndDate(new Date(useServiceSupportAnalyticsStore.getState().filters.endDate));
                                    }
                                )
                            ))}
                        </ScrollView>
                    </View>

                    {/* Custom Date Range */}
                    {filters.timeRange === 'custom' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Custom Date Range</Text>
                            <View style={styles.dateRow}>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowStartPicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={colors.neutral[500]} />
                                    <Text style={styles.dateText}>
                                        {localStartDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={styles.dateDivider}>to</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowEndPicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={colors.neutral[500]} />
                                    <Text style={styles.dateText}>
                                        {localEndDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Compare To */}
                    {renderSelectOption(
                        'Compare To',
                        filters.compare,
                        [
                            { value: 'last_month', label: 'Previous Month' },
                            { value: 'last_year', label: 'Previous Year' }
                        ],
                        (val) => setFilters({ compare: val })
                    )}

                    {/* Status Filter */}
                    {filterOptions?.statuses && renderSelectOption(
                        'Complaint Status',
                        filters.status,
                        [{ value: 'all', label: 'All Statuses' }, ...filterOptions.statuses.map(s => ({ value: s, label: s }))],
                        (val) => setFilters({ status: val })
                    )}

                    {/* Priority Filter */}
                    {filterOptions?.priorities && renderSelectOption(
                        'Priority Level',
                        filters.priority,
                        [{ value: 'all', label: 'All Priorities' }, ...filterOptions.priorities.map(p => ({ value: p, label: p }))],
                        (val) => setFilters({ priority: val })
                    )}

                    {/* Area Filter */}
                    {filterOptions?.areas && renderSelectOption(
                        'Area Zone',
                        filters.areaId,
                        [{ value: 'all', label: 'All Areas' }, ...filterOptions.areas.map(a => ({ value: a.id, label: a.name }))],
                        (val) => setFilters({ areaId: val })
                    )}

                    {/* Technician Filter */}
                    {filterOptions?.technicians && renderSelectOption(
                        'Assigned Technician',
                        filters.technicianId,
                        [{ value: 'all', label: 'All Technicians' }, ...filterOptions.technicians.map(t => ({ value: t.id, label: t.name }))],
                        (val) => setFilters({ technicianId: val })
                    )}

                    <View style={styles.bottomPadding} />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={() => {
                            resetFilters();
                            setLocalStartDate(new Date(useServiceSupportAnalyticsStore.getState().filters.startDate));
                            setLocalEndDate(new Date(useServiceSupportAnalyticsStore.getState().filters.endDate));
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

                {/* Date Pickers */}
                {showStartPicker && (
                    <DateTimePicker
                        value={localStartDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowStartPicker(Platform.OS === 'ios');
                            if (selectedDate) {
                                setLocalStartDate(selectedDate);
                                setFilters({ timeRange: 'custom' });
                            }
                        }}
                    />
                )}
                {showEndPicker && (
                    <DateTimePicker
                        value={localEndDate}
                        mode="date"
                        display="default"
                        minimumDate={localStartDate}
                        onChange={(event, selectedDate) => {
                            setShowEndPicker(Platform.OS === 'ios');
                            if (selectedDate) {
                                setLocalEndDate(selectedDate);
                                setFilters({ timeRange: 'custom' });
                            }
                        }}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
        paddingBottom: spacing.lg,
        backgroundColor: colors.surface.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    headerTitle: {
        ...textStyles.sectionTitle,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing['2xl'],
    },
    sectionTitle: {
        ...textStyles.label,
        marginBottom: spacing.md,
    },
    chipRow: {
        gap: spacing.sm,
        paddingRight: spacing.lg,
    },
    chip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    chipSelected: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.neutral[600],
        textTransform: 'capitalize',
    },
    chipTextSelected: {
        color: colors.white,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    dateInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        backgroundColor: colors.surface.card,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
    },
    dateText: {
        ...textStyles.body,
    },
    dateDivider: {
        ...textStyles.bodySmall,
    },
    bottomPadding: {
        height: spacing['5xl'],
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing.lg,
        backgroundColor: colors.surface.card,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        gap: spacing.md,
    },
    resetButton: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[100],
    },
    resetButtonText: {
        ...textStyles.buttonMedium,
        color: colors.neutral[700],
    },
    applyButton: {
        flex: 2,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[600],
    },
    applyButtonText: {
        ...textStyles.buttonMedium,
    }
});
