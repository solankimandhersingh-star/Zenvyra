import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
  updateCustomerStatus,
  type Customer,
} from '../services/customerService';
import './Customers.css';

const emptyForm = {
  name: '',
  email: '',
  mobile: '',
  taxNumber: '',
  billingAddress: '',
  shippingAddress: '',
};
export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [statusTarget, setStatusTarget] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async (value = search) => {
    try {
      setLoading(true); setError('');
      setCustomers(await getCustomers(value));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Unable to load customers.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(''); }, []);

  const change = (setter: any) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setter((v: any) => ({ ...v, [e.target.name]: e.target.value }));

  const optional = (v: string) => v.trim() || undefined;

  const create = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
if (!form.name.trim()) {
  setError('Customer name is required.');
  return;
}    try {
      setBusy(true);
      const created = await createCustomer({
        name: form.name.trim(),
        email: optional(form.email),
        mobile: optional(form.mobile),
        taxNumber: optional(form.taxNumber),
        billingAddress: optional(form.billingAddress),
        shippingAddress: optional(form.shippingAddress),
      });
      setForm(emptyForm); setShowCreate(false);
      setSuccess(
        `Customer created successfully. Customer code: ${created.customerCode}`
      ); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Unable to create customer.'); }
    finally { setBusy(false); }
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
setEditForm({
  name: c.name,
  email: c.email || '',
  mobile: c.mobile || '',
  taxNumber: c.taxNumber || '',
  billingAddress: c.billingAddress || '',
  shippingAddress: c.shippingAddress || '',
});
setError(''); setSuccess('');
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault(); if (!editing) return;
    if (!editForm.name.trim()) { setError('Customer name is required.'); return; }
    try {
      setBusy(true);
      await updateCustomer(editing.id, {
        name: editForm.name.trim(),
        email: optional(editForm.email),
        mobile: optional(editForm.mobile),
        taxNumber: optional(editForm.taxNumber),
        billingAddress: optional(editForm.billingAddress),
        shippingAddress: optional(editForm.shippingAddress),
      });
      setEditing(null); setSuccess('Customer updated successfully.'); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Unable to update customer.'); }
    finally { setBusy(false); }
  };

  const changeStatus = async () => {
    if (!statusTarget) return;
    try {
      setBusy(true);
      const next = statusTarget.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      await updateCustomerStatus(statusTarget.id, next);
      setStatusTarget(null); setSuccess(`Customer ${next === 'ACTIVE' ? 'enabled' : 'disabled'} successfully.`); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Unable to update customer status.'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try { setBusy(true); await deleteCustomer(deleteTarget.id); setDeleteTarget(null); setSuccess('Customer deleted successfully.'); await load(); }
    catch (e: any) { setError(e?.response?.data?.message || 'Unable to delete customer.'); }
    finally { setBusy(false); }
  };

  const fields = (value: any, setter: any) => (
    <div className="customers-form-grid">

      <Field
        label="Customer Name"
        name="name"
        value={value.name}
        onChange={change(setter)}
        required
      />

      <Field
        label="Email"
        name="email"
        type="email"
        value={value.email}
        onChange={change(setter)}
      />

      <Field
        label="Mobile"
        name="mobile"
        value={value.mobile}
        onChange={change(setter)}
      />

      <Field
        label="Tax Number"
        name="taxNumber"
        value={value.taxNumber}
        onChange={change(setter)}
      />

      <div className="form-field">
        <label>Billing Address</label>
        <textarea
          name="billingAddress"
          value={value.billingAddress}
          onChange={change(setter)}
          rows={4}
        />
      </div>

      <div className="form-field">
        <label>Shipping Address</label>
        <textarea
          name="shippingAddress"
          value={value.shippingAddress}
          onChange={change(setter)}
          rows={4}
        />
      </div>

    </div>
  );

  return <div className="customers-page">
    <div className="customers-page-header"><div><span className="eyebrow">CUSTOMER MANAGEMENT</span><h1>Customers</h1><p>Manage customers and billing information within your organization.</p></div><button className="primary-button" onClick={() => setShowCreate(v => !v)}>{showCreate ? 'Cancel' : '+ Add Customer'}</button></div>
    {success && <div className="customers-alert customers-alert-success">{success}</div>}
    {error && <div className="customers-alert customers-alert-error">{error}</div>}

    {showCreate && <div className="customers-card customers-form-card"><div className="customers-section-header"><div><h2>Add Customer</h2><p>Create a customer for your organization.</p></div></div><form onSubmit={create}>{fields(form, setForm)}<div className="customers-form-footer"><span>Customer code will be generated automatically.</span><div className="customers-form-actions"><button type="button" className="secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Creating...' : 'Add Customer'}</button></div></div></form></div>}

    <div className="customers-card customers-list-card"><div className="customers-section-header"><div><h2>Organization Customers</h2><p>{customers.length} {customers.length === 1 ? 'customer' : 'customers'} found.</p></div><div className="customers-toolbar"><input className="customers-search" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search customer..."/><button className="secondary-button" onClick={() => load()}>Search</button><button className="secondary-button" onClick={() => {setSearch(''); load('');}}>Refresh</button></div></div>
      {loading ? <div className="customers-loading">Loading customers...</div> : customers.length === 0 ? <div className="customers-empty"><div className="customers-empty-icon">C</div><h3>No customers found</h3><p>Add your first customer to get started.</p><button className="primary-button" onClick={() => setShowCreate(true)}>+ Add Customer</button></div> : <div className="customers-table-wrapper"><table className="customers-table"><thead><tr><th>Customer</th><th>Code</th><th>Email</th><th>Mobile</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead><tbody>{customers.map(c => <tr key={c.id}><td><div className="customer-name-cell"><div className="customer-avatar">{c.name.charAt(0).toUpperCase()}</div><div><strong>{c.name}</strong>{c.taxNumber && <small>Tax: {c.taxNumber}</small>}</div></div></td><td>{c.customerCode}</td><td>{c.email || '—'}</td><td>{c.mobile || '—'}</td><td>{c.billingAddress || '—'}</td><td><span className={`customer-status-badge customer-status-${c.status.toLowerCase()}`}>{c.status}</span></td><td><div className="customer-actions"><button className="customer-action-button" onClick={() => openEdit(c)}>Edit</button><button className={`customer-action-button ${c.status === 'ACTIVE' ? 'customer-action-danger' : 'customer-action-success'}`} onClick={() => setStatusTarget(c)}>{c.status === 'ACTIVE' ? 'Disable' : 'Enable'}</button><button className="customer-action-button customer-action-danger" onClick={() => setDeleteTarget(c)}>Delete</button></div></td></tr>)}</tbody></table></div>}
    </div>

    {editing && <Modal title="Edit Customer" subtitle={`Update information for ${editing.customerCode}.`} close={() => !busy && setEditing(null)}><form onSubmit={saveEdit}>{fields(editForm, setEditForm)}<div className="customers-readonly-info"><div><span>Customer Code</span><strong>{editing.customerCode}</strong></div><div><span>Status</span><strong>{editing.status}</strong></div></div><div className="customers-modal-footer"><button type="button" className="secondary-button" onClick={() => setEditing(null)}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Save Changes'}</button></div></form></Modal>}
    {statusTarget && <Confirm title={statusTarget.status === 'ACTIVE' ? 'Disable Customer?' : 'Enable Customer?'} text={`${statusTarget.status === 'ACTIVE' ? 'Disable' : 'Enable'} ${statusTarget.name}?`} cancel={() => setStatusTarget(null)} confirm={changeStatus} busy={busy} confirmText={statusTarget.status === 'ACTIVE' ? 'Disable Customer' : 'Enable Customer'} danger={statusTarget.status === 'ACTIVE'} />}
    {deleteTarget && <Confirm title="Delete Customer?" text={`Delete ${deleteTarget.name}? This action cannot be undone.`} cancel={() => setDeleteTarget(null)} confirm={remove} busy={busy} confirmText="Delete Customer" danger />}
  </div>;
}

function Field({label,name,value,onChange,type='text',required=false}: any) { return <div className="form-field"><label>{label}{required && <span> *</span>}</label><input name={name} type={type} value={value} onChange={onChange} required={required} /></div>; }
function Modal({title,subtitle,close,children}: any) { return <div className="customers-modal-overlay"><div className="customers-modal"><div className="customers-modal-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="customers-modal-close" onClick={close}>×</button></div><div className="customers-modal-body">{children}</div></div></div>; }
function Confirm({title,text,cancel,confirm,busy,confirmText,danger}: any) { return <div className="customers-modal-overlay"><div className="customers-confirm-modal"><div className={`customers-confirm-icon ${danger ? 'customers-delete-icon' : ''}`}>!</div><h2>{title}</h2><p>{text}</p><div className="customers-confirm-actions"><button className="secondary-button" onClick={cancel} disabled={busy}>Cancel</button><button className={danger ? 'danger-button' : 'primary-button'} onClick={confirm} disabled={busy}>{busy ? 'Processing...' : confirmText}</button></div></div></div>; }
