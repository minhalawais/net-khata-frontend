import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ServiceSupportData } from '../types';
import { EmptyState } from '../../../components/data/EmptyState';
import { colors, spacing, borderRadius, textStyles } from '../../../theme';

interface TechnicianPerformanceListProps {
    technicians: ServiceSupportData['tables']['technician_summary'];
}

export const TechnicianPerformanceList = ({ technicians }: TechnicianPerformanceListProps) => {

    const renderItem = (item: ServiceSupportData['tables']['technician_summary'][0]) => {
        return (
            <View key={item.id} style={styles.card}>
                {/* Tech Name & Icon */}
                <View style={styles.headerRow}>
                    <View style={styles.techInfo}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={20} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.techName}>{item.name}</Text>
                    </View>
                    <View style={styles.csatBadge}>
                        <Ionicons name="star" size={14} color={colors.semantic.warning} />
                        <Text style={styles.csatText}>{parseFloat(item.csat_score as any).toFixed(1)}</Text>
                    </View>
                </View>

                {/* Metrics */}
                <View style={styles.metricsContainer}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Resolved</Text>
                        <Text style={styles.metricValueSuccess}>{item.resolved}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Avg Time</Text>
                        <Text style={styles.metricValue}>{item.avg_resolution_hours}h</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Technician Performance</Text>
            </View>

            {technicians.length === 0 ? (
                <EmptyState icon="people-outline" title="No Technician Data" subtitle="No resolution logs found for the selected dates." />
            ) : (
                <View style={styles.listContainer}>
                    {technicians.map(tech => renderItem(tech))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing['2xl'],
        marginBottom: spacing['4xl']
    },
    sectionHeader: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...textStyles.sectionTitle,
    },
    listContainer: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    techInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    techName: {
        ...textStyles.cardTitle,
    },
    csatBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.semantic.warningLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    csatText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.semantic.warningDark,
    },
    metricsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: colors.neutral[200],
    },
    metricLabel: {
        ...textStyles.label,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    metricValueSuccess: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.semantic.successDark,
    }
});
