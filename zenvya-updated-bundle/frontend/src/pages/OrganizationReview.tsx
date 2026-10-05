import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { approveOrganization, rejectOrganization, type OrganizationAdmin } from '../services/organizationService';

const initialAdmin: OrganizationAdmin = {
  username: '', firstName: '', lastName: '', email: '', mobile: '', password: '',
};

function OrganizationReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(initialAdmin);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (name: keyof OrganizationAdmin, value: string) =>
    setAdmin((p) => ({ ...p, [name]: value }));

  const approve = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      await approveOrganization(id, admin);
      navigate(`/organizations/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data || 'Approval failed');
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    if (!id || !window.confirm('Reject this organization registration?')) return;
    setSaving(true);
    setError('');
    try {
      await rejectOrganization(id, reason);
      navigate(`/organizations/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data || 'Rejection failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Review Organization Registration</h1>
      <p>Approval creates the Organization Admin and activates the organization.</p>
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={approve} className="organization-form">
        <h2>Organization Admin</h2>
        {([
          ['username','Username'], ['firstName','First Name'], ['lastName','Last Name'],
          ['email','Email'], ['mobile','Mobile'], ['password','Initial Password'],
        ] as const).map(([name, label]) => (
          <div className="form-group" key={name}>
            <label>{label}</label>
            <input
              type={name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'}
              value={admin[name]}
              onChange={(e) => change(name, e.target.value)}
              required={['username','firstName','password'].includes(name)}
            />
          </div>
        ))}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={() => navigate(`/organizations/${id}`)}>
            Cancel
          </button>
          <button type="button" className="secondary-button" onClick={reject} disabled={saving}>
            Reject
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Processing...' : 'Approve & Activate'}
          </button>
        </div>
      </form>

      <div className="organization-form">
        <h2>Rejection Reason</h2>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional reason" />
      </div>
    </div>
  );
}
export default OrganizationReview;
