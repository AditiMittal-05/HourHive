import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/auth.store";

// Layouts
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { ChangePasswordPage } from "@/pages/auth/ChangePasswordPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import SuperAdminProfilePage from "@/pages/profile/SuperAdminProfilePage";

// App Pages
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { ProjectsPage } from "@/pages/projects/ProjectsPage";
import { ActivitiesPage } from "@/pages/activities/ActivitiesPage";
import { TimesheetEntryPage } from "@/pages/timesheets/TimesheetEntryPage";
import { WeeklyViewPage } from "@/pages/timesheets/WeeklyViewPage";
import { TimesheetListPage } from "@/pages/timesheets/TimesheetListPage";
import { ApprovalsPage } from "@/pages/approvals/ApprovalsPage";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import { AnalyticsPage } from "@/pages/reports/AnalyticsPage";
import { AuditLogsPage } from "@/pages/audit/AuditLogsPage";
import { HolidayManagementPage } from "@/pages/holidays/HolidayManagementPage";
import { OrganizationHierarchyPage } from "@/pages/organization/OrganizationHierarchyPage";
import { ApproverMappingPage } from "@/pages/organization/ApproverMappingPage";

function ProfileRouter() {
  const user = useAuthStore((s) => s.user);
  return user?.role === "super_admin" ? <SuperAdminProfilePage /> : <ProfilePage />;
}

function ProtectedRoute({ children, superAdminOnly = false, approverOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (superAdminOnly && user?.role !== "super_admin")
    return <Navigate to="/dashboard" replace />;
  if (approverOnly && user?.role !== "super_admin" && !user?.can_approve_timesheets)
    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/profile" element={<ProfileRouter />} />

          {/* Timesheets — all authenticated users */}
          <Route path="/timesheets" element={<TimesheetListPage />} />
          <Route path="/timesheets/entry" element={<TimesheetEntryPage />} />
          <Route path="/timesheets/weekly" element={<WeeklyViewPage />} />

          {/* Approvals — approver employees + super_admin */}
          <Route path="/approvals" element={<ProtectedRoute approverOnly><ApprovalsPage /></ProtectedRoute>} />

          {/* Reports — all authenticated users */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* SuperAdmin only */}
          <Route path="/users" element={<ProtectedRoute superAdminOnly><UsersPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute superAdminOnly><ProjectsPage /></ProtectedRoute>} />
          <Route path="/activities" element={<ProtectedRoute superAdminOnly><ActivitiesPage /></ProtectedRoute>} />
          <Route path="/organization" element={<ProtectedRoute superAdminOnly><OrganizationHierarchyPage /></ProtectedRoute>} />
          <Route path="/approver-mapping" element={<ProtectedRoute superAdminOnly><ApproverMappingPage /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute superAdminOnly><AuditLogsPage /></ProtectedRoute>} />
          <Route path="/holidays" element={<ProtectedRoute superAdminOnly><HolidayManagementPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
