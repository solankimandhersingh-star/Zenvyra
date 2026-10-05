import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import './ModulePages.css';

import { getInvoices } from '../services/invoiceService';
import type {
  InvoiceResponse,
  InvoiceStatus,
} from '../types/invoice';

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="dashboard-metric">
      <span className="metric-icon">{icon}</span>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default function Invoices() {
  const navigate = useNavigate();
  const { id: workspaceId } = useParams<{
    id: string;
  }>();

  const [invoices, setInvoices] = useState<
    InvoiceResponse[]
  >([]);

  const [loading, setLoading] = useState(true);

  const isWorkspace = Boolean(workspaceId);

  const basePath = isWorkspace
    ? `/workspace/${workspaceId}/invoices`
    : '/invoices';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const data = await getInvoices();

        setInvoices(data);
      } catch (error) {
        console.error(
          'Failed to load invoices:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId]);

  const count = (status: InvoiceStatus) =>
    invoices.filter(
      (invoice) => invoice.status === status
    ).length;

  const totalValue = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.grandTotal || 0),
    0
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="dashboard-page">

      <div className="page-header dashboard-header">
        <div>
          <span className="eyebrow">
            BILLING
          </span>

          <h1>Invoices</h1>

          <p>
            Create, manage and track your
            organization invoices.
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <Metric
          label="Total invoices"
          value={
            loading
              ? '—'
              : invoices.length
          }
          icon="I"
        />

        <Metric
          label="Draft"
          value={
            loading
              ? '—'
              : count('DRAFT')
          }
          icon="D"
        />

        <Metric
          label="Issued"
          value={
            loading
              ? '—'
              : count('ISSUED')
          }
          icon="↑"
        />

        <Metric
          label="Paid"
          value={
            loading
              ? '—'
              : count('PAID')
          }
          icon="✓"
        />
      </div>

      <div className="workspace-banner">
        <div className="workspace-banner-icon">
          ₹
        </div>

        <div>
          <strong>
            Total invoice value
          </strong>

          <p>
            {loading
              ? 'Loading invoice information...'
              : formatCurrency(totalValue)}
          </p>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Invoice workspace</h2>

          <p>
            Create a new invoice or manage
            existing invoices.
          </p>
        </div>
      </div>

      <div className="module-grid">

        <button
          type="button"
          className="module-card"
          onClick={() =>
            navigate(`${basePath}/create`)
          }
        >
          <span className="module-icon">
            +
          </span>

          <span>
            <strong>
              Create Invoice
            </strong>

            <small>
              Create a detailed GST invoice
            </small>
          </span>

          <b>→</b>
        </button>

        <button
          type="button"
          className="module-card"
          onClick={() =>
            navigate(`${basePath}/list`)
          }
        >
          <span className="module-icon">
            I
          </span>

          <span>
            <strong>
              View Invoices
            </strong>

            <small>
              Search and manage invoices
            </small>
          </span>

          <b>→</b>
        </button>

      </div>

    </div>
  );
}