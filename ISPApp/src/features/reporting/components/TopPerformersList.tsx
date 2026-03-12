import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmployeeAnalyticsData } from '../types';
import { colors, spacing, textStyles, borderRadius, shadows } from '../../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface TopPerformersListProps {
    performers: EmployeeAnalyticsData['tables']['top_performers'];
}

export const TopPerformersList: React.FC<TopPerformersListProps> = ({ performers }) => {
    if (!performers || performers.length === 0) {
        return (
            <View style={[styles.card, styles.emptyCard]}>
                <Ionicons name="people-outline" size={32} color={colors.neutral[400]} />
                <Text style={[styles.cardTitle, { marginTop: spacing.sm }]}>No Data Found</Text>
                <Text style={textStyles.bodySmall}>Performance data is not available yet.</Text>
            </View>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.cardTitle}>Performance Summary</Text>
            </View>

            <View style={styles.list}>
                {performers.map((employee, index) => (
                    <View
                        key={employee.id}
                        style={[
                            styles.row,
                            index !== performers.length - 1 && styles.borderBottom
                        ]}
                    >
                        <View style={styles.employeeInfo}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {employee.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.nameRoleContainer}>
                                <Text style={textStyles.label} numberOfLines={1}>{employee.name}</Text>
                                <Text style={textStyles.bodySmall} numberOfLines={1}>{employee.role.toUpperCase()}</Text>
                            </View>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statChip}>
                                <Text style={styles.statLabel}>Tasks</Text>
                                <Text style={styles.statValue}>{employee.tasks}</Text>
                            </View>
                            <View style={[styles.statChip, { alignItems: 'flex-end' }]}>
                                <Text style={styles.statLabel}>CSAT</Text>
                                <View style={styles.csatRow}>
                                    <Ionicons name="star" size={10} color={colors.semantic.warning} style={{ marginTop: 1 }} />
                                    <Text style={styles.statValue}>{employee.satisfaction}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        ...shadows.sm,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
    },
    header: {
        marginBottom: spacing.md,
    },
    cardTitle: {
        ...textStyles.sectionTitle,
    },
    list: {
        gap: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    employeeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1.5,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: colors.primary[700],
        fontSize: 16,
        fontWeight: '700',
    },
    nameRoleContainer: {
        flex: 1,
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.lg,
    },
    statChip: {
        alignItems: 'center'
    },
    statLabel: {
        fontSize: 10,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    csatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    }
});
