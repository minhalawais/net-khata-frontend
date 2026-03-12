import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, textStyles, borderRadius } from '../../../theme';
import { useEmployeeAnalyticsStore } from '../stores/useEmployeeAnalytics.store';

interface EmployeeFilterModalProps {
    visible: boolean;
    onClose: () => void;
    availableRoles: string[];
    availableStatuses: string[];
}

export const EmployeeFilterModal: React.FC<EmployeeFilterModalProps> = ({
    visible,
    onClose,
    availableRoles,
    availableStatuses
}) => {
    const { filters, setFilters, setQuickFilter, resetFilters } = useEmployeeAnalyticsStore();

    const handleApply = () => {
        onClose();
    };

    const timeRanges = [
        { label: 'Today', value: 'today' },
        { label: 'Last 7 Days', value: 'week' },
        { label: 'This Month', value: 'mtd' },
        { label: 'This Quarter', value: 'qtd' },
        { label: 'This Year', value: 'ytd' },
    ] as const;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Filter Analytics</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.neutral[600]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Time Range */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Time Range</Text>
                            <View style={styles.chipsContainer}>
                                {timeRanges.map((range) => (
                                    <TouchableOpacity
                                        key={range.value}
                                        style={[
                                            styles.chip,
                                            filters.timeRange === range.value && styles.chipActive
                                        ]}
                                        onPress={() => setQuickFilter(range.value)}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            filters.timeRange === range.value && styles.chipTextActive
                                        ]}>
                                            {range.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Role Filter */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Role</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={filters.role}
                                    onValueChange={(itemValue) => setFilters({ role: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="All Roles" value="all" />
                                    {availableRoles?.map((role) => (
                                        <Picker.Item key={role} label={role} value={role} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Status Filter */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Status</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={filters.status}
                                    onValueChange={(itemValue) => setFilters({ status: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="All" value="all" />
                                    <Picker.Item label="Active" value="active" />
                                    <Picker.Item label="Inactive" value="inactive" />
                                </Picker>
                            </View>
                        </View>

                        {/* Compare Filter */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Comparison</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={filters.compare}
                                    onValueChange={(itemValue) => setFilters({ compare: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="vs Last Month" value="last_month" />
                                    <Picker.Item label="vs Last Year" value="last_year" />
                                </Picker>
                            </View>
                        </View>

                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={resetFilters}
                        >
                            <Text style={styles.resetButtonText}>Reset All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={handleApply}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
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
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
    },
    content: {
        backgroundColor: colors.surface.card,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        minHeight: '60%',
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    headerTitle: {
        ...textStyles.sectionTitle,
        fontSize: 18,
    },
    closeButton: {
        padding: spacing.xs,
    },
    scrollView: {
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...textStyles.label,
        marginBottom: spacing.sm,
        color: colors.neutral[700],
    },
    chipsContainer: {
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
    },
    chipActive: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[600],
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.neutral[700],
    },
    chipTextActive: {
        color: colors.primary[700],
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[50],
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
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[300],
        backgroundColor: colors.white,
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
        color: colors.white,
    },
});
