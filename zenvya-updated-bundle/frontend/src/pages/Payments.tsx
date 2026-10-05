import { useState } from 'react';
import './ModulePages.css';

type Payment = { id: string; receipt: string; invoice: string; customer: string; date: string; amount: number; method: string; status: 'SUCCESS' | 'PENDING' | 'FAILED'; };
const initial: Payment[] = [
  { id: '1', receipt: 'PAY-000001', invoice: 'INV-000002', customer: 'XYZ Enterprises', date: '2026-10-03', amount: 8200, method: 'UPI', status: 'SUCCESS' },
];

export default function Payments() {
  const [payments, setPayments] = useState(initial);
  const [form, setForm] = useState({ invoice: '', customer: '', amount: '', method: 'UPI' });
  const [show, setShow] = useState(false);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer.trim()) return;
    const n = payments.length + 1;
    setPayments([...payments, {
      id: crypto.randomUUID(), receipt: `PAY-${String(n).padStart(6, '0')}`,
      invoice: form.invoice.trim() || '—', customer: form.customer.trim(),
      date: new Date().toISOString().slice(0, 10), amount: Number(form.amount) || 0,
      method: form.method, status: 'SUCCESS'
    }]);
    setForm({ invoice: '', customer: '', amount: '', method: 'UPI' });
    setShow(false);
  };

  return (
    <div className="module-page">
      <div className="module-header">
        <div><span className="module-eyebrow">RECEIVABLES</span><h1>Payments</h1><p>Record and track customer payments.</p></div>
        <button className="module-primary" onClick={() => setShow(!show)}>{show ? 'Cancel' : '+ Record Payment'}</button>
      </div>

      {show && <form className="module-card module-form" onSubmit={create}>
        <h2>Record Payment</h2>
        <div className="module-grid">
          <label>Invoice<input value={form.invoice} onChange={e => setForm({...form, invoice: e.target.value})} /></label>
          <label>Customer *<input value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} required /></label>
          <label>Amount *<input type="number" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></label>
          <label>Payment Method<select value={form.method} onChange={e => setForm({...form, method: e.target.value})}><option>UPI</option><option>Bank Transfer</option><option>Cash</option><option>Card</option></select></label>
        </div>
        <div className="module-actions"><button className="module-primary">Record Payment</button></div>
      </form>}

      <div className="module-card">
        <div className="module-toolbar"><div><strong>Payment History</strong><span>{payments.length} records</span></div><input placeholder="Search payment..." /></div>
        <div className="module-table-wrap"><table className="module-table">
          <thead><tr><th>Receipt</th><th>Invoice</th><th>Customer</th><th>Date</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{payments.map(p => <tr key={p.id}><td><strong>{p.receipt}</strong></td><td>{p.invoice}</td><td>{p.customer}</td><td>{p.date}</td><td>{p.method}</td><td>₹{p.amount.toLocaleString('en-IN')}</td><td><span className={`module-status ${p.status.toLowerCase()}`}>{p.status}</span></td></tr>)}</tbody>
        </table></div>
        <div className="module-note">Payment UI is prepared for the Payment Service APIs.</div>
      </div>
    </div>
  );
}
