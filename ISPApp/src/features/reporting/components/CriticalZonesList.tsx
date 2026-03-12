import React from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../../theme';
import { RegionalAnalyticsData } from '../types';

interface CriticalZonesListProps {
    data: RegionalAnalyticsData['tables']['critical_zones'];
}

export const CriticalZonesList: React.FC<CriticalZonesListProps> = ({ data }) => {
    const renderItem: ListRenderItem<RegionalAnalyticsData['tables']['critical_zones'][0]> = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={textStyles.body}>{item.area}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Action Needed</Text>
                </View>
            </View>
            <View style={styles.content}>
                <Text style={textStyles.bodySmall}>{item.issue}: </Text>
                <Text style={[textStyles.bodySmall, { fontWeight: '700', color: colors.neutral[900] }]}>{item.value}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Supervisor: {item.supervisor}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Ionicons name="warning-outline" size={24} color={colors.semantic.error} />
                <Text style={[textStyles.sectionTitle, { marginLeft: spacing.sm }]}>Critical Zones</Text>
            </View>
            <FlatList
                data={data}
                keyExtractor={(item, index) => `${item.area}-${index}`}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={
                    <View style={styles.emptyWrapper}>
                        <Text style={{ color: colors.neutral[500], textAlign: 'center' }}>No critical zones identified</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    listContainer: {
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.semantic.errorLight,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: '#fee2e2', // slight red boundary
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    badge: {
        backgroundColor: '#fee2e2', // red-100 equivalent
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.semantic.errorDark,
    },
    content: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    footer: {
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#fee2e2',
    },
    footerText: {
        fontSize: 11,
        color: colors.neutral[500],
    },
    emptyWrapper: {
        paddingVertical: spacing.xl,
    }
});
