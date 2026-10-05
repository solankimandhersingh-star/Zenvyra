import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../api';

import {
  createInvoice,
} from '../services/invoiceService';

import type {
  CreateInvoiceRequest,
} from '../types/invoice';

import './InvoiceCreatePage.css';

type Customer = {
  id: string;
  name?: string;
  customerName?: string;
  displayName?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  address?: string;
  state?: string;
  stateCode?: string;
};

type Product = {
  id: string;
  name?: string;
  productName?: string;
  code?: string;
  productCode?: string;
  unit?: string;
  price?: number;
  sellingPrice?: number;
  unitPrice?: number;
  gstRate?: number;
  taxRate?: number;
  hsnSac?: string;
};

type InvoiceLine = {
  productId: string;
  quantity: string;
  discountAmount: string;
  taxTreatment: 'NONE' | 'GST_INCLUDED' | 'GST_EXTRA';
  taxRate: string;
};

const today = new Date()
  .toISOString()
  .slice(0, 10);

const emptyLine = (): InvoiceLine => ({
  productId: '',
  quantity: '1',
  discountAmount: '0',
  taxTreatment: 'GST_EXTRA',
  taxRate: '',
});

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function InvoiceCreatePage() {
  const navigate = useNavigate();

  const { id: workspaceId } =
    useParams<{ id?: string }>();

  const invoiceBasePath = workspaceId
    ? `/workspace/${workspaceId}/invoices`
    : '/invoices';

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loadingData, setLoadingData] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [customerId, setCustomerId] =
    useState('');

  const [invoiceDate, setInvoiceDate] =
    useState(today);

  const [dueDate, setDueDate] =
    useState('');

  const [placeOfSupply, setPlaceOfSupply] =
    useState('');

  const [placeOfSupplyCode, setPlaceOfSupplyCode] =
    useState('');

  const [reverseCharge, setReverseCharge] =
    useState(false);

  const [shippingName, setShippingName] =
    useState('');

  const [shippingAddress, setShippingAddress] =
    useState('');

  const [shippingState, setShippingState] =
    useState('');

  const [shippingStateCode, setShippingStateCode] =
    useState('');

  const [bankName, setBankName] =
    useState('');

  const [accountNumber, setAccountNumber] =
    useState('');

  const [ifscCode, setIfscCode] =
    useState('');

  const [accountType, setAccountType] =
    useState('');

  const [bankBranch, setBankBranch] =
    useState('');

  const [termsAndConditions, setTermsAndConditions] =
    useState('');

  const [authorizedSignatoryName, setAuthorizedSignatoryName] =
    useState('');

  const [items, setItems] =
    useState<InvoiceLine[]>([
      emptyLine(),
    ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        const [
          customerResponse,
          productResponse,
        ] = await Promise.all([
          api.get('/customers'),
          api.get('/products'),
        ]);

        const customerData =
          customerResponse.data;

        const productData =
          productResponse.data;

        setCustomers(
          Array.isArray(customerData)
            ? customerData
            : customerData?.content || []
        );

        setProducts(
          Array.isArray(productData)
            ? productData
            : productData?.content || []
        );
      } catch (err: any) {
        console.error(
          'Unable to load invoice data:',
          err
        );

        setError(
          err?.response?.data?.message ||
            'Unable to load customers and products.'
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const selectedCustomer = useMemo(
    () =>
      customers.find(
        (customer) =>
          customer.id === customerId
      ),
    [customers, customerId]
  );

  const getProduct = (productId: string) =>
    products.find(
      (product) =>
        product.id === productId
    );

  const getProductName = (
    product: Product
  ) =>
    product.name ||
    product.productName ||
    'Product';

  const getProductCode = (
    product: Product
  ) =>
    product.code ||
    product.productCode ||
    '';

  const getProductPrice = (
    product: Product
  ) =>
    Number(
      product.price ??
        product.sellingPrice ??
        product.unitPrice ??
        0
    );

  const getProductTax = (
    product: Product
  ) =>
    Number(
      product.gstRate ??
        product.taxRate ??
        0
    );

  const updateItem = (
    index: number,
    changes: Partial<InvoiceLine>
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      emptyLine(),
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const calculateLine = (
    item: InvoiceLine
  ) => {
    const product = getProduct(
      item.productId
    );

    if (!product) {
      return {
        taxable: 0,
        gst: 0,
        total: 0,
      };
    }

    const quantity =
      Number(item.quantity) || 0;

    const unitPrice =
      getProductPrice(product);

    const discount =
      Number(item.discountAmount) || 0;

    const gross =
      quantity * unitPrice;

    const afterDiscount =
      Math.max(
        gross - discount,
        0
      );

    let taxable = afterDiscount;
    let gst = 0;

    const rate =
      item.taxRate.trim() === ''
        ? getProductTax(product)
        : Number(item.taxRate);

    if (
      item.taxTreatment ===
      'GST_INCLUDED'
    ) {
      taxable =
        rate > 0
          ? afterDiscount /
            (1 + rate / 100)
          : afterDiscount;

      gst =
        afterDiscount - taxable;
    }

    if (
      item.taxTreatment ===
      'GST_EXTRA'
    ) {
      taxable =
        afterDiscount;

      gst =
        taxable * rate / 100;
    }

    return {
      taxable,
      gst,
      total:
        item.taxTreatment ===
        'GST_INCLUDED'
          ? afterDiscount
          : taxable + gst,
    };
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let taxable = 0;
    let gst = 0;
    let total = 0;

    items.forEach((item) => {
      const product = getProduct(
        item.productId
      );

      if (!product) {
        return;
      }

      const quantity =
        Number(item.quantity) || 0;

      const unitPrice =
        getProductPrice(product);

      const itemDiscount =
        Number(item.discountAmount) ||
        0;

      subtotal +=
        quantity * unitPrice;

      discount += itemDiscount;

      const line =
        calculateLine(item);

      taxable += line.taxable;
      gst += line.gst;
      total += line.total;
    });

    return {
      subtotal,
      discount,
      taxable,
      gst,
      total,
    };
  }, [items, products]);

  const handleCustomerChange = (
    value: string
  ) => {
    setCustomerId(value);

    const customer =
      customers.find(
        (item) =>
          item.id === value
      );

    if (!customer) {
      return;
    }

    const customerName =
      customer.name ||
      customer.customerName ||
      customer.displayName ||
      '';

    setShippingName(
      customerName
    );

    setShippingAddress(
      customer.address || ''
    );

    setShippingState(
      customer.state || ''
    );

    setShippingStateCode(
      customer.stateCode || ''
    );

    if (!placeOfSupply) {
      setPlaceOfSupply(
        customer.state || ''
      );
    }

    if (!placeOfSupplyCode) {
      setPlaceOfSupplyCode(
        customer.stateCode || ''
      );
    }
  };

  const handleProductChange = (
    index: number,
    productId: string
  ) => {
    const product =
      getProduct(productId);

    updateItem(index, {
      productId,
      taxRate:
        product &&
        getProductTax(product) > 0
          ? String(
              getProductTax(product)
            )
          : '',
    });
  };

  const saveInvoice = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError('');

    if (!customerId) {
      setError(
        'Please select a customer.'
      );
      return;
    }

    if (
      items.some(
        (item) =>
          !item.productId
      )
    ) {
      setError(
        'Please select a product for every invoice item.'
      );
      return;
    }

    try {
      setSaving(true);

      const request: CreateInvoiceRequest =
        {
          invoiceDate,
          dueDate:
            dueDate || undefined,
          customerId,

          shippingName:
            shippingName || undefined,

          shippingAddress:
            shippingAddress ||
            undefined,

          shippingState:
            shippingState ||
            undefined,

          shippingStateCode:
            shippingStateCode ||
            undefined,

          placeOfSupply:
            placeOfSupply ||
            undefined,

          placeOfSupplyCode:
            placeOfSupplyCode ||
            undefined,

          reverseCharge,

          bankName:
            bankName || undefined,

          accountNumber:
            accountNumber ||
            undefined,

          ifscCode:
            ifscCode || undefined,

          accountType:
            accountType ||
            undefined,

          bankBranch:
            bankBranch ||
            undefined,

          termsAndConditions:
            termsAndConditions ||
            undefined,

          authorizedSignatoryName:
            authorizedSignatoryName ||
            undefined,

          items: items.map(
            (item) => ({
              productId:
                item.productId,

              quantity:
                Number(
                  item.quantity
                ),

              discountAmount:
                Number(
                  item.discountAmount
                ) || 0,

              taxTreatment:
                item.taxTreatment,

              taxRate:
                item.taxRate.trim() === ''
                  ? undefined
                  : Number(
                      item.taxRate
                    ),
            })
          ),
        };

      const invoice =
        await createInvoice(
          request
        );

      if (!invoice?.id) {
        throw new Error(
          'Invoice was created but no invoice ID was returned.'
        );
      }

      const invoiceUrl =
        workspaceId
          ? `/workspace/${workspaceId}/invoices/${invoice.id}?print=1`
          : `/invoices/${invoice.id}?print=1`;

      window.open(
        invoiceUrl,
        '_blank',
        'noopener,noreferrer'
      );

      navigate(invoiceBasePath);
    } catch (err: any) {
      console.error(
        'Invoice creation failed:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to create invoice.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="invoice-create-page">

      <div className="invoice-create-header">

        <div>
          <div className="invoice-breadcrumb">
            BILLING
            <span>•</span>
            NEW INVOICE
          </div>

          <h1>
            Create Invoice
          </h1>

          <p>
            Create a professional GST
            invoice using your
            organization, customer and
            product data.
          </p>
        </div>

        <button
          type="button"
          className="invoice-secondary-button"
          onClick={() =>
            navigate(invoiceBasePath)
          }
        >
          ← Invoice Dashboard
        </button>

      </div>

      {error && (
        <div className="invoice-form-error">
          <strong>
            Unable to save invoice
          </strong>

          <span>
            {error}
          </span>
        </div>
      )}

      <form
        onSubmit={saveInvoice}
        className="invoice-create-form"
      >

        {/* INVOICE DETAILS */}

        <section className="invoice-section-card">

          <div className="invoice-section-heading">
            <div>
              <span className="section-number">
                01
              </span>

              <div>
                <h2>
                  Invoice Details
                </h2>

                <p>
                  Basic invoice information
                </p>
              </div>
            </div>
          </div>

          <div className="invoice-form-grid three">

            <label>
              <span>
                Customer
                <b>*</b>
              </span>

              <select
                value={customerId}
                onChange={(event) =>
                  handleCustomerChange(
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Select customer
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name ||
                        customer.customerName ||
                        customer.displayName}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              <span>
                Invoice Date
                <b>*</b>
              </span>

              <input
                type="date"
                value={invoiceDate}
                onChange={(event) =>
                  setInvoiceDate(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              <span>
                Due Date
              </span>

              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              <span>
                Place of Supply
              </span>

              <input
                value={placeOfSupply}
                onChange={(event) =>
                  setPlaceOfSupply(
                    event.target.value
                  )
                }
                placeholder="e.g. Telangana"
              />
            </label>

            <label>
              <span>
                State Code
              </span>

              <input
                value={placeOfSupplyCode}
                onChange={(event) =>
                  setPlaceOfSupplyCode(
                    event.target.value
                  )
                }
                placeholder="e.g. 36"
              />
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={reverseCharge}
                onChange={(event) =>
                  setReverseCharge(
                    event.target.checked
                  )
                }
              />

              <span>
                Reverse charge applicable
              </span>
            </label>

          </div>

          {selectedCustomer && (
            <div className="selected-customer">
              <div className="selected-customer-icon">
                {(selectedCustomer.name ||
                  selectedCustomer.customerName ||
                  selectedCustomer.displayName ||
                  'C')
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {selectedCustomer.name ||
                    selectedCustomer.customerName ||
                    selectedCustomer.displayName}
                </strong>

                <span>
                  {selectedCustomer.email ||
                    selectedCustomer.mobile ||
                    selectedCustomer.phone ||
                    'Customer selected'}
                </span>
              </div>
            </div>
          )}

        </section>

        {/* ITEMS */}

        <section className="invoice-section-card">

          <div className="invoice-section-heading invoice-items-heading">

            <div>
              <span className="section-number">
                02
              </span>

              <div>
                <h2>
                  Invoice Items
                </h2>

                <p>
                  Products, pricing and GST
                </p>
              </div>
            </div>

            <button
              type="button"
              className="add-item-button"
              onClick={addItem}
            >
              + Add Item
            </button>

          </div>

          <div className="invoice-items-table">

            <div className="invoice-item-header">
              <span>
                Product
              </span>

              <span>
                Qty
              </span>

              <span>
                Discount
              </span>

              <span>
                Tax Treatment
              </span>

              <span>
                GST %
              </span>

              <span>
                Amount
              </span>

              <span />
            </div>

            {items.map(
              (item, index) => {
                const product =
                  getProduct(
                    item.productId
                  );

                const line =
                  calculateLine(item);

                return (
                  <div
                    className="invoice-item-row"
                    key={index}
                  >

                    <div>
                      <select
                        value={
                          item.productId
                        }
                        onChange={(
                          event
                        ) =>
                          handleProductChange(
                            index,
                            event.target
                              .value
                          )
                        }
                        required
                      >
                        <option value="">
                          Select product
                        </option>

                        {products.map(
                          (productItem) => (
                            <option
                              key={
                                productItem.id
                              }
                              value={
                                productItem.id
                              }
                            >
                              {getProductName(
                                productItem
                              )}
                            </option>
                          )
                        )}
                      </select>

                      {product && (
                        <small>
                          {getProductCode(
                            product
                          )}

                          {product.hsnSac
                            ? ` • HSN/SAC ${product.hsnSac}`
                            : ''}
                        </small>
                      )}
                    </div>

                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={
                        item.quantity
                      }
                      onChange={(event) =>
                        updateItem(
                          index,
                          {
                            quantity:
                              event.target
                                .value,
                          }
                        )
                      }
                      required
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        item.discountAmount
                      }
                      onChange={(event) =>
                        updateItem(
                          index,
                          {
                            discountAmount:
                              event.target
                                .value,
                          }
                        )
                      }
                    />

                    <select
                      value={
                        item.taxTreatment
                      }
                      onChange={(event) =>
                        updateItem(
                          index,
                          {
                            taxTreatment:
                              event.target
                                .value as InvoiceLine['taxTreatment'],
                          }
                        )
                      }
                    >
                      <option value="NONE">
                        No GST
                      </option>

                      <option value="GST_INCLUDED">
                        GST Included
                      </option>

                      <option value="GST_EXTRA">
                        GST Extra
                      </option>
                    </select>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder={
                        product
                          ? String(
                              getProductTax(
                                product
                              )
                            )
                          : '0'
                      }
                      value={
                        item.taxRate
                      }
                      onChange={(event) =>
                        updateItem(
                          index,
                          {
                            taxRate:
                              event.target
                                .value,
                          }
                        )
                      }
                    />

                    <div className="line-total">
                      {money(
                        line.total
                      )}
                    </div>

                    <button
                      type="button"
                      className="remove-item-button"
                      onClick={() =>
                        removeItem(index)
                      }
                      disabled={
                        items.length === 1
                      }
                      title="Remove item"
                    >
                      ×
                    </button>

                  </div>
                );
              }
            )}

          </div>

          <div className="invoice-item-hint">
            Product price, unit and default
            GST are loaded from Product
            Service. You can override GST
            for this invoice.
          </div>

        </section>

        {/* SHIPPING + PAYMENT */}

        <div className="invoice-two-column">

          <section className="invoice-section-card">

            <div className="invoice-section-heading">

              <div>
                <span className="section-number">
                  03
                </span>

                <div>
                  <h2>
                    Shipping Details
                  </h2>

                  <p>
                    Optional delivery
                    information
                  </p>
                </div>
              </div>

            </div>

            <div className="invoice-form-grid">

              <label>
                <span>
                  Shipping Name
                </span>

                <input
                  value={shippingName}
                  onChange={(event) =>
                    setShippingName(
                      event.target.value
                    )
                  }
                  placeholder="Recipient name"
                />
              </label>

              <label>
                <span>
                  Shipping State
                </span>

                <input
                  value={shippingState}
                  onChange={(event) =>
                    setShippingState(
                      event.target.value
                    )
                  }
                  placeholder="State"
                />
              </label>

              <label className="full">
                <span>
                  Shipping Address
                </span>

                <textarea
                  rows={3}
                  value={shippingAddress}
                  onChange={(event) =>
                    setShippingAddress(
                      event.target.value
                    )
                  }
                  placeholder="Complete shipping address"
                />
              </label>

              <label>
                <span>
                  State Code
                </span>

                <input
                  value={shippingStateCode}
                  onChange={(event) =>
                    setShippingStateCode(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 36"
                />
              </label>

            </div>

          </section>

          <section className="invoice-section-card">

            <div className="invoice-section-heading">

              <div>
                <span className="section-number">
                  04
                </span>

                <div>
                  <h2>
                    Payment Details
                  </h2>

                  <p>
                    Bank information for
                    your invoice
                  </p>
                </div>
              </div>

            </div>

            <div className="invoice-form-grid">

              <label>
                <span>
                  Bank Name
                </span>

                <input
                  value={bankName}
                  onChange={(event) =>
                    setBankName(
                      event.target.value
                    )
                  }
                  placeholder="Bank name"
                />
              </label>

              <label>
                <span>
                  Account Type
                </span>

                <input
                  value={accountType}
                  onChange={(event) =>
                    setAccountType(
                      event.target.value
                    )
                  }
                  placeholder="Current / Savings"
                />
              </label>

              <label>
                <span>
                  Account Number
                </span>

                <input
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(
                      event.target.value
                    )
                  }
                  placeholder="Account number"
                />
              </label>

              <label>
                <span>
                  IFSC
                </span>

                <input
                  value={ifscCode}
                  onChange={(event) =>
                    setIfscCode(
                      event.target.value
                    )
                  }
                  placeholder="IFSC code"
                />
              </label>

              <label className="full">
                <span>
                  Branch
                </span>

                <input
                  value={bankBranch}
                  onChange={(event) =>
                    setBankBranch(
                      event.target.value
                    )
                  }
                  placeholder="Branch name"
                />
              </label>

            </div>

          </section>

        </div>

        {/* TERMS */}

        <section className="invoice-section-card">

          <div className="invoice-section-heading">

            <div>
              <span className="section-number">
                05
              </span>

              <div>
                <h2>
                  Terms & Signature
                </h2>

                <p>
                  Invoice footer information
                </p>
              </div>
            </div>

          </div>

          <div className="invoice-form-grid">

            <label className="full">
              <span>
                Terms & Conditions
              </span>

              <textarea
                rows={4}
                value={termsAndConditions}
                onChange={(event) =>
                  setTermsAndConditions(
                    event.target.value
                  )
                }
                placeholder="Payment terms, return policy, notes..."
              />
            </label>

            <label>
              <span>
                Authorized Signatory
              </span>

              <input
                value={
                  authorizedSignatoryName
                }
                onChange={(event) =>
                  setAuthorizedSignatoryName(
                    event.target.value
                  )
                }
                placeholder="Name"
              />
            </label>

          </div>

        </section>

        {/* TOTALS */}

        <section className="invoice-total-card">

          <div className="invoice-total-left">
            <span>
              Invoice Summary
            </span>

            <small>
              Review the amounts before
              saving the invoice.
            </small>
          </div>

          <div className="invoice-total-values">

            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {money(
                  totals.subtotal
                )}
              </strong>
            </div>

            <div>
              <span>
                Discount
              </span>

              <strong>
                - {money(
                  totals.discount
                )}
              </strong>
            </div>

            <div>
              <span>
                Taxable Amount
              </span>

              <strong>
                {money(
                  totals.taxable
                )}
              </strong>
            </div>

            <div>
              <span>
                GST
              </span>

              <strong>
                {money(
                  totals.gst
                )}
              </strong>
            </div>

            <div className="grand-total">

              <span>
                Grand Total
              </span>

              <strong>
                {money(
                  totals.total
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* ACTIONS */}

        <div className="invoice-form-actions">

          <button
            type="button"
            className="invoice-secondary-button"
            onClick={() =>
              navigate(invoiceBasePath)
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="invoice-save-button"
            disabled={
              saving ||
              loadingData
            }
          >
            {saving
              ? 'Saving Invoice...'
              : 'Save Invoice →'}
          </button>

        </div>

      </form>

    </div>
  );
}