import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { EmptyState } from '../../../components/data/EmptyState';

interface Props {
  message?: string;
  onAction?: () => void;
}

export const CustomerListEmpty: React.FC<Props> = ({ message = 'No customers found', onAction }) => {
  return (
    <EmptyState
      icon="people-outline"
      title="No Customers Found"
      subtitle="Try adjusting your filters or search terms."
      actionLabel={onAction ? "Clear Search" : undefined} // Assuming "Clear Search" is a common action for empty states
      onActionPress={onAction}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral[50], // Very light gray
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 4,
  },
  subMessage: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    maxWidth: 240,
  },
});
