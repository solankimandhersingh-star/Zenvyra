import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getOrganization,
  setOrganizationStatus,
  type Organization,
} from '../services/organizationService';

function OrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    const loadOrganization = async () => {
      if (!id) {
        setError('Organization ID is missing');
        setLoading(false);
        return;
      }

      try {
        const data = await getOrganization(id);
        setOrganization(data);
      } catch (error) {
        console.error(error);
        setError('Failed to load organization');
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [id]);

const handleStatusChange = async (enabled: boolean) => {
    if (!id) return;
    const action = enabled ? 'enable' : 'disable';
    if (!window.confirm(`Are you sure you want to ${action} this organization?`)) return;

    setChangingStatus(true);
    setError('');
    try {
      const updated = await setOrganizationStatus(id, enabled);
      setOrganization(updated);
    } catch (error: any) {
      console.error(error);
      setError(error?.response?.data?.message || error?.response?.data || `Failed to ${action} organization`);
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading) {
    return <h1>Loading organization...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  if (!organization) {
    return <h1>Organization not found</h1>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{organization.name}</h1>
          <p>{organization.organizationCode}</p>
        </div>

        <div className="form-actions">
          <button
            className="secondary-button"
            onClick={() => navigate('/organizations')}
          >
            Back
          </button>

          <button
            className="primary-button"
            onClick={() =>
              navigate(`/organizations/${organization.id}/edit`)
            }
          >
            Edit
          </button>
          {organization.status === 'PENDING' && (
            <button
              className="primary-button"
              onClick={() => navigate(`/organizations/${organization.id}/review`)}
            >
              Review Registration
            </button>
          )}

          {organization.status === 'ACTIVE' && (
            <button
              className="secondary-button"
              onClick={() => handleStatusChange(false)}
              disabled={changingStatus}
            >
              {changingStatus ? 'Updating...' : 'Disable Organization'}
            </button>
          )}
          {organization.status === 'DISABLED' && (
            <button
              className="secondary-button"
              onClick={() => handleStatusChange(true)}
              disabled={changingStatus}
            >
              {changingStatus ? 'Updating...' : 'Enable Organization'}
            </button>
          )}
        </div>
      </div>

      <div className="details-card">

        <div className="detail-item">
          <span>Organization Code</span>
          <strong>{organization.organizationCode}</strong>
        </div>

        <div className="detail-item">
          <span>Business Type</span>
          <strong>{organization.businessType || '-'}</strong>
        </div>

        <div className="detail-item">
          <span>Email</span>
          <strong>{organization.email || '-'}</strong>
        </div>

        <div className="detail-item">
          <span>Mobile</span>
          <strong>{organization.mobile || '-'}</strong>
        </div>

        <div className="detail-item">
          <span>Address</span>
          <strong>{organization.addressLine1 || '-'}</strong>
        </div>

        <div className="detail-item">
          <span>City</span>
          <strong>{organization.city || '-'}</strong>
        </div>

        <div className="detail-item">
          <span>State</span>
          <strong>{organization.state || '-'}</strong>
        </div>

        <div className="detail-item">
          <span>Country</span>
          <strong>{organization.country || '-'}</strong>
        </div>

        <div className="detail-item">
          <span>Postal Code</span>
          <strong>{organization.postalCode || '-'}</strong>
        </div>

        <div className="detail-item">
          <span>Tax Number</span>
          <strong>{organization.taxNumber || '-'}</strong>
        </div>

        <div className="detail-item">
          <span>Status</span>
          <strong>{organization.status}</strong>
        </div>

      </div>
    </div>
  );
}

export default OrganizationDetails;