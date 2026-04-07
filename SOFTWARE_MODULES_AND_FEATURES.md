# NET KHATA Software Modules and Features

## Introduction
NET KHATA is an integrated ISP operations platform for subscriber lifecycle management, billing and recovery, field service operations, network monitoring, inventory control, financial intelligence, employee workflows, and WhatsApp-based customer communication. The software is built with a React + TypeScript frontend and a Flask + PostgreSQL backend, with Evolution API integration for WhatsApp automation.

## Frontend Modules (Page-Based)

| Module Name | Frontend Page | Core Features |
|---|---|---|
| Authentication - Login | src/pages/login.tsx | User login, token-based session start, role-based app access entry |
| Authentication - Forgot Password | src/pages/forgotPassowrdPage.tsx | Password reset request flow |
| Authentication - Reset Password | src/pages/resetPasswordPage.tsx | Reset password using tokenized link |
| Employee Management | src/pages/crud_pages/employeeCrud.tsx | Employee CRUD, role assignment, employment data, staff record management |
| Employee Detail | src/pages/employeeDetailPage.tsx | Employee profile detail, operational history, compensation context |
| Employee Portal | src/pages/EmployeePortal.tsx | Employee self-service dashboard and assigned work context |
| Customer Management | src/pages/crud_pages/customerCrud.tsx | Customer CRUD, connection profile, service and installation data |
| Customer Detail | src/pages/customerDetailPage.tsx | Subscriber full profile, billing and complaint context |
| Customer Portal | src/pages/CustomerPortalPage.tsx | Customer self-service access, invoice and account view |
| Service Plan Management | src/pages/crud_pages/servicePlanCrud.tsx | ISP package CRUD, pricing, speed/data plan definitions |
| Complaint Management | src/pages/crud_pages/complaintCrud.tsx | Complaint CRUD, assignment, status tracking |
| New Complaint Form | src/pages/ComplaintFormPage.tsx | New complaint submission workflow |
| Complaint Detail | src/pages/complaint-detail-page.tsx | Complaint lifecycle detail, actions, and resolution context |
| Ticket Display | src/pages/TicketDisplayPage.tsx | Complaint ticket visualization and lookup view |
| Inventory Management | src/pages/crud_pages/inventoryCrud.tsx | Inventory CRUD, serialized stock, assignment tracking |
| Supplier Management | src/pages/crud_pages/supplierCrud.tsx | Supplier/vendor source management for inventory procurement |
| Vendor Management | src/pages/crud_pages/vendorCrud.tsx | Vendor entity management and related operational records |
| Area and Zone Management | src/pages/crud_pages/areaZoneCrud.tsx | Geography hierarchy, operational area segmentation |
| Sub-Zone Management | src/pages/crud_pages/subZoneCrud.tsx | Sub-area segmentation and mapping under areas |
| Task Management | src/pages/crud_pages/taskCrud.tsx | Task assignment, progress tracking, completion workflows |
| Recovery Task Management | src/pages/crud_pages/recoveryTaskCrud.tsx | Overdue invoice recovery assignments and follow-up workflow |
| Bank Account Management | src/pages/crud_pages/BankAccountCrud.tsx | Bank account CRUD, account-level financial controls |
| Payment Management | src/pages/crud_pages/paymentCrud.tsx | Customer payment records, settlement tracking |
| ISP Payment Management | src/pages/crud_pages/ISPPaymentCrud.tsx | Upstream ISP payments, billing-cycle aligned payment records |
| Billing Invoices Management | src/pages/crud_pages/invoiceCrud.tsx | Invoice CRUD, filtering, lifecycle control |
| Invoice Generation / View | src/pages/invoiceGeneration.tsx | Invoice rendering, line-item visibility, billing document output |
| Public Invoice Page | src/pages/PublicInvoicePage.tsx | Public invoice access by secure direct link |
| Expense Management | src/pages/crud_pages/ExpenseCrud.tsx | Expense CRUD, categorization, operational cost tracking |
| Extra Income Management | src/pages/crud_pages/ExtraIncomeCrud.tsx | Extra income record management outside standard billing |
| ISP Management | src/pages/crud_pages/ispCrud.tsx | ISP provider records and upstream service relationships |
| Message Management | src/pages/crud_pages/messageCrud.tsx | Internal/app message records and message workflow management |
| Logs Management | src/pages/crud_pages/logsCrud.tsx | Application/user activity logs and audit review |
| User Profile | src/pages/userProfile.tsx | Current user profile details and user-level settings |
| Reporting and Analytics | src/components/dashboard_components/ReportingPage.tsx | Reporting navigation and section-based analytics routing |
| Executive Dashboard | src/components/dashboard_components/ExecutiveDashboard.tsx | Executive KPIs, cross-functional high-level metrics |
| Financial Intelligence V2 | src/components/dashboard_components/FinancialIntelligenceV2.tsx | Financial intelligence insights, trend analysis, profitability and cash views |
| Unified Financial Dashboard | src/components/dashboard_components/UnifiedFinancialDashboard.tsx | Unified financial summary and cross-metric visibility |
| Operational Metrics Dashboard | src/components/dashboard_components/OperationaMetrices.tsx | Operational performance indicators and service KPIs |
| Service Support Dashboard | src/components/dashboard_components/ServiceSupport.tsx | Support and service operations metrics |
| Ledger Dashboard Components | src/components/dashboard_components/ledger/ | Ledger-oriented financial views and transaction perspectives |
| WhatsApp Queue Dashboard | src/pages/whatsapp/WhatsAppQueueDashboard.tsx | Queue visibility, statuses, retries, quota and connection overview |
| WhatsApp Bulk Sender | src/pages/whatsapp/BulkMessageSender.tsx | Bulk campaign creation and prioritized message enqueueing |
| WhatsApp Settings | src/pages/whatsapp/WhatsAppSettings.tsx | Instance connection, QR flow, anti-ban settings, quotas, automation toggles |
| Network Monitoring | src/pages/monitoring/NetworkMonitoring.tsx | Monitoring views for network/device-level health and metrics |

