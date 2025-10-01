import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import InstitutionDashboard from './pages/institution-dashboard';
import Login from './pages/login';
import AuditLogViewer from './pages/audit-log-viewer';
import CertificateVerification from './pages/certificate-verification';
import BulkPDFUpload from './pages/bulk-pdf-upload';
import VerifierDashboard from './pages/verifier-dashboard';

const getUserRole = () => localStorage.getItem('user_role');
const isAuthenticated = () => Boolean(localStorage.getItem('auth_token'));

const roleHomePath = (role) => {
  switch (role) {
    case 'verifier':
      return '/verifier-dashboard';
    case 'institution':
      return '/institution-dashboard';
    default:
      return '/login';
  }
};

const RequireAuth = ({ children, allowedRoles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const role = getUserRole();
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={roleHomePath(role)} replace />;
  }
  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Default to Login as landing */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Verifier-only */}
        <Route
          path="/verifier-dashboard"
          element={
            <RequireAuth allowedRoles={["verifier"]}>
              <VerifierDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/certificate-verification"
          element={
            <RequireAuth allowedRoles={["verifier"]}>
              <CertificateVerification />
            </RequireAuth>
          }
        />

        {/* Institution Admin: manage + audit */}
        <Route
          path="/institution-dashboard"
          element={
            <RequireAuth allowedRoles={["institution"]}>
              <InstitutionDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/bulk-pdf-upload"
          element={
            <RequireAuth allowedRoles={["verifier"]}>
              <BulkPDFUpload />
            </RequireAuth>
          }
        />

        {/* Audit: institution admin only */}
        <Route
          path="/audit-log-viewer"
          element={
            <RequireAuth allowedRoles={["institution"]}>
              <AuditLogViewer />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
