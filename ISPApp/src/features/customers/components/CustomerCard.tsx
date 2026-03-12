import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../../theme';
import { Customer } from '../types';

interface CustomerCardProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onPress }) => {

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return colors.semantic.success;
      case 'inactive': return colors.neutral[400];
      case 'suspended': return colors.semantic.error;
      default: return colors.primary[500];
    }
  };

  const statusColor = getStatusColor(customer.status || 'inactive');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(customer)}
      activeOpacity={0.7}
      testID={`customer-card-${customer.id}`}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(customer.first_name?.[0] || '').toUpperCase()}
              {(customer.last_name?.[0] || '').toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={1}>
              {customer.first_name} {customer.last_name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {customer.internet_id || 'No ID'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: statusColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {customer.status || 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="map-outline" size={14} color={colors.neutral[400]} />
            <Text style={styles.detailText} numberOfLines={1}>
              {customer.area || 'No Area Assigned'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="flash-outline" size={14} color={colors.neutral[400]} />
            <Text style={styles.detailText} numberOfLines={1}>
              {customer.service_plan || 'No Plan'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color={colors.neutral[400]} />
            <Text style={styles.detailText} numberOfLines={1}>
              {customer.phone_1 || 'No Phone'}
            </Text>
          </View>
        </View>
      </View>
      {onPress && (
        <View style={styles.cardChevron}>
          <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
        </View>
      )}
    </TouchableOpacity>
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
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardChevron: {
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.primary[700],
    fontWeight: '700',
    fontSize: 14,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: colors.white,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.sm,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: colors.neutral[600],
  },
});