## Backend API Modules (Route Layer)

| Module Name | Backend Route File | Core Features |
|---|---|---|
| Common Utilities API | api/app/routes/common_routes.py | Shared endpoints and common utility operations |
| User Management API | api/app/routes/user_routes.py | User CRUD, authentication-adjacent user operations, role-scoped access |
| Customer API | api/app/routes/customer_routes.py | Customer lifecycle endpoints, profile and operational updates |
| Employee API | api/app/routes/employee_routes.py | Employee records, management operations |
| Employee Profile API | api/app/routes/employee_profile_routes.py | Employee profile-focused endpoint set |
| Employee Portal API | api/app/routes/employee_portal_routes.py | Employee self-service and portal workflows |
| Area API | api/app/routes/area_routes.py | Area CRUD and area-level segmentation endpoints |
| Sub-Zone API | api/app/routes/sub_zone_routes.py | Sub-zone CRUD and area linkage endpoints |
| Service Plan API | api/app/routes/service_plan_routes.py | Package/plan definitions and management endpoints |
| ISP API | api/app/routes/isp_routes.py | ISP provider and relationship endpoints |
| Supplier API | api/app/routes/supplier_routes.py | Supplier management endpoints |
| Vendor API | api/app/routes/vendor_routes.py | Vendor management endpoints |
| Inventory API | api/app/routes/inventory_routes.py | Inventory records, assignments, stock workflow endpoints |
| Complaint API | api/app/routes/complaint_routes.py | Complaint lifecycle endpoints, assignment and status controls |
| Task API | api/app/routes/task_routes.py | Task creation, assignment, updates, and completion endpoints |
| Recovery API | api/app/routes/recovery_routes.py | Recovery workflows, assignment, follow-up and state updates |
| Invoice API | api/app/routes/invoice_routes.py | Invoice generation, retrieval, updates, payment-context operations |
| Payment API | api/app/routes/payment_routes.py | Payment recording, status updates, invoice settlement endpoints |
| ISP Payment API | api/app/routes/isp_payment_routes.py | Upstream ISP payment workflows and history endpoints |
| Expense API | api/app/routes/expense_routes.py | Expense operations and bookkeeping endpoints |
| Extra Income API | api/app/routes/extra_income_routes.py | Non-standard income operations |
| Bank Account API | api/app/routes/bank_account_routes.py | Bank account operations and account-level finance controls |
| Internal Transfer API | api/app/routes/internal_transfer_routes.py | Inter-account transfer operations |
| Message API | api/app/routes/message_routes.py | Message CRUD, enqueue-linked message workflows |
| Log API | api/app/routes/log_routes.py | System and user action log access endpoints |
| Monitoring API | api/app/routes/monitoring_routes.py | Monitoring data and adapter-driven network metrics endpoints |
| Dashboard API | api/app/routes/dashboard_routes.py | Reporting and dashboard metric endpoints for executive/financial/operational views |
| WhatsApp API | api/app/routes/whatsapp_routes.py | Queue operations, templates, quota APIs, instance lifecycle, webhook processing |

