import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { FilterState } from '../types';
import { colors, spacing, borderRadius, shadows, typography } from '../../../theme';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    filters: FilterState;
    onApply: (newFilters: Partial<FilterState>) => void;
    options: {
        areas?: { id: string; name: string }[];
        isps?: { id: string; name: string }[];
    };
}

export const DashboardFilterModal: React.FC<FilterModalProps> = ({
    visible,
    onClose,
    filters,
    onApply,
    options
}) => {
    const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

    // Sync when opened
    React.useEffect(() => {
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
            areaId: 'all',
            ispId: 'all'
        }));
    };

    const timeRanges = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'Last 7 Days' },
        { id: 'mtd', label: 'Month to Date' },
        { id: 'qtd', label: 'Quarter to Date' },
        { id: 'ytd', label: 'Year to Date' },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Filters</Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: spacing.xs }}>
                            <Ionicons name="close" size={24} color={colors.neutral[700]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Time Range */}
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

                        {/* Area Filter */}
                        <Text style={styles.sectionTitle}>Area Configuration</Text>
                        <View style={styles.selectBox}>
                            <Text style={styles.selectLabel}>Area</Text>
                            <TouchableOpacity style={styles.selectTrigger}>
                                <Text style={styles.selectValue}>
                                    {localFilters.areaId === 'all'
                                        ? 'All Areas'
                                        : options.areas?.find(a => a.id === localFilters.areaId)?.name || 'Selected'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.neutral[400]} />
                            </TouchableOpacity>
                        </View>

                        {/* ISP Filter */}
                        <View style={styles.selectBox}>
                            <Text style={styles.selectLabel}>ISP</Text>
                            <TouchableOpacity style={styles.selectTrigger}>
                                <Text style={styles.selectValue}>
                                    {localFilters.ispId === 'all'
                                        ? 'All ISPs'
                                        : options.isps?.find(a => a.id === localFilters.ispId)?.name || 'Selected'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={colors.neutral[400]} />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Actions */}
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
        paddingHorizontal: spacing['2xl'],
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.neutral[900],
    },
    content: {
        paddingHorizontal: spacing['2xl'],
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
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
    selectBox: {
        marginBottom: spacing.md,
    },
    selectLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.neutral[500],
        marginBottom: spacing.xs,
    },
    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        height: 48,
        backgroundColor: colors.surface.input,
    },
    selectValue: {
        fontSize: 14,
        color: colors.neutral[800],
    },
    actions: {
        flexDirection: 'row',
        padding: spacing['2xl'],
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
