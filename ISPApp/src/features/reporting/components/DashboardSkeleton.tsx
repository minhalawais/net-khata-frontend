import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../../../theme';

export const DashboardSkeleton: React.FC = () => {
    // Simple pulse animation for skeletons
    const pulseAnim = React.useRef(new Animated.Value(0.5)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.5,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const animatedStyle = {
        opacity: pulseAnim,
    };

    return (
        <View style={styles.container}>
            {/* KPI Grid Skeleton */}
            <View style={styles.grid}>
                <View style={styles.row}>
                    <Animated.View style={[styles.kpiBox, animatedStyle]} />
                    <Animated.View style={[styles.kpiBox, animatedStyle]} />
                </View>
                <View style={styles.row}>
                    <Animated.View style={[styles.kpiBox, animatedStyle]} />
                    <Animated.View style={[styles.kpiBox, animatedStyle]} />
                </View>
                <View style={styles.row}>
                    <Animated.View style={[styles.kpiBox, animatedStyle]} />
                    <Animated.View style={[styles.kpiBox, animatedStyle]} />
                </View>
                <View style={styles.row}>
                    <Animated.View style={[styles.kpiBox, animatedStyle]} />
                    <Animated.View style={[styles.kpiBox, animatedStyle]} />
                </View>
            </View>

            {/* Charts Skeleton */}
            <Animated.View style={[styles.chartBox, animatedStyle]} />
            <Animated.View style={[styles.chartBox, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
        backgroundColor: colors.background.primary,
    },
    grid: {
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    kpiBox: {
        flex: 1,
        height: 110,
        backgroundColor: colors.neutral[200],
        borderRadius: borderRadius.lg,
    },
    chartBox: {
        height: 250,
        backgroundColor: colors.neutral[200],
        borderRadius: borderRadius.lg,
        marginBottom: spacing['2xl'],
    }
});
