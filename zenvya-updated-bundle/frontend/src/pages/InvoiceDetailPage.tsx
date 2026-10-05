import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import {
  getInvoiceById,
  getCachedInvoiceForPrint,
  cacheInvoiceForPrint,
} from '../services/invoiceService';

import type {
  InvoiceResponse,
} from '../types/invoice';

import './InvoiceDetailPage.css';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const date = (
  value?: string | null
) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : '—';

const numberToWords = (
  value: number
): string => {
  const amount = Math.round(
    Number(value || 0)
  );

  if (amount === 0) {
    return 'Zero Rupees Only';
  }

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const twoDigit = (
    number: number
  ): string => {
    if (number < 20) {
      return ones[number];
    }

    return (
      tens[Math.floor(number / 10)] +
      (number % 10
        ? ` ${ones[number % 10]}`
        : '')
    );
  };

  const convert = (
    number: number
  ): string => {
    if (number < 100) {
      return twoDigit(number);
    }

    if (number < 1000) {
      return `${ones[
        Math.floor(number / 100)
      ]} Hundred${
        number % 100
          ? ` ${convert(number % 100)}`
          : ''
      }`;
    }

    if (number < 100000) {
      return `${convert(
        Math.floor(number / 1000)
      )} Thousand${
        number % 1000
          ? ` ${convert(number % 1000)}`
          : ''
      }`;
    }

    if (number < 10000000) {
      return `${convert(
        Math.floor(number / 100000)
      )} Lakh${
        number % 100000
          ? ` ${convert(number % 100000)}`
          : ''
      }`;
    }

    return `${convert(
      Math.floor(number / 10000000)
    )} Crore${
      number % 10000000
        ? ` ${convert(number % 10000000)}`
        : ''
    }`;
  };

  return `${convert(amount)} Rupees Only`;
};

