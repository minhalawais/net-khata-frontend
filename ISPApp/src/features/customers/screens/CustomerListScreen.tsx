import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CustomerCard } from '../components/CustomerCard';
import { CustomerFilterBar } from '../components/CustomerFilterBar';
import { useCustomers } from '../hooks/useCustomers';
import { Customer } from '../types';
import { CrudListScreen } from '../../../components/CrudListScreen';

export const CustomerListScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const {
    data,
    isLoading,
    error,
    refresh,
    loadMore,
  } = useCustomers();

  // Handle local filtering for now if the hook doesn't support it directly
  const filteredData = React.useMemo(() => {
    let result = data;
    if (selectedStatus !== 'all') {
      result = result.filter(c => (c.status || 'inactive').toLowerCase() === selectedStatus.toLowerCase());
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.first_name?.toLowerCase().includes(lowerQuery) || '') ||
        (c.last_name?.toLowerCase().includes(lowerQuery) || '') ||
        (c.internet_id?.toLowerCase().includes(lowerQuery) || '') ||
        (c.phone_1?.includes(lowerQuery) || '')
      );
    }
    return result;
  }, [data, selectedStatus, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (status: string) => {
    setSelectedStatus(status);
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <CustomerCard
      customer={item}
      onPress={(customer) => console.log('Navigate to Customer Detail', customer.id)}
    />
  );

  return (
    <View style={styles.container}>
      <CrudListScreen<Customer>
        title="Customer Management"
        data={filteredData}
        isLoading={isLoading}
        error={error}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onRefresh={refresh}
        onLoadMore={loadMore}
        onAddButtonPress={() => console.log('Navigate to Add Customer')}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        emptyMessage="No customers found"
        filterComponent={
          <CustomerFilterBar
            selectedStatus={selectedStatus}
            onSelectStatus={handleFilter}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
