import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../../theme';

interface KPIGridProps {
    children: React.ReactNode;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ children }) => {
    return (
        <View style={styles.grid}>
            {children}
        </View>
    );
};

export const KPIRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <View style={styles.row}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    }
});
