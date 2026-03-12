import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { Searchbar, FAB, useTheme as usePaperTheme } from 'react-native-paper';
import { Screen } from './Screen';
import { TopHeader } from './navigation/TopHeader';
import { NetKhataLogo } from './NetKhataLogo';
import { EmptyState } from './data/EmptyState';
import { colors, spacing, borderRadius, textStyles } from '../theme';

interface CrudListScreenProps<T> {
    title: string;
    data: T[];
    isLoading: boolean;
    error?: string | null;
    searchQuery: string;
    onSearch: (query: string) => void;
    onRefresh: () => void;
    onLoadMore?: () => void;
    onAddButtonPress?: () => void;
    renderItem: ({ item }: { item: T }) => React.ReactElement;
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    filterComponent?: React.ReactNode;
}

export function CrudListScreen<T>({
    title,
    data,
    isLoading,
    error,
    searchQuery,
    onSearch,
    onRefresh,
    onLoadMore,
    onAddButtonPress,
    renderItem,
    keyExtractor,
    emptyMessage,
    filterComponent,
}: CrudListScreenProps<T>) {
    const paperTheme = usePaperTheme();

    return (
        <Screen style={styles.container}>
            <TopHeader title={title} />

            {/* Search Area */}
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder={`Search ${title.toLowerCase()}...`}
                    onChangeText={onSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor={colors.neutral[400]}
                    elevation={0}
                />
            </View>

            {/* Optional Filter Bar Component */}
            {filterComponent && (
                <View style={styles.filterContainer}>
                    {filterComponent}
                </View>
            )}

            {/* Main List */}
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && data.length === 0}
                        onRefresh={onRefresh}
                        colors={[colors.primary[600]]}
                        tintColor={colors.primary[600]}
                    />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <EmptyState
                            icon="folder-open-outline"
                            title={error ? "Error loading data" : "No records found"}
                            subtitle={error || (searchQuery ? `No results for "${searchQuery}"` : (emptyMessage || "Try clearing filters or adding a new record"))}
                        />
                    ) : null
                }
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                ListFooterComponent={
                    isLoading && data.length > 0 ? (
                        <View style={styles.loaderFooter}>
                            <ActivityIndicator color={colors.primary[600]} />
                        </View>
                    ) : null
                }
            />

            {/* FAB for Add New */}
            {onAddButtonPress && (
                <FAB
                    icon="plus"
                    style={styles.fab}
                    color={colors.white}
                    onPress={onAddButtonPress}
                />
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    searchContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        backgroundColor: colors.background.primary,
    },
    searchBar: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.lg,
        height: 48,
    },
    searchInput: {
        fontSize: 14,
        color: colors.neutral[900],
        minHeight: 0,
    },
    filterContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['5xl'], // Space for FAB using standards
    },
    loaderFooter: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },

    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary[600],
        borderRadius: 999,
    },
});
