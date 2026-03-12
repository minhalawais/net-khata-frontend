import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import useAuthStore from '../../stores/auth.store';
import { NetKhataLogo } from '../NetKhataLogo';
import { colors, textStyles, spacing } from '../../theme';

interface TopHeaderProps {
    title?: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ title, showBack = false, rightAction }) => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { user, role } = useAuthStore();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.leftSection}>
                {showBack ? (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.neutral[700]} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                    >
                        <Ionicons name="menu" size={24} color={colors.neutral[700]} />
                    </TouchableOpacity>
                )}

                {!showBack && (
                    <View style={styles.logoContainer}>
                        <NetKhataLogo variant="horizontal" width={100} height={30} />
                    </View>
                )}
                {showBack && title && <Text style={styles.headerTitle}>{title}</Text>}
            </View>

            <View style={styles.rightSection}>
                {rightAction}
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={22} color={colors.neutral[600]} />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileSection}
                    onPress={() => {
                        // Navigate to profile or open a bottom sheet
                        navigation.navigate('Profile' as never);
                    }}
                >
                    <View style={styles.avatarContainer} />
                    <View style={styles.profileTextContainer}>
                        <Text style={styles.profileName} numberOfLines={1}>
                            {user?.username || 'User'}
                        </Text>
                        <Text style={styles.profileRole}>
                            {role?.replace('_', ' ').toUpperCase() || 'ROLE'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={16} color={colors.neutral[500]} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
        height: 56,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: spacing.xs,
        marginRight: spacing.sm,
        borderRadius: 8,
        backgroundColor: colors.neutral[50], // Subtle hover-like effect
    },
    logoContainer: {
        justifyContent: 'center',
    },
    headerTitle: {
        ...textStyles.sectionTitle,
        fontSize: 18,
        color: colors.neutral[900],
        marginLeft: spacing.xs,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        padding: spacing.xs,
        marginRight: spacing.md,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.semantic.error,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xs,
        borderRadius: 8,
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    profileTextContainer: {
        display: 'none', // Hide text on very small screens if needed, but flex by default
        marginRight: spacing.xs,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary[800],
        maxWidth: 100,
    },
    profileRole: {
        fontSize: 10,
        color: colors.neutral[500],
    },
});
