import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../../theme';

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: number;
    isPositive?: boolean;
    icon: string;
    color: string;
    suffix?: string;
    invertTrend?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    trend,
    isPositive,
    icon,
    color,
    suffix = '',
    invertTrend = false
}) => {
    // If we have a trend, determine display logic
    const hasTrend = trend !== undefined && trend !== 0;
    const displayPositive = invertTrend ? !isPositive : isPositive;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: color }]}>
                    <Ionicons name={icon as any} size={20} color={colors.white} />
                </View>
                {hasTrend && (
                    <View style={[
                        styles.trendBadge,
                        { backgroundColor: displayPositive ? colors.semantic.successLight : colors.semantic.errorLight }
                    ]}>
                        <Ionicons
                            name={displayPositive ? 'trending-up' : 'trending-down'}
                            size={12}
                            color={displayPositive ? colors.semantic.successDark : colors.semantic.errorDark}
                        />
                        <Text style={[
                            styles.trendText,
                            { color: displayPositive ? colors.semantic.successDark : colors.semantic.errorDark }
                        ]}>
                            {Math.abs(trend!).toFixed(1)}%
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.value} numberOfLines={1}>{value}{suffix}</Text>
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
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    trendText: {
        fontSize: 10,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.xs,
    },
    value: {
        ...textStyles.statValue,
        fontSize: 24, // slightly smaller than default 30 for grid layout
    },
});
