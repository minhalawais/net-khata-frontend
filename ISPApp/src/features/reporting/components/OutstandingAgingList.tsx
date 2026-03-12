import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { CollectionsAnalyticsData } from '../types';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../../theme';

interface OutstandingAgingListProps {
    data: CollectionsAnalyticsData['outstandingByAgeData'];
}

export const OutstandingAgingList: React.FC<OutstandingAgingListProps> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAndSortedData = useMemo(() => {
        if (!data) return [];
        return data
            .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => b.value - a.value);
    }, [data, searchTerm]);

    const totalValue = useMemo(() => {
        if (!data) return 0;
        return data.reduce((sum, item) => sum + item.value, 0);
    }, [data]);

    const getAgeColor = (name: string) => {
        if (name.includes('90+') || name.includes('Over')) return colors.semantic.error;
        if (name.includes('60-89') || name.includes('60+')) return colors.semantic.warning;
        if (name.includes('30-59')) return colors.primary[500];
        return colors.semantic.success;
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
        const color = getAgeColor(item.name);

        return (
            <View style={styles.card}>
                <View style={[styles.indexBadge, { backgroundColor: color }]}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.valueText}>Rs {item.value.toLocaleString()}</Text>
                            <Text style={styles.percentageText}>({percentage.toFixed(1)}%)</Text>
                        </View>
                    </View>

                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={textStyles.sectionTitle}>Outstanding by Age Analysis</Text>
                <Text style={styles.subtitle}>
                    Outstanding amounts categorized by aging periods
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.neutral[500]} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search age groups..."
                    placeholderTextColor={colors.neutral[400]}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            <FlatList
                data={filteredAndSortedData}
                keyExtractor={(item) => item.name}
                renderItem={renderItem}
                scrollEnabled={false} // Since this is placed inside a ScrollView parent
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No age groups match your search.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        marginBottom: spacing.xl,
    },
    header: {
        marginBottom: spacing.md,
    },
    subtitle: {
        ...textStyles.bodySmall,
        color: colors.neutral[500],
        marginTop: spacing.xs,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.lg,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        height: 48,
        ...textStyles.body,
        color: colors.neutral[900],
    },
    separator: {
        height: spacing.sm,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[50], // Base, will highlight on press if wrapped in Touchable
    },
    indexBadge: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    indexText: {
        ...textStyles.label,
        color: colors.neutral[50],
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    itemName: {
        ...textStyles.bodySmall,
        color: colors.neutral[900],
        flex: 1,
        marginRight: spacing.sm,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    valueText: {
        ...textStyles.label,
        color: colors.neutral[900],
        fontWeight: '700',
    },
    percentageText: {
        ...textStyles.bodySmall,
        color: colors.neutral[500],
    },
    progressTrack: {
        height: 6,
        backgroundColor: colors.neutral[200],
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...textStyles.body,
        color: colors.neutral[500],
    },
});