export default function InvoiceDetailPage() {
  const {
    id: invoiceId,
    invoiceId: workspaceInvoiceId,
  } = useParams<{
    id?: string;
    invoiceId?: string;
  }>();

  const [
    searchParams,
  ] = useSearchParams();

  const navigate = useNavigate();

  const actualInvoiceId =
    invoiceId || workspaceInvoiceId;

  const [
    invoice,
    setInvoice,
  ] = useState<InvoiceResponse | null>(
    null
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const printMode =
    searchParams.get('print') === '1';

  useEffect(() => {
    if (!actualInvoiceId) {
      setError(
        'Invoice ID is missing.'
      );

      setLoading(false);

      return;
    }

    const cached =
      getCachedInvoiceForPrint(
        actualInvoiceId
      );

    if (cached) {
      setInvoice(cached);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        const data =
          await getInvoiceById(
            actualInvoiceId
          );

        cacheInvoiceForPrint(data);

        setInvoice(data);
      } catch (err: any) {
        console.error(
          'Failed to load invoice:',
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Unable to load invoice.'
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [actualInvoiceId]);

  useEffect(() => {
    if (
      !printMode ||
      !invoice
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        window.print();
      }, 700);

    return () =>
      window.clearTimeout(timer);
  }, [printMode, invoice]);

  if (loading) {
    return (
      <div className="invoice-detail-loading">
        Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-error">
        <h2>
          Unable to open invoice
        </h2>

        <p>
          {error ||
            'Invoice could not be loaded.'}
        </p>

        <button
          className="invoice-print-button"
          onClick={() =>
            navigate(-1)
          }
        >
          Go Back
        </button>
      </div>
    );
  }

  const subtotal =
    Number(invoice.subtotal || 0);

  const discount =
    Number(
      invoice.discountAmount || 0
    );

  const taxable =
    Number(
      invoice.taxableAmount || 0
    );

  const cgst =
    Number(invoice.cgstAmount || 0);

  const sgst =
    Number(invoice.sgstAmount || 0);

  const igst =
    Number(invoice.igstAmount || 0);

  const roundOff =
    Number(invoice.roundOff || 0);

  const grandTotal =
    Number(invoice.grandTotal || 0);

  return (
    <div className="invoice-detail-page">

      <div className="invoice-print-toolbar">

        <button
          type="button"
          onClick={() =>
            window.print()
          }
          className="invoice-print-button"
        >
          🖨 Print / Save PDF
        </button>

        <button
          type="button"
          onClick={() =>
            window.close()
          }
          className="invoice-close-button"
        >
          Close
        </button>

      </div>

      <main className="print-invoice">

        <header className="invoice-document-header">

          <div className="seller-block">

            <h1>
              {invoice.sellerName}
            </h1>

            {invoice.sellerGstin && (
              <p>
                <strong>
                  GSTIN:
                </strong>{' '}
                {invoice.sellerGstin}
              </p>
            )}

            {invoice.sellerAddress && (
              <p>
                {invoice.sellerAddress}
              </p>
            )}

            {invoice.sellerState && (
              <p>
                {invoice.sellerState}
                {invoice.sellerStateCode
                  ? ` · ${invoice.sellerStateCode}`
                  : ''}
              </p>
            )}

            {invoice.sellerEmail && (
              <p>
                {invoice.sellerEmail}
              </p>
            )}

            {invoice.sellerMobile && (
              <p>
                {invoice.sellerMobile}
              </p>
            )}

          </div>

          <div className="invoice-title-block">

            <span>
              TAX INVOICE
            </span>

            <strong>
              {invoice.invoiceNumber}
            </strong>

            <div>
              <label>
                Invoice Date
              </label>

              <b>
                {date(
                  invoice.invoiceDate
                )}
              </b>
            </div>

            {invoice.dueDate && (
              <div>
                <label>
                  Due Date
                </label>

                <b>
                  {date(
                    invoice.dueDate
                  )}
                </b>
              </div>
            )}

            <span
              className={`invoice-status-print ${invoice.status
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

          </div>

        </header>

        <section className="invoice-parties">

          <div>
            <span>
              BILL TO
            </span>

            <h3>
              {invoice.buyerName}
            </h3>

            {invoice.buyerGstin && (
              <p>
                <strong>
                  GSTIN:
                </strong>{' '}
                {invoice.buyerGstin}
              </p>
            )}

            {invoice.buyerAddress && (
              <p>
                {invoice.buyerAddress}
              </p>
            )}

            {invoice.buyerState && (
              <p>
                {invoice.buyerState}
                {invoice.buyerStateCode
                  ? ` · ${invoice.buyerStateCode}`
                  : ''}
              </p>
            )}

            {invoice.buyerEmail && (
              <p>
                {invoice.buyerEmail}
              </p>
            )}

            {invoice.buyerMobile && (
              <p>
                {invoice.buyerMobile}
              </p>
            )}
          </div>

          <div>
            <span>
              SHIP TO
            </span>

            <h3>
              {invoice.shippingName ||
                invoice.buyerName}
            </h3>

            <p>
              {invoice.shippingAddress ||
                invoice.buyerAddress ||
                'Same as billing address'}
            </p>

            {invoice.shippingState && (
              <p>
                {invoice.shippingState}
                {invoice.shippingStateCode
                  ? ` · ${invoice.shippingStateCode}`
                  : ''}
              </p>
            )}

            {invoice.placeOfSupply && (
              <p>
                <strong>
                  Place of Supply:
                </strong>{' '}
                {invoice.placeOfSupply}
                {invoice.placeOfSupplyCode
                  ? ` (${invoice.placeOfSupplyCode})`
                  : ''}
              </p>
            )}

          </div>

        </section>

        <section className="invoice-items-table-section">

          <table className="invoice-document-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>HSN/SAC</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Taxable</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items.map(
                (item) => (
                  <tr
                    key={item.id}
                  >
                    <td>
                      {item.lineNumber}
                    </td>

                    <td>
                      <strong>
                        {item.productName}
                      </strong>

                      {item.productCode && (
                        <small>
                          {item.productCode}
                        </small>
                      )}

                      {item.description && (
                        <small>
                          {item.description}
                        </small>
                      )}
                    </td>

                    <td>
                      {item.hsnSac ||
                        '—'}
                    </td>

                    <td>
                      {Number(
                        item.quantity
                      ).toFixed(
                        3
                      )}
                    </td>

                    <td>
                      {item.unit}
                    </td>

                    <td>
                      {money(
                        Number(
                          item.unitPrice
                        )
                      )}
                    </td>

                    <td>
                      {money(
                        Number(
                          item.taxableValue
                        )
                      )}
                    </td>

                    <td>
                      {item.taxRate}%
                    </td>

                    <td>
                      <strong>
                        {money(
                          Number(
                            item.totalAmount
                          )
                        )}
                      </strong>
                    </td>

                  </tr>
                )
              )}
            </tbody>

          </table>

        </section>

        <section className="invoice-summary-area">

          <div className="invoice-amount-words">

            <span>
              AMOUNT IN WORDS
            </span>

            <strong>
              {invoice.amountInWords ||
                numberToWords(
                  grandTotal
                )}
            </strong>

          </div>

          <div className="invoice-total-box">

            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {money(subtotal)}
              </strong>
            </div>

            {discount > 0 && (
              <div>
                <span>
                  Discount
                </span>

                <strong>
                  -{money(discount)}
                </strong>
              </div>
            )}

            <div>
              <span>
                Taxable Amount
              </span>

              <strong>
                {money(taxable)}
              </strong>
            </div>

            {cgst > 0 && (
              <div>
                <span>
                  CGST
                </span>

                <strong>
                  {money(cgst)}
                </strong>
              </div>
            )}

            {sgst > 0 && (
              <div>
                <span>
                  SGST
                </span>

                <strong>
                  {money(sgst)}
                </strong>
              </div>
            )}

            {igst > 0 && (
              <div>
                <span>
                  IGST
                </span>

                <strong>
                  {money(igst)}
                </strong>
              </div>
            )}

            {roundOff !== 0 && (
              <div>
                <span>
                  Round Off
                </span>

                <strong>
                  {money(roundOff)}
                </strong>
              </div>
            )}

            <div className="invoice-grand-total-print">

              <span>
                GRAND TOTAL
              </span>

              <strong>
                {money(grandTotal)}
              </strong>

            </div>

          </div>

        </section>

        <section className="invoice-footer-grid">

          <div>

            {(invoice.bankName ||
              invoice.accountNumber ||
              invoice.ifscCode) && (
              <>
                <h3>
                  Payment Information
                </h3>

                {invoice.bankName && (
                  <p>
                    <strong>
                      Bank:
                    </strong>{' '}
                    {invoice.bankName}
                  </p>
                )}

                {invoice.accountNumber && (
                  <p>
                    <strong>
                      Account:
                    </strong>{' '}
                    {invoice.accountNumber}
                  </p>
                )}

                {invoice.ifscCode && (
                  <p>
                    <strong>
                      IFSC:
                    </strong>{' '}
                    {invoice.ifscCode}
                  </p>
                )}

                {invoice.accountType && (
                  <p>
                    <strong>
                      Type:
                    </strong>{' '}
                    {invoice.accountType}
                  </p>
                )}

                {invoice.bankBranch && (
                  <p>
                    <strong>
                      Branch:
                    </strong>{' '}
                    {invoice.bankBranch}
                  </p>
                )}
              </>
            )}

            {invoice.termsAndConditions && (
              <div className="invoice-terms">

                <h3>
                  Terms & Conditions
                </h3>

                <p>
                  {
                    invoice.termsAndConditions
                  }
                </p>

              </div>
            )}

          </div>

          <div className="invoice-signature">

            <span>
              For {invoice.sellerName}
            </span>

            <div className="signature-space" />

            <strong>
              {invoice.authorizedSignatoryName ||
                'Authorized Signatory'}
            </strong>

          </div>

        </section>

        <footer className="invoice-document-footer">
          Invoice generated & securely
          managed with Zenvyra
        </footer>

      </main>

    </div>
  );
}