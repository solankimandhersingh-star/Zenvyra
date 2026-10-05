import {
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  useEffect,
  useState,
} from 'react';

import {
  getOrganization,
  setOrganizationStatus,
  type Organization,
} from '../services/organizationService';

import {
  getCustomers,
} from '../services/customerService';

import {
  getProducts,
} from '../services/productService';

import {
  getInvoices,
} from '../services/invoiceService';

import OrganizationDetails from './OrganizationDetails';
import Users from './Users';
import Customers from './Customers';
import Products from './Products';
import Invoices from './Invoices';
import InvoiceListPage from './InvoiceListPage';
import InvoiceCreatePage from './InvoiceCreatePage';
import InvoiceDetailPage from './InvoiceDetailPage';
import Payments from './Payments';
import Reports from './Reports';

import './ModulePages.css';

const tabs = [
  ['dashboard', 'Dashboard', '⌂'],
  ['customers', 'Customers', 'C'],
  ['products', 'Products', 'P'],
  ['invoices', 'Invoices', 'I'],
  ['payments', 'Payments', '$'],
  ['reports', 'Reports', 'R'],
  ['users', 'Users', 'U'],
  ['organization', 'Organization', 'O'],
] as const;

function WorkspaceHome({
  organization,
  reload,
}: {
  organization: Organization;
  reload: () => void;
}) {
  const navigate = useNavigate();

  const [changing, setChanging] =
    useState(false);

  const [counts, setCounts] =
    useState({
      customers: 0,
      products: 0,
      invoices: 0,
    });

  const [countsLoading, setCountsLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getCustomers(),
      getProducts(),
      getInvoices(),
    ])
      .then(
        ([
          customers,
          products,
          invoices,
        ]) => {
          if (!mounted) return;

          setCounts({
            customers: customers.length,
            products: products.length,
            invoices: invoices.length,
          });
        }
      )
      .catch((error) => {
        console.error(
          'Failed to load workspace counts:',
          error
        );
      })
      .finally(() => {
        if (mounted) {
          setCountsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [organization.id]);

  const isActive =
    organization.status === 'ACTIVE';

  const isDisabled =
    organization.status === 'DISABLED';

  const isPending =
    organization.status === 'PENDING';

  const changeStatus = async () => {
    if (!isActive && !isDisabled) {
      return;
    }

    setChanging(true);

    try {
      await setOrganizationStatus(
        organization.id,
        isDisabled
      );

      reload();
    } catch (error) {
      console.error(
        'Failed to change organization status:',
        error
      );
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="module-page">

      <div className="module-header">

        <div>
          <span className="module-eyebrow">
            SUPER ADMIN · ORGANIZATION
          </span>

          <h1>
            {organization.name}
          </h1>

          <p>
            {organization.organizationCode}
            {' · '}
            {organization.status}
          </p>
        </div>

        <div className="module-actions">

          <button
            className="module-secondary"
            onClick={() =>
              navigate('/organizations')
            }
          >
            ← Organizations
          </button>

          {isActive && (
            <button
              className="module-secondary"
              disabled={changing}
              onClick={changeStatus}
            >
              {changing
                ? 'Updating...'
                : 'Disable'}
            </button>
          )}

          {isDisabled && (
            <button
              className="module-primary"
              disabled={changing}
              onClick={changeStatus}
            >
              {changing
                ? 'Updating...'
                : 'Enable'}
            </button>
          )}

          {isPending && (
            <button
              className="module-primary"
              onClick={() =>
                navigate(
                  `/organizations/${organization.id}/review`
                )
              }
            >
              Review
            </button>
          )}

        </div>
      </div>

      <div
        className="module-card"
        style={{ padding: 28 }}
      >

        <div className="workspace-banner">

          <div className="workspace-banner-icon">
            O
          </div>

          <div>
            <strong>
              {organization.name}
            </strong>

            <p>
              You are viewing this
              organization with Super Admin
              access.
            </p>
          </div>

        </div>

        <div
          className="metric-grid"
          style={{ marginTop: 24 }}
        >

          <div className="dashboard-metric">
            <span className="metric-icon">
              C
            </span>

            <div>
              <span>Customers</span>
              <strong>
                {countsLoading
                  ? '—'
                  : counts.customers}
              </strong>
            </div>
          </div>

          <div className="dashboard-metric">
            <span className="metric-icon">
              P
            </span>

            <div>
              <span>Products</span>
              <strong>
                {countsLoading
                  ? '—'
                  : counts.products}
              </strong>
            </div>
          </div>

          <div className="dashboard-metric">
            <span className="metric-icon">
              I
            </span>

            <div>
              <span>Invoices</span>
              <strong>
                {countsLoading
                  ? '—'
                  : counts.invoices}
              </strong>
            </div>
          </div>

          <div className="dashboard-metric">
            <span className="metric-icon">
              $
            </span>

            <div>
              <span>Payments</span>
              <strong>—</strong>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function OrganizationWorkspace() {
  const {
    id: organizationId,
  } = useParams<{ id: string }>();

  const [
    organization,
    setOrganization,
  ] = useState<Organization | null>(null);

  const [error, setError] =
    useState('');

  const load = () => {
    if (!organizationId) {
      return;
    }

    setError('');

    getOrganization(organizationId)
      .then(setOrganization)
      .catch((error) => {
        console.error(
          'Failed to load organization:',
          error
        );

        setError(
          'Failed to load organization.'
        );
      });
  };

  useEffect(() => {
    load();
  }, [organizationId]);

  if (!organizationId) {
    return (
      <div className="module-empty-card">
        <h2>
          Organization not selected
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-empty-card">
        <h2>{error}</h2>

        <button
          className="primary-button"
          onClick={load}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="module-empty-card">
        <h2>
          Loading organization...
        </h2>
      </div>
    );
  }

  return (
    <div className="workspace-page">

      <div className="workspace-shell">

        <aside className="workspace-sidebar">

          <div className="workspace-sidebar-title">
            ORGANIZATION
          </div>

          <strong className="workspace-org-name">
            {organization.name}
          </strong>

          <small>
            {organization.organizationCode}
          </small>

          <nav>
            {tabs.map(
              ([key, label, icon]) => (
                <NavLink
                  key={key}
                  to={`/workspace/${organization.id}/${key}`}
                  className={({ isActive }) =>
                    `workspace-link ${
                      isActive ? 'active' : ''
                    }`
                  }
                >
                  <span>{icon}</span>
                  {label}
                </NavLink>
              )
            )}
          </nav>

        </aside>

        <main className="workspace-content">

          <Routes>

            <Route
              index
              element={
                <WorkspaceHome
                  organization={organization}
                  reload={load}
                />
              }
            />

            <Route
              path="dashboard"
              element={
                <WorkspaceHome
                  organization={organization}
                  reload={load}
                />
              }
            />

            <Route
              path="customers"
              element={<Customers />}
            />

            <Route
              path="products"
              element={<Products />}
            />

            <Route
              path="invoices"
              element={<Invoices />}
            />

            <Route
              path="invoices/list"
              element={<InvoiceListPage />}
            />

            <Route
              path="invoices/create"
              element={<InvoiceCreatePage />}
            />

            <Route
              path="invoices/:invoiceId"
              element={<InvoiceDetailPage />}
            />

            <Route
              path="payments"
              element={<Payments />}
            />

            <Route
              path="reports"
              element={<Reports />}
            />

            <Route
              path="users"
              element={<Users />}
            />

            <Route
              path="organization"
              element={<OrganizationDetails />}
            />

            <Route
              path="*"
              element={
                <WorkspaceHome
                  organization={organization}
                  reload={load}
                />
              }
            />

          </Routes>

        </main>

      </div>

    </div>
  );
}