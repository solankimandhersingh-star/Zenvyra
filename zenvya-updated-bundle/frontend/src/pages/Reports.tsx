import { useState } from 'react';
import './ModulePages.css';

const reports = [
  { name: 'Sales Summary', description: 'Invoice sales, totals and status for a selected period.', format: 'PDF / Excel' },
  { name: 'Customer Outstanding', description: 'Outstanding invoice balances grouped by customer.', format: 'PDF / Excel' },
  { name: 'Payment Collection', description: 'Payment collections by date and payment method.', format: 'PDF / Excel' },
  { name: 'Invoice Register', description: 'Detailed invoice register with customer and status.', format: 'PDF / Excel' },
];

export default function Reports() {
  const [period, setPeriod] = useState('THIS_MONTH');
  const [message, setMessage] = useState('');

  return (
    <div className="module-page">
      <div className="module-header">
        <div><span className="module-eyebrow">ANALYTICS</span><h1>Reports</h1><p>Generate organization reports and financial summaries.</p></div>
        <select className="module-period" value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="TODAY">Today</option><option value="THIS_MONTH">This Month</option><option value="LAST_MONTH">Last Month</option><option value="THIS_YEAR">This Year</option>
        </select>
      </div>

      {message && <div className="module-alert">{message}</div>}

      <div className="module-report-grid">
        {reports.map(r => (
          <div className="module-card report-card" key={r.name}>
            <div className="report-icon">R</div>
            <h2>{r.name}</h2>
            <p>{r.description}</p>
            <span>{r.format}</span>
            <div className="module-actions">
              <button className="module-secondary" onClick={() => setMessage(`${r.name} PDF generation will use the Report Service when connected.`)}>Export PDF</button>
              <button className="module-primary" onClick={() => setMessage(`${r.name} Excel generation will use the Report Service when connected.`)}>Export Excel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
