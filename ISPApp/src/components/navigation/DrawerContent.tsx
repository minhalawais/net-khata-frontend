import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Text, useTheme, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../stores/auth.store';
import { NetKhataLogo } from '../NetKhataLogo';
import { colors, textStyles, spacing, borderRadius } from '../../theme';

// Menu structure matching the web app (using Ionicons)
const menuItems = [
    {
        title: "Reporting & Analytics",
        icon: "bar-chart-outline",
        description: "Comprehensive business intelligence",
        subItems: [
            { title: "Executive Overview", route: "ExecutiveOverview", icon: "pie-chart-outline" },
            { title: "Customer Analytics", route: "CustomerAnalytics", icon: "people-outline" },
            { title: "Financial Analytics", route: "FinancialAnalytics", icon: "cash-outline" },
            { title: "Service & Support", route: "ServiceSupport", icon: "build-outline" },
            { title: "Inventory Analytics", route: "InventoryAnalytics", icon: "cube-outline" },
            { title: "Employee Performance", route: "EmployeePerformance", icon: "analytics-outline" },
            { title: "Regional Analysis", route: "RegionalAnalysis", icon: "location-outline" },
            { title: "Service Plans", route: "ServicePlans", icon: "document-text-outline" },
            { title: "Collections", route: "Collections", icon: "wallet-outline" },
            { title: "Operations", route: "Operations", icon: "pulse-outline" },
        ]
    },
    {
        title: "Vendor & Employee",
        icon: "briefcase-outline",
        description: "Vendors, employees & suppliers",
        subItems: [
            { title: "Employee Management", route: "EmployeeManagement", icon: "people-outline" },
            { title: "Vendor Management", route: "VendorManagement", icon: "storefront-outline" },
            { title: "Supplier Management", route: "SupplierManagement", icon: "car-outline" },
            { title: "ISP Management", route: "ISPManagement", icon: "git-network-outline" },
        ]
    },
    {
        title: "Customer Management",
        icon: "people-outline",
        description: "Customers & service plans",
        subItems: [
            { title: "Customer Management", route: "CustomerManagement", icon: "people-outline" },
            { title: "Service Plan Management", route: "ServicePlanManagement", icon: "document-text-outline" },
        ]
    },
    {
        title: "Payments",
        icon: "logo-usd",
        description: "Payments, billing & finances",
        subItems: [
            { title: "Payment Management", route: "PaymentManagement", icon: "card-outline" },
            { title: "ISP Payments", route: "ISPPayments", icon: "git-network-outline" },
            { title: "Billing & Invoices", route: "BillingInvoices", icon: "receipt-outline" },
            { title: "Bank Accounts", route: "BankAccounts", icon: "cash-outline" },
            { title: "Expense Management", route: "ExpenseManagement", icon: "logo-usd" },
            { title: "Extra Income", route: "ExtraIncome", icon: "trending-up-outline" },
        ]
    },
    {
        title: "Complaint Management",
        icon: "alert-circle-outline",
        description: "Complaints, tasks & recovery",
        subItems: [
            { title: "Complaint Management", route: "ComplaintManagement", icon: "alert-circle-outline" },
            { title: "Task Management", route: "TaskManagement", icon: "checkbox-outline" },
            { title: "Recovery Tasks", route: "RecoveryTasks", icon: "checkmark-done-circle-outline" },
        ]
    },
    {
        title: "Inventory Management",
        icon: "cube-outline",
        description: "Stock & equipment tracking",
        subItems: [
            { title: "Inventory Management", route: "InventoryManagement", icon: "cube-outline" },
        ]
    },
    {
        title: "Area Zone Management",
        icon: "map-outline",
        description: "Areas & sub-zones",
        subItems: [
            { title: "Area/Zone Management", route: "AreaZoneManagement", icon: "map-outline" },
            { title: "Sub-Zones", route: "SubZoneManagement", icon: "layers-outline" },
        ]
    },
    {
        title: "Admin",
        icon: "shield-checkmark-outline",
        description: "Messaging, logs & settings",
        subItems: [
            { title: "Messaging", route: "Messaging", icon: "chatbubble-ellipses-outline" },
            { title: "WhatsApp Queue", route: "WhatsAppQueue", icon: "logo-whatsapp" },
            { title: "Bulk Sender", route: "BulkSender", icon: "megaphone-outline" },
            { title: "WhatsApp Settings", route: "WhatsAppSettings", icon: "settings-outline" },
            { title: "Logs Management", route: "LogsManagement", icon: "clipboard-outline" },
        ]
    },
];

