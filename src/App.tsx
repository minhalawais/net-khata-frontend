import type React from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import ForgotPasswordPage from "./pages/forgotPassowrdPage.tsx"
import ResetPasswordPage from "./pages/resetPasswordPage.tsx"
import EmployeeManagement from "./pages/crud_pages/employeeCrud.tsx"
import CustomerManagement from "./pages/crud_pages/customerCrud.tsx"
import ServicePlanManagement from "./pages/crud_pages/servicePlanCrud.tsx"
import Login from "./pages/login.tsx"
import ComplaintManagement from "./pages/crud_pages/complaintCrud.tsx"
import InventoryManagement from "./pages/crud_pages/inventoryCrud.tsx"
import SupplierManagement from "./pages/crud_pages/supplierCrud.tsx"
import AreaZoneManagement from "./pages/crud_pages/areaZoneCrud.tsx"
import SubZoneManagement from "./pages/crud_pages/subZoneCrud.tsx"
import VendorManagement from "./pages/crud_pages/vendorCrud.tsx"
import RecoveryTaskManagement from "./pages/crud_pages/recoveryTaskCrud.tsx"
import TaskManagement from "./pages/crud_pages/taskCrud.tsx"
import PaymentManagement from "./pages/crud_pages/paymentCrud.tsx"
import InvoiceManagement from "./pages/crud_pages/invoiceCrud.tsx"
import InvoiceGeneration from "./pages/invoiceGeneration.tsx"
import CustomerDetailPage from "./pages/customerDetailPage.tsx"
import EmployeeDetailPage from "./pages/employeeDetailPage.tsx"
import ComplaintDetailPage from "./pages/complaint-detail-page.tsx"
import ReportingPage from "./components/dashboard_components/ReportingPage.tsx"
import MessageManagement from "./pages/crud_pages/messageCrud.tsx"
import UserProfile from "./pages/userProfile.tsx"
import LogManagement from "./pages/crud_pages/logsCrud.tsx"

import ISPManagement from "./pages/crud_pages/ispCrud.tsx"
import ExpenseManagement from "./pages/crud_pages/ExpenseCrud.tsx"
import ExtraIncomeManagement from "./pages/crud_pages/ExtraIncomeCrud.tsx"
import NewComplaintPage from "./pages/ComplaintFormPage.tsx"
import TicketDisplayPage from "./pages/TicketDisplayPage.tsx"
import BankAccountManagement from "./pages/crud_pages/BankAccountCrud.tsx"
import ISPPaymentManagement from "./pages/crud_pages/ISPPaymentCrud.tsx"
import PublicInvoicePage from "./pages/PublicInvoicePage.tsx"
import { Toaster } from "sonner"
import CompanyManagement from "./pages/crud_pages/companyCrud.tsx"
import CompanyProfilePage from "./pages/companyProfilePage.tsx"
import SuperAdminOverview from "./pages/SuperAdminOverview.tsx"

// WhatsApp Messaging Pages
import WhatsAppQueueDashboard from "./pages/whatsapp/WhatsAppQueueDashboard.tsx"
import BulkMessageSender from "./pages/whatsapp/BulkMessageSender.tsx"
import WhatsAppSettings from "./pages/whatsapp/WhatsAppSettings.tsx"
import EmployeePortal from "./pages/EmployeePortal.tsx"
import CustomerPortalPage from "./pages/CustomerPortalPage.tsx"

const MANAGEMENT_ROLES = ["company_owner", "auditor"]

const getDefaultRouteByRole = (role: string) => {
  if (role === "super_admin") return "/super-admin/overview"
  if (role === "employee") return "/employee-portal"
  return "/reporting-analytics"
}


const PrivateRoute: React.FC<{ element: React.ReactElement; allowedRoles?: string[] }> = ({ element, allowedRoles }) => {
  const isAuthenticated = !!localStorage.getItem("token")
  const role = localStorage.getItem("role") || ""

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteByRole(role)} />
  }

  return element
}