## Backend Business Modules (CRUD Layer)

| Module Name | CRUD File | Core Features |
|---|---|---|
| User Management | api/app/crud/user_crud.py | User data operations and validation workflows |
| Customer Management | api/app/crud/customer_crud.py | Customer data operations and lifecycle logic |
| Customer Package Management | api/app/crud/customer_package_crud.py | Multi-package customer mapping and package-level operations |
| Employee Management | api/app/crud/employee_crud.py | Employee data operations |
| Employee Profile Management | api/app/crud/employee_profile_crud.py | Employee profile-specific data operations |
| Employee Portal Operations | api/app/crud/employee_portal_crud.py | Employee portal business logic |
| Employee Ledger | api/app/crud/employee_ledger_crud.py | Salary, commission, payout ledger transactions |
| Area Management | api/app/crud/area_crud.py | Area operations and validation |
| Sub-Zone Management | api/app/crud/sub_zone_crud.py | Sub-zone operations and area binding |
| Service Plan Management | api/app/crud/service_plan_crud.py | Service plan business rules and persistence |
| ISP Management | api/app/crud/isp_crud.py | ISP business operations |
| Supplier Management | api/app/crud/supplier_crud.py | Supplier data/business operations |
| Vendor Management | api/app/crud/vendor_crud.py | Vendor data/business operations |
| Inventory Management | api/app/crud/inventory_crud.py | Inventory movement, assignment, stock operations |
| Complaint Management | api/app/crud/complaint_crud.py | Complaint workflows and status transitions |
| Task Management | api/app/crud/task_crud.py | Task business operations |
| Recovery Task Management | api/app/crud/recovery_task_crud.py | Recovery task workflows and assignment logic |
| Invoice Management | api/app/crud/invoice_crud.py | Invoice generation rules, billing workflows |
| Payment Management | api/app/crud/payment_crud.py | Payment posting and settlement logic |
| ISP Payment Management | api/app/crud/isp_payment_crud.py | ISP payment business logic |
| Expense Management | api/app/crud/expense_crud.py | Expense operations and validations |
| Extra Income Management | api/app/crud/extra_income_crud.py | Extra income business operations |
| Bank Account Management | api/app/crud/bank_account_crud.py | Bank account operations |
| Internal Transfer Management | api/app/crud/internal_transfer_crud.py | Transfer logic across bank accounts |
| Message Management | api/app/crud/message_crud.py | Message persistence and enqueue integration |
| Logs Management | api/app/crud/log_crud.py | Log persistence/access logic |
| Monitoring Management | api/app/crud/monitoring_crud.py | Monitoring data operations and persistence |
| Dashboard Analytics | api/app/crud/dashboard_crud.py | Dashboard data shaping and KPI aggregation |
| Executive Dashboard Analytics | api/app/crud/executive_dashboard_crud.py | Executive KPI pipelines |
| Financial Dashboard Analytics | api/app/crud/financial_dashboard_crud.py | Financial metrics aggregation and reporting |
| Operations Dashboard Analytics | api/app/crud/operations_dashboard_crud.py | Operational KPIs and workflows |
| Area Analytics | api/app/crud/area_analytics_crud.py | Area-level performance analytics |
| Employee Dashboard Analytics | api/app/crud/employee_dashboard_crud.py | Employee-level KPI and performance metrics |
| Service Support Analytics | api/app/crud/service_support_crud.py | Service-support performance analytics |

