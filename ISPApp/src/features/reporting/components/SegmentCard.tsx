import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, textStyles } from '../../../theme';

interface SegmentCardProps {
    label: string;
    count: number;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    style?: any;
}

export const SegmentCard: React.FC<SegmentCardProps> = ({ label, count, color, icon, style }) => {
    // Add 20% opacity wrapper color for the icon background
    // We do a simple hex replacement assuming our semantic tokens are standard hex
    const bgColor = color.length === 7 ? `${color}20` : colors.neutral[100];

    return (
        <View style={[styles.card, style]}>
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.countText}>
                    {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toLocaleString()}
                </Text>
                <Text style={styles.labelText} numberOfLines={1}>{label}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    countText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.neutral[900],
        lineHeight: 24,
    },
    labelText: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.neutral[500],
    }
});
