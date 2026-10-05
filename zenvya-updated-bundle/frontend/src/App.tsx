import type { ReactNode } from 'react';
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Organizations from './pages/Organizations';
import CreateOrganization from './pages/CreateOrganization';
import OrganizationDetails from './pages/OrganizationDetails';
import EditOrganization from './pages/EditOrganization';
import OrganizationReview from './pages/OrganizationReview';
import OrganizationWorkspace from './pages/OrganizationWorkspace';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import InvoiceCreatePage from './pages/InvoiceCreatePage';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import Payments from './pages/Payments';
import Reports from './pages/Reports';

import { getStoredUser, logout } from './services/authService';

function Protected({ children }: { children: ReactNode }) {
  return getStoredUser() ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
}

function RoleProtected({
  roles,
  children,
}: {
  roles: string[];
  children: ReactNode;
}) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return roles.includes(user.role) ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
  );
}

function AppShell() {
  const user = getStoredUser();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    );
  }

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = user.role === 'ORG_ADMIN';
  const isOrgUser = user.role === 'ORG_USER';
  const isOrgMember = isOrgAdmin || isOrgUser;

  const inSuperAdminWorkspace =
    location.pathname.startsWith('/workspace/');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="app-brand">
          <img
            src="/zenvya-logo-transparent.png"
            alt="Zenvyra"
          />
          <span>Zenvyra</span>
        </NavLink>

        <div className="topbar-right">
          <div className="account-chip">
            <span className="account-avatar">
              {(user.firstName || user.username)
                .charAt(0)
                .toUpperCase()}
            </span>

            <span className="account-details">
              <strong>
                {user.firstName || user.username}
              </strong>

              <small>
                {user.role.replaceAll('_', ' ')}
              </small>
            </span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-section-label">
            WORKSPACE
          </div>

          <nav>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">⌂</span>
              Dashboard
            </NavLink>

            {isSuperAdmin && !inSuperAdminWorkspace && (
              <NavLink
                to="/organizations"
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">O</span>
                Organizations
              </NavLink>
            )}

            {isOrgMember && (
              <>
                <NavLink
                  to="/customers"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">C</span>
                  Customers
                </NavLink>

                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">P</span>
                  Products
                </NavLink>

                <NavLink
                  to="/invoices"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">I</span>
                  Invoices
                </NavLink>

                <NavLink
                  to="/payments"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">$</span>
                  Payments
                </NavLink>
              </>
            )}

            {isOrgAdmin && (
              <>
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">U</span>
                  Users
                </NavLink>

                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">R</span>
                  Reports
                </NavLink>

                {user.organizationId && (
                  <NavLink
                    to={`/organizations/${user.organizationId}/edit`}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="nav-icon">O</span>
                    Organization
                  </NavLink>
                )}
              </>
            )}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-secure">
              <span>✓</span>

              <div>
                <strong>Secure workspace</strong>
                <small>
                  Authenticated session
                </small>
              </div>
            </div>
          </div>
        </aside>

        <main className="content">
          <Routes>
            <Route
              path="/"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />

            <Route
              path="/organizations"
              element={
                <RoleProtected roles={['SUPER_ADMIN']}>
                  <Organizations />
                </RoleProtected>
              }
            />

            <Route
              path="/organizations/create"
              element={
                <RoleProtected roles={['SUPER_ADMIN']}>
                  <CreateOrganization />
                </RoleProtected>
              }
            />

            <Route
              path="/organizations/:id"
              element={
                <RoleProtected roles={['SUPER_ADMIN']}>
                  <OrganizationDetails />
                </RoleProtected>
              }
            />

            <Route
              path="/organizations/:id/review"
              element={
                <RoleProtected roles={['SUPER_ADMIN']}>
                  <OrganizationReview />
                </RoleProtected>
              }
            />

            <Route
              path="/organizations/:id/edit"
              element={
                <RoleProtected
                  roles={['SUPER_ADMIN', 'ORG_ADMIN']}
                >
                  <EditOrganization />
                </RoleProtected>
              }
            />

            {/* SUPER ADMIN WORKSPACE */}
            <Route
              path="/workspace/:id/*"
              element={
                <RoleProtected roles={['SUPER_ADMIN']}>
                  <OrganizationWorkspace />
                </RoleProtected>
              }
            />

            {/* ORGANIZATION USER ROUTES */}
            <Route
              path="/users"
              element={
                <RoleProtected roles={['ORG_ADMIN']}>
                  <Users />
                </RoleProtected>
              }
            />

            <Route
              path="/customers"
              element={
                <RoleProtected
                  roles={['ORG_ADMIN', 'ORG_USER']}
                >
                  <Customers />
                </RoleProtected>
              }
            />

            <Route
              path="/products"
              element={
                <RoleProtected
                  roles={['ORG_ADMIN', 'ORG_USER']}
                >
                  <Products />
                </RoleProtected>
              }
            />

            {/* INVOICE DASHBOARD */}
            <Route
              path="/invoices"
              element={
                <RoleProtected
                  roles={['ORG_ADMIN', 'ORG_USER']}
                >
                  <Invoices />
                </RoleProtected>
              }
            />

            {/* CREATE - SAME TAB */}
            <Route
              path="/invoices/create"
              element={
                <RoleProtected
                  roles={['ORG_ADMIN', 'ORG_USER']}
                >
                  <InvoiceCreatePage />
                </RoleProtected>
              }
            />

            {/* LIST - SAME TAB */}
            <Route
              path="/invoices/list"
              element={
                <RoleProtected
                  roles={['ORG_ADMIN', 'ORG_USER']}
                >
                  <InvoiceListPage />
                </RoleProtected>
              }
            />

            {/* PRINT/PDF */}
            <Route
              path="/invoices/:id"
              element={
                <RoleProtected
                  roles={['ORG_ADMIN', 'ORG_USER']}
                >
                  <InvoiceDetailPage />
                </RoleProtected>
              }
            />

            <Route
              path="/payments"
              element={
                <RoleProtected
                  roles={['ORG_ADMIN', 'ORG_USER']}
                >
                  <Payments />
                </RoleProtected>
              }
            />

            <Route
              path="/reports"
              element={
                <RoleProtected roles={['ORG_ADMIN']}>
                  <Reports />
                </RoleProtected>
              }
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}