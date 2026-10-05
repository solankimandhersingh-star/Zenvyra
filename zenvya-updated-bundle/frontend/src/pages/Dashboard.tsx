import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  NavLink,
  useNavigate,
} from 'react-router-dom';

import { getStoredUser } from '../services/authService';

import {
  getOrganizations,
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

function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] =
    useState<Organization[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    getOrganizations()
      .then(setOrganizations)
      .catch((error) =>
        console.error(
          'Failed to load organizations',
          error
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  const counts = useMemo(
    () => ({
      total: organizations.length,

      pending: organizations.filter(
        (o) => o.status === 'PENDING'
      ).length,

      active: organizations.filter(
        (o) => o.status === 'ACTIVE'
      ).length,

      disabled: organizations.filter(
        (o) => o.status === 'DISABLED'
      ).length,

      rejected: organizations.filter(
        (o) => o.status === 'REJECTED'
      ).length,
    }),
    [organizations]
  );

  return (
    <div className="dashboard-page">

      <div className="page-header dashboard-header">
        <div>
          <span className="eyebrow">
            SUPER ADMIN
          </span>

          <h1>System Dashboard</h1>

          <p>
            Monitor organizations and manage
            the Zenvyra platform.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate('/organizations/create')
          }
        >
          + Create organization
        </button>
      </div>

      <div className="metric-grid">

        <DashboardMetric
          label="Organizations"
          value={
            loading
              ? '—'
              : counts.total
          }
          icon="O"
        />

        <DashboardMetric
          label="Pending approval"
          value={
            loading
              ? '—'
              : counts.pending
          }
          icon="!"
          tone="warning"
        />

        <DashboardMetric
          label="Active"
          value={
            loading
              ? '—'
              : counts.active
          }
          icon="✓"
          tone="success"
        />

        <DashboardMetric
          label="Disabled"
          value={
            loading
              ? '—'
              : counts.disabled
          }
          icon="Ⅱ"
        />

      </div>

      <div className="dashboard-two-column">

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>
                Organization activity
              </h2>

              <p>
                Current organization
                lifecycle status.
              </p>
            </div>

            <NavLink
              to="/organizations"
              className="text-button"
            >
              View all →
            </NavLink>
          </div>

          <div className="activity-list">
            <ActivityRow
              label="Active organizations"
              value={counts.active}
              className="success"
            />

            <ActivityRow
              label="Pending organizations"
              value={counts.pending}
              className="warning"
            />

            <ActivityRow
              label="Disabled organizations"
              value={counts.disabled}
              className="neutral"
            />

            <ActivityRow
              label="Rejected organizations"
              value={counts.rejected}
              className="danger"
            />
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick actions</h2>

              <p>
                Common platform
                administration tasks.
              </p>
            </div>
          </div>

          <div className="dashboard-action-list">

            <NavLink
              to="/organizations"
              className="dashboard-action"
            >
              <span className="action-icon">
                O
              </span>

              <span>
                <strong>
                  Manage organizations
                </strong>

                <small>
                  View, approve and manage
                  organizations
                </small>
              </span>

              <span>→</span>
            </NavLink>

            <NavLink
              to="/organizations/create"
              className="dashboard-action"
            >
              <span className="action-icon">
                +
              </span>

              <span>
                <strong>
                  Create organization
                </strong>

                <small>
                  Create an active
                  organization and admin
                </small>
              </span>

              <span>→</span>
            </NavLink>

          </div>
        </section>

      </div>

    </div>
  );
}

function OrganizationDashboard() {
  const user = getStoredUser();

  const isAdmin =
    user?.role === 'ORG_ADMIN';

  const [
    customerCount,
    setCustomerCount,
  ] = useState<number | null>(null);

  const [
    productCount,
    setProductCount,
  ] = useState<number | null>(null);

  const [
    invoiceCount,
    setInvoiceCount,
  ] = useState<number | null>(null);

  useEffect(() => {
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
          setCustomerCount(
            customers.length
          );

          setProductCount(
            products.length
          );

          setInvoiceCount(
            invoices.length
          );
        }
      )
      .catch((error) => {
        console.error(
          'Failed to load dashboard counts:',
          error
        );
      });
  }, []);

  return (
    <div className="dashboard-page">

      <div className="page-header dashboard-header">
        <div>
          <span className="eyebrow">
            {isAdmin
              ? 'ORGANIZATION ADMIN'
              : 'ORGANIZATION USER'}
          </span>

          <h1>
            Welcome,{' '}
            {user?.firstName ||
              user?.username}
          </h1>

          <p>
            Manage your organization
            from one connected workspace.
          </p>
        </div>
      </div>

      <div className="workspace-banner">
        <div className="workspace-banner-icon">
          Z
        </div>

        <div>
          <strong>
            {isAdmin
              ? 'Organization administration'
              : 'Billing operations'}
          </strong>

          <p>
            {isAdmin
              ? 'Manage users, customers, products, invoices and payments for your organization.'
              : 'Work with customers, products, invoices and payments within your organization.'}
          </p>
        </div>
      </div>

      <div className="metric-grid">

        <DashboardMetric
          label="Customers"
          value={
            customerCount ?? '—'
          }
          icon="C"
        />

        <DashboardMetric
          label="Products"
          value={
            productCount ?? '—'
          }
          icon="P"
        />

        <DashboardMetric
          label="Invoices"
          value={
            invoiceCount ?? '—'
          }
          icon="I"
        />

        <DashboardMetric
          label="Payments"
          value="—"
          icon="$"
        />

      </div>

      <div className="section-heading">
        <div>
          <h2>Workspace</h2>

          <p>
            Business modules available
            to your role.
          </p>
        </div>
      </div>

      <div className="module-grid">

        {isAdmin && (
          <ModuleLink
            to="/users"
            icon="U"
            title="Users"
            description="Manage organization users"
          />
        )}

        <ModuleLink
          to="/customers"
          icon="C"
          title="Customers"
          description="Manage customers"
        />

        <ModuleLink
          to="/products"
          icon="P"
          title="Products"
          description="Manage products and services"
        />

        <ModuleLink
          to="/invoices"
          icon="I"
          title="Invoices"
          description="Create and manage invoices"
        />

        <ModuleLink
          to="/payments"
          icon="$"
          title="Payments"
          description="Record and view payments"
        />

        {isAdmin && (
          <ModuleLink
            to="/reports"
            icon="R"
            title="Reports"
            description="Business and billing reports"
          />
        )}

        {isAdmin &&
          user?.organizationId && (
            <ModuleLink
              to={`/organizations/${user.organizationId}/edit`}
              icon="O"
              title="Organization"
              description="Manage organization details"
            />
          )}

      </div>

    </div>
  );
}

function DashboardMetric({
  label,
  value,
  icon,
  tone = '',
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: string;
}) {
  return (
    <div
      className={`dashboard-metric ${tone}`}
    >
      <span className="metric-icon">
        {icon}
      </span>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ActivityRow({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="activity-row">
      <span>
        <i className={className} />
        {label}
      </span>

      <strong>{value}</strong>
    </div>
  );
}

function ModuleLink({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <NavLink
      to={to}
      className="module-card"
    >
      <span className="module-icon">
        {icon}
      </span>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <b>→</b>
    </NavLink>
  );
}

export default function Dashboard() {
  const user = getStoredUser();

  if (user?.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }

  return <OrganizationDashboard />;
}