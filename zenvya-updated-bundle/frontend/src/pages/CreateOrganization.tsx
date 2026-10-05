import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrganization, type OrganizationCreateRequest } from '../services/organizationService';

const initial: OrganizationCreateRequest = {
  name: '', businessType: '', email: '', mobile: '',
  addressLine1: '', addressLine2: '', city: '', state: '',
  country: '', postalCode: '', taxNumber: '', logoUrl: '',
  admin: { username: '', firstName: '', lastName: '', email: '', mobile: '', password: '' },
};

function CreateOrganization() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (name: string, value: string) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const adminChange = (name: string, value: string) =>
    setFormData((p) => ({ ...p, admin: { ...p.admin, [name]: value } }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createOrganization(formData);
      navigate('/organizations');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data || 'Failed to create organization');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Create Organization</h1><p>Creates an ACTIVE organization and its Organization Admin.</p></div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={submit} className="organization-form">
        {[
          ['name','Organization Name'], ['businessType','Business Type'], ['email','Organization Email'],
          ['mobile','Organization Mobile'], ['addressLine1','Address'], ['city','City'],
          ['state','State'], ['country','Country'], ['postalCode','Postal Code'], ['taxNumber','Tax Number']
        ].map(([name,label]) => (
          <div className="form-group" key={name}>
            <label>{label}</label>
            <input
              name={name}
              type={name === 'email' ? 'email' : 'text'}
              value={(formData as any)[name]}
              onChange={(e) => change(name, e.target.value)}
              required={name === 'name'}
            />
          </div>
        ))}

        <h2>Organization Admin</h2>
        {[
          ['username','Admin Username'], ['firstName','First Name'], ['lastName','Last Name'],
          ['email','Admin Email'], ['mobile','Admin Mobile'], ['password','Initial Password']
        ].map(([name,label]) => (
          <div className="form-group" key={name}>
            <label>{label}</label>
            <input
              type={name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'}
              value={(formData.admin as any)[name]}
              onChange={(e) => adminChange(name, e.target.value)}
              required={['username','firstName','password'].includes(name)}
            />
          </div>
        ))}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={() => navigate('/organizations')}>Cancel</button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default CreateOrganization;
