import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';

interface EmptyStateProps {
    icon?: string;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'folder-open-outline',
    title,
    subtitle,
    actionLabel,
    onActionPress,
}) => {
    return (
        <View style={styles.container}>
            <Ionicons name={icon as any} size={48} color={colors.neutral[300]} style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {actionLabel && onActionPress && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={onActionPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['4xl'],
        paddingHorizontal: spacing.lg,
    },
    icon: {
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[700],
        textAlign: 'center',
        marginBottom: spacing.xs,
        maxWidth: 260,
    },
    subtitle: {
        fontSize: 14,
        color: colors.neutral[400],
        textAlign: 'center',
        maxWidth: 260,
        marginBottom: spacing.lg,
    },
    button: {
        backgroundColor: colors.primary[50],
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    buttonText: {
        color: colors.primary[600],
        fontSize: 14,
        fontWeight: '600',
    },
});