## Backend Integration and Automation Modules (Service Layer)

| Module Name | Service File | Core Features |
|---|---|---|
| Auto Invoice Service | api/app/services/auto_invoice_service.py | Scheduled invoice generation, new-customer invoice rules |
| Commission Service | api/app/services/commission_service.py | Commission computation and posting to employee ledgers |
| Monitoring Service | api/app/services/monitoring_service.py | Network metric collection and synchronization workflows |
| Spintax Engine | api/app/services/spintax_engine.py | Message randomization/humanization for anti-ban behavior |
| Legacy WhatsApp API Client | api/app/services/whatsapp_api_client.py | Legacy provider integration operations |
| Evolution API Client | api/app/services/evolution_api_client.py | Evolution instance create/restart/delete, QR retrieval, state checks, message send integration |
| WhatsApp Queue Service | api/app/services/whatsapp_queue_service.py | Queue enqueue and queue-level message operations |
| WhatsApp Rate Limiter | api/app/services/whatsapp_rate_limiter.py | Daily quota control, buffer logic, send permission checks |
| WhatsApp Invoice Sender | api/app/services/whatsapp_invoice_sender.py | Invoice notification template composition and queue dispatch |
| WhatsApp Dispatcher | api/app/services/whatsapp_dispatcher.py | Background queue processing, send-window enforcement, cooldown and anti-ban send orchestration |

## Network Adapter Modules

| Module Name | Adapter File | Core Features |
|---|---|---|
| Adapter Factory | api/app/network_adapters/adapter_factory.py | Runtime adapter selection by provider/device type |
| Base Adapter | api/app/network_adapters/base_adapter.py | Shared adapter contract and common interface |
| MikroTik Adapter | api/app/network_adapters/mikrotik_adapter.py | MikroTik-specific integration operations |
| Ubiquiti Adapter | api/app/network_adapters/ubiquiti_adapter.py | Ubiquiti-specific integration operations |
| Custom Adapter | api/app/network_adapters/custom_adapter.py | Extension path for non-standard integrations |

## Core Platform Modules

| Module Name | Primary Location | Core Features |
|---|---|---|
| Authentication and Authorization | api/app/auth.py | JWT issuance/validation, role and company claims |
| Application Bootstrap | api/app/__init__.py, api/run.py | Flask app creation, blueprint wiring, runtime startup |
| Data Model Layer | api/app/models.py | Entity schema, relationships, enums, computed properties |
| Scheduler and Background Jobs | api/scheduler.py | Timed jobs for invoices, alerts, quotas, periodic maintenance |
| Database Migrations | api/migrations/ | Schema evolution, rollout-safe database changes |
| Deployment and Runtime Scripts | deploy/, docker-compose.evolution.yml | Service deployment, runtime orchestration, rollback support |

## Primary Software Feature Groups

| Feature Group | Included Modules |
|---|---|
| Subscriber Lifecycle Management | Customer Management, Customer Detail, Area/Sub-Zone, Service Plans, ISP Management |
| Field and Support Operations | Complaint Management, Ticket Display, Task Management, Recovery Task Management, Employee Portal |
| Billing and Collections | Invoice Management, Payment Management, ISP Payment, Recovery APIs, Auto Invoice Service |
| Financial Operations and Reporting | Expense, Extra Income, Bank Management, Internal Transfers, Dashboard/Financial modules |
| Inventory and Procurement | Inventory Management, Supplier Management, Vendor Management |
| Communication and Engagement | Message Management, WhatsApp Queue, Bulk Sender, WhatsApp Settings, WhatsApp Backend Services |
| Monitoring and Infrastructure | Network Monitoring page, Monitoring API/CRUD/Service, Adapter modules |
| Governance and Auditing | Logs Management, RBAC-enabled auth flows, route-level JWT protections |

