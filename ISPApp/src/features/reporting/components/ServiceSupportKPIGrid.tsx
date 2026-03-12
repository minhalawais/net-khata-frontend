import React from 'react';
import { View as RNView, Text as RNText, StyleSheet as RNStyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ServiceSupportData } from '../types';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../../theme';

interface KPICardProps {
    title: string;
    value: string | number;
    trend: number;
    isPositive: boolean;
    icon: string;
    iconBgColor: string;
    iconColor: string;
    invertTrend?: boolean;
}

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = (screenWidth - spacing.lg * 2 - spacing.md) / 2;

const KPICard = ({ title, value, trend, isPositive, icon, iconBgColor, iconColor, invertTrend = false }: KPICardProps) => {
    const displayPositive = invertTrend ? !isPositive : isPositive;
    const trendColor = displayPositive ? colors.semantic.success : colors.semantic.error;

    return (
        <RNView style={styles.card}>
            <RNView style={styles.cardHeader}>
                <RNView style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                    <Ionicons name={icon} size={24} color={iconColor} />
                </RNView>
                {trend !== 0 && (
                    <RNView style={[
                        styles.trendBadge,
                        { backgroundColor: displayPositive ? colors.semantic.successLight : colors.semantic.errorLight }
                    ]}>
                        <Ionicons
                            name={displayPositive ? "trending-up" : "trending-down"}
                            size={12}
                            color={displayPositive ? colors.semantic.successDark : colors.semantic.errorDark}
                        />
                        <RNText style={[styles.trendText, { color: displayPositive ? colors.semantic.successDark : colors.semantic.errorDark }]}>
                            {Math.abs(trend).toFixed(1)}%
                        </RNText>
                    </RNView>
                )}
            </RNView>
            <RNText style={styles.value} numberOfLines={1}>{value}</RNText>
            <RNText style={styles.title} numberOfLines={1}>{title}</RNText>
        </RNView>
    );
};

interface ServiceSupportKPIGridProps {
    kpis: ServiceSupportData['kpis'];
}

export const ServiceSupportKPIGrid = ({ kpis }: ServiceSupportKPIGridProps) => {
    return (
        <RNView style={styles.container}>
            <RNView style={styles.row}>
                <KPICard
                    title="Total Complaints"
                    value={kpis.total_complaints.value}
                    trend={kpis.total_complaints.trend}
                    isPositive={kpis.total_complaints.is_positive}
                    icon="alert-circle-outline"
                    iconBgColor={colors.semantic.warningLight}
                    iconColor={colors.semantic.warningDark}
                    invertTrend
                />
                <KPICard
                    title="Open Complaints"
                    value={kpis.open_complaints.value}
                    trend={kpis.open_complaints.trend}
                    isPositive={kpis.open_complaints.is_positive}
                    icon="warning-outline"
                    iconBgColor={colors.semantic.errorLight}
                    iconColor={colors.semantic.errorDark}
                    invertTrend
                />
            </RNView>
            <RNView style={styles.row}>
                <KPICard
                    title="Avg Resolution"
                    value={`${kpis.avg_resolution_time.value}h`}
                    trend={kpis.avg_resolution_time.trend}
                    isPositive={kpis.avg_resolution_time.is_positive}
                    icon="time-outline"
                    iconBgColor={colors.semantic.infoLight}
                    iconColor={colors.semantic.info}
                    invertTrend
                />
                <KPICard
                    title="First Contact Res %"
                    value={`${kpis.fcr_rate.value}%`}
                    trend={kpis.fcr_rate.trend}
                    isPositive={kpis.fcr_rate.is_positive}
                    icon="checkmark-circle-outline"
                    iconBgColor={colors.semantic.successLight}
                    iconColor={colors.semantic.successDark}
                />
            </RNView>
            <RNView style={styles.row}>
                <KPICard
                    title="Satisfaction"
                    value={`${kpis.avg_satisfaction.value}/5`}
                    trend={kpis.avg_satisfaction.trend}
                    isPositive={kpis.avg_satisfaction.is_positive}
                    icon="star-outline"
                    iconBgColor={colors.semantic.warningLight}
                    iconColor={colors.semantic.warningDark}
                />
                <KPICard
                    title="SLA Compliance"
                    value={`${kpis.sla_compliance.value}%`}
                    trend={kpis.sla_compliance.trend}
                    isPositive={kpis.sla_compliance.is_positive}
                    icon="shield-checkmark-outline"
                    iconBgColor={colors.semantic.successLight}
                    iconColor={colors.semantic.successDark}
                />
            </RNView>
            <RNView style={styles.row}>
                <KPICard
                    title="Pending Tasks"
                    value={kpis.pending_tasks.value}
                    trend={0}
                    isPositive={kpis.pending_tasks.is_positive}
                    icon="list-outline"
                    iconBgColor={colors.semantic.infoLight}
                    iconColor={colors.semantic.info}
                />
                <KPICard
                    title="Overdue Tasks"
                    value={kpis.overdue_tasks.value}
                    trend={0}
                    isPositive={kpis.overdue_tasks.is_positive}
                    icon="alert-circle-outline"
                    iconBgColor={colors.semantic.errorLight}
                    iconColor={colors.semantic.errorDark}
                />
            </RNView>
        </RNView>
    );
};

const styles = RNStyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        gap: 2,
    },
    trendText: {
        fontSize: 10,
        fontWeight: '600',
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.neutral[900],
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    title: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.neutral[500],
    }
});
