import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  updateProductStatus,
  type Product,
} from '../services/productService';

import './Products.css';

type ProductForm = {
  name: string;
  description: string;
  category: string;
  unit: string;
  sellingPrice: string;
  taxRate: string;
};

const emptyForm: ProductForm = {
  name: '',
  description: '',
  category: '',
  unit: 'PCS',
  sellingPrice: '',
  taxRate: '0',
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(
    sessionStorage.getItem('zenvya_user') || '{}'
  );

  const role = user?.role;

  const canManage = role === 'ORG_ADMIN';

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getProducts(search);

      setProducts(data);
    } catch (err: any) {
      console.error(
        'Failed to load products:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Unable to load products.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      unit: product.unit || 'PCS',
      sellingPrice: String(product.sellingPrice),
      taxRate: String(product.taxRate),
    });

    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleFormChange = (
    event: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return 'Product name is required.';
    }

    if (!form.unit.trim()) {
      return 'Unit is required.';
    }

    const sellingPrice = Number(
      form.sellingPrice
    );

    if (
      form.sellingPrice === '' ||
      Number.isNaN(sellingPrice) ||
      sellingPrice < 0
    ) {
      return 'Selling price must be 0 or greater.';
    }

    const taxRate = Number(form.taxRate);

    if (
      Number.isNaN(taxRate) ||
      taxRate < 0 ||
      taxRate > 100
    ) {
      return 'Tax rate must be between 0 and 100.';
    }

    return null;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const request = {
      name: form.name.trim(),
      description:
        form.description.trim() || undefined,
      category:
        form.category.trim() || undefined,
      unit: form.unit.trim(),
      sellingPrice: Number(form.sellingPrice),
      taxRate: Number(form.taxRate),
    };

    try {
      setSaving(true);

      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          request
        );

        setSuccess(
          'Product updated successfully.'
        );
      } else {
        await createProduct(request);

        setSuccess(
          'Product created successfully.'
        );
      }

      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);

      await loadProducts();
    } catch (err: any) {
      console.error(
        'Failed to save product:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Unable to save product.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (
    product: Product
  ) => {
    if (!canManage) {
      return;
    }

    const newStatus =
      product.status === 'ACTIVE'
        ? 'DISABLED'
        : 'ACTIVE';

    try {
      setError('');
      setSuccess('');

      await updateProductStatus(
        product.id,
        newStatus
      );

      setSuccess(
        `Product ${
          newStatus === 'ACTIVE'
            ? 'enabled'
            : 'disabled'
        } successfully.`
      );

      await loadProducts();
    } catch (err: any) {
      console.error(
        'Failed to update product status:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Unable to update product status.'
      );
    }
  };

  const handleDelete = async (
    product: Product
  ) => {
    if (!canManage) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await deleteProduct(product.id);

      setSuccess(
        'Product deleted successfully.'
      );

      await loadProducts();
    } catch (err: any) {
      console.error(
        'Failed to delete product:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Unable to delete product.'
      );
    }
  };

  return (
    <div className="products-page">

      {/* PAGE HEADER */}

      <div className="products-header">

        <div>
          <span className="products-eyebrow">
            PRODUCT MANAGEMENT
          </span>

          <h1>Products</h1>

          <p>
            Manage the products and services
            used for billing.
          </p>
        </div>

        {canManage && (
          <button
            className="products-primary-button"
            onClick={
              showForm
                ? closeForm
                : openCreateForm
            }
          >
            {showForm
              ? 'Cancel'
              : '+ Add Product'}
          </button>
        )}

      </div>

      {/* SUCCESS */}

      {success && (
        <div className="products-success">
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="products-error">
          {error}
        </div>
      )}

      {/* ADD / EDIT FORM */}

      {showForm && canManage && (
        <div className="products-form-card">

          <div className="products-form-header">
            <h2>
              {editingProduct
                ? 'Edit Product'
                : 'Add Product'}
            </h2>
          </div>

          <form
            className="products-form"
            onSubmit={handleSubmit}
          >

            <div className="products-form-grid">

              <div className="products-field">
                <label>
                  Product Name *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="products-field">
                <label>
                  Category
                </label>

                <input
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  placeholder="e.g. Electronics"
                />
              </div>

              <div className="products-field">
                <label>
                  Unit *
                </label>

                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleFormChange}
                >
                  <option value="PCS">
                    PCS
                  </option>

                  <option value="KG">
                    KG
                  </option>

                  <option value="LTR">
                    LTR
                  </option>

                  <option value="BOX">
                    BOX
                  </option>

                  <option value="MTR">
                    MTR
                  </option>

                  <option value="HOUR">
                    HOUR
                  </option>

                  <option value="DAY">
                    DAY
                  </option>

                  <option value="MONTH">
                    MONTH
                  </option>

                  <option value="SERVICE">
                    SERVICE
                  </option>
                </select>
              </div>

              <div className="products-field">
                <label>
                  Selling Price *
                </label>

                <input
                  name="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="products-field">
                <label>
                  Tax Rate (%)
                </label>

                <input
                  name="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.taxRate}
                  onChange={handleFormChange}
                  placeholder="0"
                />
              </div>

              <div className="products-field">
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

            </div>

            <div className="products-form-actions">

              <button
                type="button"
                className="products-secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="products-primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingProduct
                    ? 'Update Product'
                    : 'Save Product'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* PRODUCTS CARD */}

      <div className="products-card">

        {/* THIS IS THE PART YOU WERE ASKING ABOUT */}

        <div className="products-card-header">

          <div className="products-card-title">

            <h2>
              Organization Products
            </h2>

            <p>
              {products.length}{' '}
              {products.length === 1
                ? 'product'
                : 'products'}{' '}
              found.
            </p>

          </div>

          <div className="products-search-area">

            <input
              className="products-search-input"
              placeholder="Search product..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button
              className="products-search-button"
              onClick={loadProducts}
              type="button"
            >
              Search
            </button>

            <button
              className="products-refresh-button"
              onClick={loadProducts}
              type="button"
            >
              Refresh
            </button>

          </div>

        </div>

        {/* TABLE */}

        {loading ? (

          <div className="products-empty">
            <h3>
              Loading products...
            </h3>
          </div>

        ) : products.length === 0 ? (

          <div className="products-empty">

            <h3>
              No products found
            </h3>

            <p>
              {search
                ? 'Try a different search.'
                : 'Add your first product to get started.'}
            </p>

          </div>

        ) : (

          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>

                <tr>
                  <th>CODE</th>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th>UNIT</th>
                  <th>PRICE</th>
                  <th>TAX</th>
                  <th>STATUS</th>

                  {canManage && (
                    <th>ACTIONS</th>
                  )}
                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

                  <tr key={product.id}>

                    <td>
                      <span className="product-code">
                        {product.productCode}
                      </span>
                    </td>

                    <td>

                      <div className="product-name">
                        {product.name}
                      </div>

                      {product.description && (
                        <div className="product-description">
                          {product.description}
                        </div>
                      )}

                    </td>

                    <td>
                      {product.category || '—'}
                    </td>

                    <td>
                      {product.unit}
                    </td>

                    <td>

                      <span className="product-price">
                        ₹
                        {Number(
                          product.sellingPrice
                        ).toLocaleString(
                          'en-IN',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>

                    </td>

                    <td>
                      <span className="product-tax">
                        {Number(
                          product.taxRate
                        ).toFixed(2)}
                        %
                      </span>
                    </td>

                    <td>

                      <span
                        className={`product-status ${product.status.toLowerCase()}`}
                      >
                        {product.status}
                      </span>

                    </td>

                    {canManage && (

                      <td>

                        <div className="product-actions">

                          <button
                            className="product-action"
                            onClick={() =>
                              openEditForm(product)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="product-action"
                            onClick={() =>
                              handleToggleStatus(
                                product
                              )
                            }
                          >
                            {product.status ===
                            'ACTIVE'
                              ? 'Disable'
                              : 'Enable'}
                          </button>

                          <button
                            className="product-action danger"
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}