import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOrganizations,
  type Organization,
} from '../services/organizationService';
import StatusBadge from '../components/StatusBadge';
import './Organizations.css';

type StatusFilter =
  | 'ALL'
  | 'PENDING'
  | 'ACTIVE'
  | 'DISABLED'
  | 'REJECTED';

function Organizations() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getOrganizations();
        setOrganizations(data);
      } catch (err: any) {
        console.error('Failed to load organizations:', err);

        const status = err?.response?.status;

        const message =
          err?.response?.data?.message ||
          (typeof err?.response?.data === 'string'
            ? err.response.data
            : '');

        setError(
          message ||
            `Failed to load organizations${
              status ? ` (${status})` : ''
            }`
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  const counts = useMemo(() => {
    return {
      ALL: organizations.length,

      PENDING: organizations.filter(
        (organization) => organization.status === 'PENDING'
      ).length,

      ACTIVE: organizations.filter(
        (organization) => organization.status === 'ACTIVE'
      ).length,

      DISABLED: organizations.filter(
        (organization) => organization.status === 'DISABLED'
      ).length,

      REJECTED: organizations.filter(
        (organization) => organization.status === 'REJECTED'
      ).length,
    };
  }, [organizations]);

  const filteredOrganizations = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return organizations.filter((organization) => {
      const matchesSearch =
        !searchText ||
        organization.organizationCode
          ?.toLowerCase()
          .includes(searchText) ||
        organization.name
          ?.toLowerCase()
          .includes(searchText) ||
        organization.email
          ?.toLowerCase()
          .includes(searchText) ||
        organization.mobile
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === 'ALL' ||
        organization.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [organizations, search, statusFilter]);

  const statusCards = [
    {
      key: 'ALL' as StatusFilter,
      icon: '🏢',
      title: 'All Organizations',
      description: 'View every organization',
      count: counts.ALL,
      className: 'all',
    },
    {
      key: 'PENDING' as StatusFilter,
      icon: '🔔',
      title: 'Pending',
      description: 'Waiting for approval',
      count: counts.PENDING,
      className: 'pending',
    },
    {
      key: 'ACTIVE' as StatusFilter,
      icon: '✓',
      title: 'Active',
      description: 'Currently active',
      count: counts.ACTIVE,
      className: 'active',
    },
    {
      key: 'DISABLED' as StatusFilter,
      icon: 'Ⅱ',
      title: 'Disabled',
      description: 'Currently disabled',
      count: counts.DISABLED,
      className: 'disabled',
    },
    {
      key: 'REJECTED' as StatusFilter,
      icon: '×',
      title: 'Rejected',
      description: 'Rejected organizations',
      count: counts.REJECTED,
      className: 'rejected',
    },
  ];

  if (loading) {
    return (
      <div className="organizations-page">
        <div className="organizations-loading">
          Loading organizations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="organizations-page">
        <div className="organization-error-state">
          <div className="error-icon">!</div>

          <h2>Unable to load organizations</h2>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="organizations-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="organizations-header">
        <div>
          <h1>Organizations</h1>

          <p>
            Manage organizations registered with Zenvyra.
          </p>
        </div>

        <button
          className="create-organization-button"
          onClick={() =>
            navigate('/organizations/create')
          }
        >
          + Create Organization
        </button>
      </div>

      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      <section className="organization-overview">

        <div className="overview-header">
          <div>
            <h2>Organization Overview</h2>

            <p>
              Select a category below to view organizations.
            </p>
          </div>

          {counts.PENDING > 0 && (
            <div className="pending-notification">
              <span className="pending-notification-icon">
                🔔
              </span>

              <div>
                <strong>
                  {counts.PENDING} organization
                  {counts.PENDING !== 1 ? 's' : ''} pending
                </strong>

                <span>
                  Waiting for Super Admin approval
                </span>
              </div>

              <button
                onClick={() =>
                  setStatusFilter('PENDING')
                }
              >
                Review
              </button>
            </div>
          )}
        </div>

        {/* ===================================================
            VERTICAL STATUS LIST
        =================================================== */}

        <div className="status-list">

          {statusCards.map((card) => (
            <button
              key={card.key}
              type="button"
              className={`status-row status-row-${card.className} ${
                statusFilter === card.key
                  ? 'status-row-selected'
                  : ''
              }`}
              onClick={() =>
                setStatusFilter(card.key)
              }
            >

              <div className="status-row-icon">
                {card.icon}
              </div>

              <div className="status-row-count">
                {card.count}
              </div>

              <div className="status-row-content">
                <div className="status-row-title">
                  {card.title}
                </div>

                <div className="status-row-description">
                  {card.description}
                </div>
              </div>

              {card.key === 'PENDING' &&
                card.count > 0 && (
                  <span className="pending-count-badge">
                    {card.count}
                  </span>
                )}

              <div className="status-row-action"><span>→</span></div>

            </button>
          ))}

        </div>
      </section>

      {/* =====================================================
          ORGANIZATION LIST
      ===================================================== */}

      <section className="organization-results">

        <div className="results-header">

          <div>
            <h2>
              {statusFilter === 'ALL'
                ? 'All Organizations'
                : statusFilter === 'PENDING'
                ? 'Pending Organizations'
                : statusFilter === 'ACTIVE'
                ? 'Active Organizations'
                : statusFilter === 'DISABLED'
                ? 'Disabled Organizations'
                : 'Rejected Organizations'}
            </h2>

            <p>
              Showing {filteredOrganizations.length} of{' '}
              {organizations.length} organizations
            </p>
          </div>

          <button
            className="back-overview-button"
            onClick={() => setStatusFilter('ALL')}
          >
            Overview
          </button>

        </div>

        {/* SEARCH */}

        <div className="organization-search">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search by name, code, email or mobile..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch('')}
            >
              ×
            </button>
          )}

        </div>

        {/* TABLE */}

        {filteredOrganizations.length === 0 ? (
          <div className="organization-empty">
            <div className="empty-icon">
              🏢
            </div>

            <h3>No organizations found</h3>

            <p>
              There are no organizations matching
              your current selection.
            </p>
          </div>
        ) : (
          <div className="organization-table-container">

            <table className="organization-table">

              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Code</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrganizations.map(
                  (organization) => (
                    <tr key={organization.id}>

                      <td>
                        <div className="organization-name">
                          <div className="organization-avatar">
                            {organization.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {organization.name}
                            </strong>

                            <span>
                              {organization.businessType ||
                                'Organization'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="organization-code">
                          {organization.organizationCode}
                        </span>
                      </td>

                      <td>
                        {organization.email || '—'}
                      </td>

                      <td>
                        {organization.mobile || '—'}
                      </td>

                      <td>
                        <StatusBadge
                          status={organization.status}
                        />
                      </td>

                      <td>
                        <button
                          className="view-organization-button"
                          onClick={() =>
                            navigate(
                              `/workspace/${organization.id}/dashboard`
                            )
                          }
                        >
                          View
                        </button>
                      </td>

                    </tr>
                  )
                )}
              </tbody>

            </table>

          </div>
        )}

      </section>
    </div>
  );
}

export default Organizations;