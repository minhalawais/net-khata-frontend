import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';
import { View, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { CustomerListScreen } from '../features/customers/screens/CustomerListScreen';
import { ExecutiveDashboardScreen } from '../features/reporting/screens/ExecutiveDashboardScreen';
import { CustomerAnalyticsScreen } from '../features/reporting/screens/CustomerAnalyticsScreen';
import { FinancialAnalyticsScreen } from '../features/reporting/screens/FinancialAnalyticsScreen';
import { ServiceSupportScreen } from '../features/reporting/screens/ServiceSupportScreen';
import { InventoryAnalyticsScreen } from '../features/reporting/screens/InventoryAnalyticsScreen';
import { EmployeeAnalyticsScreen } from '../features/reporting/screens/EmployeeAnalyticsScreen';
import { RegionalAnalyticsScreen } from '../features/reporting/screens/RegionalAnalyticsScreen';
import { CollectionsAnalyticsScreen } from '../features/reporting/screens/CollectionsAnalyticsScreen';
import { ServicePlanAnalyticsScreen } from '../features/reporting/screens/ServicePlanAnalyticsScreen';
import { OperationsAnalyticsScreen } from '../features/reporting/screens/OperationsAnalyticsScreen';
import { DrawerContent } from '../components/navigation/DrawerContent';
import { TopHeader } from '../components/navigation/TopHeader';

import { NetKhataLogo } from '../components/NetKhataLogo';
import { colors } from '../theme';

// --- Placeholder Screens for all Drawer Items ---
const PlaceholderScreen = ({ route }: any) => (
  <Screen>
    <View style={{ flex: 1 }}>
      <TopHeader title={route.name} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <NetKhataLogo variant="stacked" width={150} height={100} color={colors.primary[700]} />
        <Text style={{ marginTop: 20, fontSize: 18, color: colors.neutral[500] }}>
          {route.name} Coming Soon
        </Text>
      </View>
    </View>
  </Screen>
);

export type MainDrawerParamList = {
  // Reporting & Analytics
  ExecutiveOverview: undefined;
  CustomerAnalytics: undefined;
  FinancialAnalytics: undefined;
  ServiceSupport: undefined;
  InventoryAnalytics: undefined;
  EmployeePerformance: undefined;
  RegionalAnalysis: undefined;
  ServicePlans: undefined;
  Collections: undefined;
  Operations: undefined;

  // Vendor & Employee
  EmployeeManagement: undefined;
  VendorManagement: undefined;
  SupplierManagement: undefined;
  ISPManagement: undefined;

  // Customer Management
  CustomerManagement: undefined;
  ServicePlanManagement: undefined;

  // Payments
  PaymentManagement: undefined;
  ISPPayments: undefined;
  BillingInvoices: undefined;
  BankAccounts: undefined;
  ExpenseManagement: undefined;
  ExtraIncome: undefined;

  // Complaint Management
  ComplaintManagement: undefined;
  TaskManagement: undefined;
  RecoveryTasks: undefined;

  // Inventory Management
  InventoryManagement: undefined;

  // Area Zone Management
  AreaZoneManagement: undefined;
  SubZoneManagement: undefined;

  // Admin
  Messaging: undefined;
  WhatsAppQueue: undefined;
  BulkSender: undefined;
  WhatsAppSettings: undefined;
  LogsManagement: undefined;

  // Other profile
  Profile: undefined;
};

const Drawer = createDrawerNavigator<MainDrawerParamList>();

// Render CustomerListScreen WITH a TopHeader
const CustomerWrapper = () => (
  <Screen>
    <View style={{ flex: 1 }}>
      <TopHeader title="Customer Management" />
      <CustomerListScreen />
    </View>
  </Screen>
);

export const MainNavigator = () => {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      id={undefined}
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 300,
        },
      }}
      initialRouteName="ExecutiveOverview"
    >
      {/* Reporting & Analytics */}
      <Drawer.Screen name="ExecutiveOverview" component={ExecutiveDashboardScreen} />
      <Drawer.Screen name="CustomerAnalytics" component={CustomerAnalyticsScreen} />
      <Drawer.Screen name="FinancialAnalytics" component={FinancialAnalyticsScreen} />
      <Drawer.Screen name="ServiceSupport" component={ServiceSupportScreen} />
      {/* Phase 1.5 - Inventory Analytics */}
      <Drawer.Screen
        name="InventoryAnalytics"
        component={InventoryAnalyticsScreen}
      />
      {/* Phase 1.6 - Employee Performance Analytics */}
      <Drawer.Screen name="EmployeePerformance" component={EmployeeAnalyticsScreen} />
      {/* Phase 1.7 - Regional Analysis */}
      <Drawer.Screen name="RegionalAnalysis" component={RegionalAnalyticsScreen} />
      <Drawer.Screen name="ServicePlans" component={ServicePlanAnalyticsScreen} />
      <Drawer.Screen name="Collections" component={CollectionsAnalyticsScreen} />
      <Drawer.Screen name="Operations" component={OperationsAnalyticsScreen} />

      {/* Vendor & Employee */}
      <Drawer.Screen name="EmployeeManagement" component={PlaceholderScreen} />
      <Drawer.Screen name="VendorManagement" component={PlaceholderScreen} />
      <Drawer.Screen name="SupplierManagement" component={PlaceholderScreen} />
      <Drawer.Screen name="ISPManagement" component={PlaceholderScreen} />

      {/* Customer Management */}
      <Drawer.Screen name="CustomerManagement" component={CustomerWrapper} />
      <Drawer.Screen name="ServicePlanManagement" component={PlaceholderScreen} />

      {/* Payments */}
      <Drawer.Screen name="PaymentManagement" component={PlaceholderScreen} />
      <Drawer.Screen name="ISPPayments" component={PlaceholderScreen} />
      <Drawer.Screen name="BillingInvoices" component={PlaceholderScreen} />
      <Drawer.Screen name="BankAccounts" component={PlaceholderScreen} />
      <Drawer.Screen name="ExpenseManagement" component={PlaceholderScreen} />
      <Drawer.Screen name="ExtraIncome" component={PlaceholderScreen} />

      {/* Complaints */}
      <Drawer.Screen name="ComplaintManagement" component={PlaceholderScreen} />
      <Drawer.Screen name="TaskManagement" component={PlaceholderScreen} />
      <Drawer.Screen name="RecoveryTasks" component={PlaceholderScreen} />

      {/* Inventory */}
      <Drawer.Screen name="InventoryManagement" component={PlaceholderScreen} />

      {/* Area Zones */}
      <Drawer.Screen name="AreaZoneManagement" component={PlaceholderScreen} />
      <Drawer.Screen name="SubZoneManagement" component={PlaceholderScreen} />

      {/* Admin */}
      <Drawer.Screen name="Messaging" component={PlaceholderScreen} />
      <Drawer.Screen name="WhatsAppQueue" component={PlaceholderScreen} />
      <Drawer.Screen name="BulkSender" component={PlaceholderScreen} />
      <Drawer.Screen name="WhatsAppSettings" component={PlaceholderScreen} />
      <Drawer.Screen name="LogsManagement" component={PlaceholderScreen} />

      {/* Misc */}
      <Drawer.Screen name="Profile" component={PlaceholderScreen} />
    </Drawer.Navigator>
  );
};