export const DrawerContent = (props: any) => {
    const theme = useTheme();
    const { logout } = useAuthStore();
    const [openGroups, setOpenGroups] = useState<string[]>([]);
    // Placeholder active route - will integrate with navigation state
    const activeRoute = props.state.routeNames[props.state.index];

    const toggleGroup = (title: string) => {
        setOpenGroups(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        );
    };

    const isGroupActive = (item: any) => {
        return item.subItems.some((sub: any) => sub.route === activeRoute);
    };

    return (
        <View style={styles.container}>
            {/* Drawer Header with Logo */}
            <View style={styles.header}>
                <NetKhataLogo variant="horizontal" width={100} height={24} />
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
                {menuItems.map((group, index) => {
                    const isExpanded = openGroups.includes(group.title);
                    const isActive = isGroupActive(group);

                    return (
                        <View key={index} style={styles.groupContainer}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => toggleGroup(group.title)}
                                style={[
                                    styles.groupHeader,
                                    isActive && styles.groupHeaderActive,
                                    isExpanded && !isActive && styles.groupHeaderExpanded
                                ]}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    isActive ? styles.iconContainerActive : styles.iconContainerInactive
                                ]}>
                                    <Ionicons
                                        name={group.icon as any}
                                        size={24}
                                        color={isActive ? colors.white : colors.primary[600]}
                                    />
                                </View>

                                <View style={styles.groupTextContainer}>
                                    <Text style={[
                                        styles.groupTitle,
                                        isActive ? styles.groupTitleActive : styles.groupTitleInactive
                                    ]}>
                                        {group.title}
                                    </Text>
                                    <Text style={[
                                        styles.groupDescription,
                                        isActive ? styles.groupDescriptionActive : styles.groupDescriptionInactive
                                    ]} numberOfLines={1}>
                                        {group.description}
                                    </Text>
                                </View>

                                <Ionicons
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={16}
                                    color={isActive ? colors.primary[100] : colors.neutral[400]}
                                />
                            </TouchableOpacity>

                            {/* Sub Items */}
                            {isExpanded && (
                                <View style={styles.subItemsContainer}>
                                    {group.subItems.map((subItem, subIndex) => {
                                        const isSubActive = activeRoute === subItem.route;
                                        return (
                                            <TouchableOpacity
                                                key={subIndex}
                                                style={[
                                                    styles.subItem,
                                                    isSubActive && styles.subItemActive
                                                ]}
                                                onPress={() => props.navigation.navigate(subItem.route)}
                                            >
                                                <Ionicons
                                                    name={subItem.icon as any}
                                                    size={16}
                                                    color={isSubActive ? colors.primary[600] : colors.neutral[400]}
                                                    style={styles.subItemIcon}
                                                />
                                                <Text style={[
                                                    styles.subItemText,
                                                    isSubActive ? styles.subItemTextActive : styles.subItemTextInactive
                                                ]}>
                                                    {subItem.title}
                                                </Text>

                                                {isSubActive && <View style={styles.activeIndicator} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    );
                })}
            </DrawerContentScrollView>

            {/* Footer with Logout */}
            <View style={styles.footer}>
                <Divider style={styles.divider} />
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.neutral[500]} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        paddingTop: spacing['4xl'],
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    groupContainer: {
        marginBottom: spacing.xs,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    groupHeaderActive: {
        backgroundColor: colors.primary[600],
    },
    groupHeaderExpanded: {
        backgroundColor: colors.neutral[100],
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    iconContainerInactive: {
        backgroundColor: colors.primary[50],
    },
    iconContainerActive: {
        backgroundColor: 'transparent',
    },
    groupTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    groupTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    groupTitleInactive: {
        color: colors.neutral[700],
    },
    groupTitleActive: {
        color: colors.white,
    },
    groupDescription: {
        fontSize: 11,
        marginTop: 2,
    },
    groupDescriptionInactive: {
        color: colors.neutral[400],
    },
    groupDescriptionActive: {
        color: colors.primary[100],
    },
    subItemsContainer: {
        marginTop: spacing.xs,
        marginLeft: spacing.xl + 18, // Aligned with text
        paddingLeft: spacing.md,
        borderLeftWidth: 1,
        borderLeftColor: colors.neutral[200],
    },
    subItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: 2,
    },
    subItemActive: {
        backgroundColor: colors.primary[50],
    },
    subItemIcon: {
        marginRight: spacing.sm,
    },
    subItemText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    subItemTextInactive: {
        color: colors.neutral[600],
    },
    subItemTextActive: {
        color: colors.primary[700],
    },
    activeIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary[500],
    },
    footer: {
        padding: spacing.lg,
        backgroundColor: colors.white,
    },
    divider: {
        marginBottom: spacing.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
    },
    logoutText: {
        marginLeft: spacing.sm,
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[600],
    },
});