const App: React.FC = () => {
  const hostname = window.location.hostname
  const isCustomerPortal = hostname.includes("customer.")

  if (isCustomerPortal) {
    return (
      <HelmetProvider>
        <Router>
          <Routes>
            <Route path="/public/invoice/:id" element={<PublicInvoicePage />} />
            <Route path="*" element={<CustomerPortalPage />} />
          </Routes>
        </Router>
      </HelmetProvider>
    )
  }

  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/employee-management" element={<PrivateRoute element={<EmployeeManagement />} allowedRoles={MANAGEMENT_ROLES} />} />

        <Route path="/employees/:id" element={<PrivateRoute element={<EmployeeDetailPage />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/customer-management" element={<PrivateRoute element={<CustomerManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/service-plan-management" element={<PrivateRoute element={<ServicePlanManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/complaint-management" element={<PrivateRoute element={<ComplaintManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/complaints/new" element={<PrivateRoute element={<NewComplaintPage />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/complaints/:id" element={<PrivateRoute element={<ComplaintDetailPage />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/complaints/ticket/:ticketNumber" element={<PrivateRoute element={<TicketDisplayPage />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/inventory-management" element={<PrivateRoute element={<InventoryManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/supplier-management" element={<PrivateRoute element={<SupplierManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/area-zone-management" element={<PrivateRoute element={<AreaZoneManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/areas" element={<PrivateRoute element={<AreaZoneManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/sub-zones-management" element={<PrivateRoute element={<SubZoneManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/areas/:areaId/sub-zones" element={<PrivateRoute element={<SubZoneManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/recovery-task-management" element={<PrivateRoute element={<RecoveryTaskManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/task-management" element={<PrivateRoute element={<TaskManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/bank-management" element={<PrivateRoute element={<BankAccountManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/payment-management" element={<PrivateRoute element={<PaymentManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/isp-payment-management" element={<PrivateRoute element={<ISPPaymentManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/billing-invoices" element={<PrivateRoute element={<InvoiceManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/invoices/:id" element={<PrivateRoute element={<InvoiceGeneration />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/customers/:id" element={<PrivateRoute element={<CustomerDetailPage />} allowedRoles={MANAGEMENT_ROLES} />} />

        {/* Reporting & Analytics Routes */}
        <Route
          path="/reporting/:section"
          element={<PrivateRoute element={<ReportingPage />} allowedRoles={MANAGEMENT_ROLES} />}
        />
        <Route
          path="/reporting-analytics"
          element={
            <PrivateRoute
              element={<Navigate to="/reporting/executive" />}
              allowedRoles={MANAGEMENT_ROLES}
            />
          }
        />
        <Route
          path="/super-admin/overview"
          element={<PrivateRoute element={<SuperAdminOverview />} allowedRoles={["super_admin"]} />}
        />
        <Route path="/message-management" element={<PrivateRoute element={<MessageManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/profile" element={<PrivateRoute element={<UserProfile />} />} />
        <Route path="/logs-management" element={<PrivateRoute element={<LogManagement />} allowedRoles={MANAGEMENT_ROLES} />} />

        <Route path="/isp-management" element={<PrivateRoute element={<ISPManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/vendor-management" element={<PrivateRoute element={<VendorManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/expense-management" element={<PrivateRoute element={<ExpenseManagement />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/extra-income-management" element={<PrivateRoute element={<ExtraIncomeManagement />} allowedRoles={MANAGEMENT_ROLES} />} />

        <Route
          path="/company-management"
          element={<PrivateRoute element={<CompanyManagement />} allowedRoles={["super_admin"]} />}
        />
        <Route
          path="/companies/:id"
          element={<PrivateRoute element={<CompanyProfilePage />} allowedRoles={["super_admin"]} />}
        />

        <Route path="/public/invoice/:id" element={<PublicInvoicePage />} />

        {/* Customer Self-Service Portal (Public - No Auth) */}
        {/* Kept here for backward compatibility or direct access via main domain if needed */}
        <Route path="/customer-portal" element={<CustomerPortalPage />} />

        {/* WhatsApp Messaging Routes */}
        <Route path="/whatsapp/queue" element={<PrivateRoute element={<WhatsAppQueueDashboard />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/whatsapp/bulk-sender" element={<PrivateRoute element={<BulkMessageSender />} allowedRoles={MANAGEMENT_ROLES} />} />
        <Route path="/whatsapp/settings" element={<PrivateRoute element={<WhatsAppSettings />} allowedRoles={MANAGEMENT_ROLES} />} />

        {/* Employee Self-Service Portal */}
        <Route path="/employee-portal" element={<PrivateRoute element={<EmployeePortal />} allowedRoles={["employee"]} />} />



        </Routes>
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          closeButton
          duration={5000}
          toastOptions={{
            className: "nk-sonner-toast",
          }}
        />
      </Router>
    </HelmetProvider>
  )
}

export default App

