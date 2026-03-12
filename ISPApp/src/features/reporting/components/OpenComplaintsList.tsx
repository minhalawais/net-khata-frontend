import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ServiceSupportData } from '../types';
import { EmptyState } from '../../../components/data/EmptyState';
import { colors, spacing, borderRadius, textStyles } from '../../../theme';

interface OpenComplaintsListProps {
    complaints: ServiceSupportData['tables']['open_complaints'];
    onPressComplaint?: (id: string | number) => void;
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'open': return { bg: colors.semantic.warningLight, text: colors.semantic.warningDark };
        case 'in_progress': return { bg: colors.semantic.infoLight, text: colors.semantic.info };
        case 'resolved': return { bg: colors.semantic.successLight, text: colors.semantic.successDark };
        case 'closed': return { bg: colors.neutral[200], text: colors.neutral[700] };
        default: return { bg: colors.primary[100], text: colors.primary[700] };
    }
};

export const OpenComplaintsList = ({ complaints, onPressComplaint }: OpenComplaintsListProps) => {

    const renderItem = ({ item }: { item: ServiceSupportData['tables']['open_complaints'][0] }) => {
        const statusStyle = getStatusColor(item.status);

        return (
            <TouchableOpacity
                style={styles.listItem}
                onPress={() => onPressComplaint && onPressComplaint(item.id)}
                disabled={!onPressComplaint}
                activeOpacity={0.7}
            >
                <View style={styles.itemHeader}>
                    <View style={styles.nameContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.customer_name ? item.customer_name.charAt(0).toUpperCase() : '?'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.titleText}>{item.customer_name}</Text>
                            <Text style={styles.subtitleText}>{item.ticket_number}</Text>
                        </View>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                            {item.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                {item.assigned_to && (
                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={14} color={colors.neutral[500]} />
                        <Text style={styles.detailText}>Assigned: {item.assigned_to}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Open Complaints</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{complaints.length}</Text>
                </View>
            </View>

            {complaints.length === 0 ? (
                <EmptyState icon="checkmark-done-circle-outline" title="No Open Complaints" subtitle="Great job! All complaints are resolved." />
            ) : (
                <View style={styles.listContainer}>
                    {complaints.map(item => <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>)}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing['2xl'],
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    sectionTitle: {
        ...textStyles.sectionTitle,
    },
    countBadge: {
        backgroundColor: colors.primary[100],
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    countText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary[700],
    },
    listContainer: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    listItem: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
        marginRight: spacing.md,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary[700],
    },
    titleText: {
        ...textStyles.cardTitle,
    },
    subtitleText: {
        ...textStyles.bodySmall,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.md,
    },
    badgeText: {
        ...textStyles.badge,
        textTransform: 'uppercase',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        gap: spacing.sm,
    },
    detailText: {
        ...textStyles.bodySmall,
    }
});
