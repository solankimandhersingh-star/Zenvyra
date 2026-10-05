import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  getInvoices,
  getInvoiceById,
  cacheInvoiceForPrint,
} from '../services/invoiceService';

import type {
  InvoiceResponse,
} from '../types/invoice';

import './InvoiceListPage.css';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (
  value?: string | null
) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : '—';

export default function InvoiceListPage() {
  const navigate = useNavigate();

  const {
    id: workspaceId,
  } = useParams<{ id?: string }>();

  const [invoices, setInvoices] =
    useState<InvoiceResponse[]>([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const basePath = workspaceId
    ? `/workspace/${workspaceId}/invoices`
    : '/invoices';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const data =
          await getInvoices();

        setInvoices(data);
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            'Unable to load invoices.'
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId]);

  const filteredInvoices =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return invoices;
      }

      return invoices.filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(query) ||
          invoice.buyerName
            .toLowerCase()
            .includes(query) ||
          invoice.status
            .toLowerCase()
            .includes(query)
      );
    }, [invoices, search]);

  const openInvoice = async (
    invoiceId: string
  ) => {
    /*
     * Open the tab immediately so the browser
     * does not block it as a popup.
     */
    const printWindow =
      window.open(
        'about:blank',
        '_blank'
      );

    try {
      const invoice =
        await getInvoiceById(invoiceId);

      cacheInvoiceForPrint(invoice);

      const target = workspaceId
        ? `/workspace/${workspaceId}/invoices/${invoiceId}?print=1`
        : `/invoices/${invoiceId}?print=1`;

      if (printWindow) {
        printWindow.location.href =
          target;
      } else {
        window.open(
          target,
          '_blank',
          'noopener,noreferrer'
        );
      }
    } catch (error) {
      printWindow?.close();

      console.error(
        'Unable to open invoice:',
        error
      );

      alert(
        'Unable to open invoice.'
      );
    }
  };

  return (
    <div className="invoice-list-page">

      <div className="invoice-list-header">

        <div>
          <span className="invoice-list-eyebrow">
            BILLING · INVOICE REGISTER
          </span>

          <h1>View Invoices</h1>

          <p>
            Search invoices and open the
            print-ready document.
          </p>
        </div>

        <div className="invoice-list-actions">

          <button
            type="button"
            className="invoice-list-secondary"
            onClick={() =>
              navigate(basePath)
            }
          >
            ← Invoice Dashboard
          </button>

          <button
            type="button"
            className="invoice-list-primary"
            onClick={() =>
              navigate(
                `${basePath}/create`
              )
            }
          >
            + Create Invoice
          </button>

        </div>

      </div>

      {error && (
        <div className="invoice-list-error">
          <strong>
            Unable to load invoices
          </strong>

          <span>{error}</span>
        </div>
      )}

      <section className="invoice-list-card">

        <div className="invoice-list-toolbar">

          <div>
            <strong>
              {loading
                ? 'Invoices'
                : `${invoices.length} invoice${
                    invoices.length === 1
                      ? ''
                      : 's'
                  }`}
            </strong>

            <span>
              View Invoice opens the
              document in a new tab.
            </span>
          </div>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search invoice, customer or status..."
          />

        </div>

        {loading ? (
          <div className="invoice-list-empty">
            Loading invoices...
          </div>
        ) : filteredInvoices.length ===
          0 ? (
          <div className="invoice-list-empty">
            <strong>
              No invoices found
            </strong>

            <span>
              {invoices.length > 0
                ? 'Try a different search.'
                : 'Create your first invoice from the dashboard.'}
            </span>
          </div>
        ) : (
          <div className="invoice-list-table-wrap">

            <table className="invoice-list-table">

              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map(
                  (invoice) => (
                    <tr key={invoice.id}>

                      <td>
                        <strong>
                          {invoice.invoiceNumber}
                        </strong>
                      </td>

                      <td>
                        {invoice.buyerName}
                      </td>

                      <td>
                        {formatDate(
                          invoice.invoiceDate
                        )}
                      </td>

                      <td>
                        {formatDate(
                          invoice.dueDate
                        )}
                      </td>

                      <td>
                        <span
                          className={`invoice-list-status ${invoice.status
                            .toLowerCase()
                            .replaceAll(
                              '_',
                              '-'
                            )}`}
                        >
                          {invoice.status.replaceAll(
                            '_',
                            ' '
                          )}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {money(
                            invoice.grandTotal
                          )}
                        </strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="invoice-list-view"
                          onClick={() =>
                            openInvoice(
                              invoice.id
                            )
                          }
                        >
                          View Invoice
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