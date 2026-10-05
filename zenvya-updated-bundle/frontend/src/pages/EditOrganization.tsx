import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getOrganization,
  updateOrganization,
} from '../services/organizationService';

function EditOrganization() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    email: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    taxNumber: '',
    logoUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrganization = async () => {
      if (!id) {
        setError('Organization ID is missing');
        setLoading(false);
        return;
      }

      try {
        const organization = await getOrganization(id);

        setFormData({
          name: organization.name ?? '',
          businessType: organization.businessType ?? '',
          email: organization.email ?? '',
          mobile: organization.mobile ?? '',
          addressLine1: organization.addressLine1 ?? '',
          addressLine2: organization.addressLine2 ?? '',
          city: organization.city ?? '',
          state: organization.state ?? '',
          country: organization.country ?? '',
          postalCode: organization.postalCode ?? '',
          taxNumber: organization.taxNumber ?? '',
          logoUrl: organization.logoUrl ?? '',
        });
      } catch (error) {
        console.error(error);
        setError('Failed to load organization');
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [id]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateOrganization(id, formData);

      navigate(`/organizations/${id}`);
    } catch (error) {
      console.error(error);
      setError('Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <h1>Loading organization...</h1>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Edit Organization</h1>
          <p>Update organization information.</p>
        </div>
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="organization-form"
      >
        <div className="form-group">
          <label>Organization Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Business Type</label>
          <input
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Mobile</label>
          <input
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>State</label>
          <input
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Postal Code</label>
          <input
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Tax Number</label>
          <input
            name="taxNumber"
            value={formData.taxNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(`/organizations/${id}`)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditOrganization;