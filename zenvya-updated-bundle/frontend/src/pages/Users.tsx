import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
  resetUserPassword,
  type User,
} from '../services/userService';
import './Users.css';

const emptyForm = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  password: '',
};

const emptyEditForm = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [updating, setUpdating] = useState(false);

  const [statusUser, setStatusUser] = useState<User | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [resetUser, setResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to load users. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateUser = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!form.username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!form.firstName.trim()) {
      setError('First name is required.');
      return;
    }

    if (!form.password) {
      setError('Password is required.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    try {
      setCreating(true);

      await createUser({
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim() || undefined,
        mobile: form.mobile.trim() || undefined,
        password: form.password,
      });

      setSuccess('User created successfully.');

      setForm(emptyForm);
      setShowCreateForm(false);

      await loadUsers();
    } catch (err: any) {
      console.error('Failed to create user:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to create user. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const getFullName = (user: User) => {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };

  const openEditModal = (user: User) => {
    setError('');
    setSuccess('');

    setEditingUser(user);

    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      mobile: user.mobile || '',
    });
  };

  const closeEditModal = () => {
    if (updating) return;

    setEditingUser(null);
    setEditForm(emptyEditForm);
  };

  const handleEditChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingUser) return;

    setError('');
    setSuccess('');

    if (!editForm.firstName.trim()) {
      setError('First name is required.');
      return;
    }

    try {
      setUpdating(true);

      await updateUser(editingUser.id, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim() || undefined,
        email: editForm.email.trim() || undefined,
        mobile: editForm.mobile.trim() || undefined,
      });

      setSuccess('User updated successfully.');

      setEditingUser(null);
      setEditForm(emptyEditForm);

      await loadUsers();
    } catch (err: any) {
      console.error('Failed to update user:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to update user. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (user: User) => {
    setError('');
    setSuccess('');
    setStatusUser(user);
  };

  const closeStatusModal = () => {
    if (statusUpdating) return;

    setStatusUser(null);
  };

  const handleStatusChange = async () => {
    if (!statusUser) return;

    const newStatus =
      statusUser.status === 'ACTIVE'
        ? 'DISABLED'
        : 'ACTIVE';

    try {
      setStatusUpdating(true);
      setError('');
      setSuccess('');

      await updateUserStatus(statusUser.id, newStatus);

      setSuccess(
        newStatus === 'ACTIVE'
          ? 'User enabled successfully.'
          : 'User disabled successfully.'
      );

      setStatusUser(null);

      await loadUsers();
    } catch (err: any) {
      console.error('Failed to update user status:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to update user status. Please try again.'
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const openResetPasswordModal = (user: User) => {
    setError('');
    setSuccess('');

    setResetUser(user);
    setNewPassword('');
    setConfirmPassword('');
  };

  const closeResetPasswordModal = () => {
    if (resettingPassword) return;

    setResetUser(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetPassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!resetUser) return;

    setError('');
    setSuccess('');

    if (!newPassword) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setResettingPassword(true);

      await resetUserPassword(
        resetUser.id,
        newPassword
      );

      setSuccess(
        'Password reset successfully. The user must sign in again.'
      );

      setResetUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to reset password:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to reset password. Please try again.'
      );
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="users-page">

      {/* PAGE HEADER */}
      <div className="users-page-header">
        <div>
          <span className="eyebrow">ORGANIZATION ADMIN</span>

          <h1>Users</h1>

          <p>
            Manage users and access within your organization.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setShowCreateForm((current) => !current);
            setError('');
            setSuccess('');
          }}
        >
          {showCreateForm ? 'Cancel' : '+ Create User'}
        </button>
      </div>

      {/* ALERTS */}
      {success && (
        <div className="users-alert users-alert-success">
          {success}
        </div>
      )}

      {error && (
        <div className="users-alert users-alert-error">
          {error}
        </div>
      )}

      {/* CREATE USER */}
      {showCreateForm && (
        <div className="users-form-card">

          <div className="users-section-header">
            <div>
              <h2>Create User</h2>

              <p>
                Create a user for your organization.
                The new user will automatically be assigned
                the ORG_USER role.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateUser}>

            <div className="users-form-grid">

              <div className="form-field">
                <label htmlFor="firstName">
                  First Name <span>*</span>
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="lastName">
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-field">
                <label htmlFor="username">
                  Username <span>*</span>
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={255}
                  placeholder="name@example.com"
                />
              </div>

              <div className="form-field">
                <label htmlFor="mobile">
                  Mobile
                </label>

                <input
                  id="mobile"
                  name="mobile"
                  type="text"
                  value={form.mobile}
                  onChange={handleChange}
                  maxLength={30}
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">
                  Password <span>*</span>
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  maxLength={100}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

            </div>

            <div className="users-form-footer">

              <div className="users-role-note">
                <strong>Role:</strong> ORG_USER

                <span>
                  Users are automatically assigned to your
                  organization.
                </span>
              </div>

              <div className="users-form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setForm(emptyForm);
                    setError('');
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={creating}
                >
                  {creating
                    ? 'Creating...'
                    : 'Create User'}
                </button>

              </div>

            </div>

          </form>
        </div>
      )}

      {/* USER LIST */}
      <div className="users-list-card">

        <div className="users-section-header">

          <div>
            <h2>Organization Users</h2>

            <p>
              {users.length} user
              {users.length === 1 ? '' : 's'} in
              your organization.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadUsers}
            disabled={loading}
          >
            Refresh
          </button>

        </div>

        {loading ? (
          <div className="users-loading">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="users-empty">

            <div className="users-empty-icon">
              U
            </div>

            <h3>No users found</h3>

            <p>
              Create your first organization user
              to get started.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => setShowCreateForm(true)}
            >
              + Create User
            </button>

          </div>
        ) : (
          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (

                  <tr key={user.id}>

                    <td>
                      <div className="user-name-cell">

                        <div className="user-avatar">
                          {(
                            user.firstName ||
                            user.username
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getFullName(user) ||
                              user.username}
                          </strong>

                          {user.email && (
                            <small>
                              {user.email}
                            </small>
                          )}
                        </div>

                      </div>
                    </td>

                    <td>{user.username}</td>

                    <td>
                      {user.email || '—'}
                    </td>

                    <td>
                      {user.mobile || '—'}
                    </td>

                    <td>
                      <span className="user-role-badge">
                        {user.role.replaceAll('_', ' ')}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`user-status-badge user-status-${user.status.toLowerCase()}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <div className="user-actions">

                        <button
                          type="button"
                          className="user-action-button"
                          onClick={() =>
                            openEditModal(user)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className={`user-action-button ${
                            user.status === 'ACTIVE'
                              ? 'user-action-danger'
                              : 'user-action-success'
                          }`}
                          onClick={() =>
                            openStatusModal(user)
                          }
                        >
                          {user.status === 'ACTIVE'
                            ? 'Disable'
                            : 'Enable'}
                        </button>

                        <button
                          type="button"
                          className="user-action-button"
                          onClick={() =>
                            openResetPasswordModal(user)
                          }
                        >
                          Reset Password
                        </button>

                      </div>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="users-modal-overlay">

          <div className="users-modal">

            <div className="users-modal-header">

              <div>
                <h2>Edit User</h2>

                <p>
                  Update basic information for{' '}
                  <strong>
                    {editingUser.username}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeEditModal}
                disabled={updating}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleUpdateUser}>

              <div className="users-modal-body">

                <div className="users-form-grid">

                  <div className="form-field">
                    <label>
                      First Name <span>*</span>
                    </label>

                    <input
                      name="firstName"
                      value={editForm.firstName}
                      onChange={handleEditChange}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Last Name
                    </label>

                    <input
                      name="lastName"
                      value={editForm.lastName}
                      onChange={handleEditChange}
                      maxLength={100}
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Email
                    </label>

                    <input
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      maxLength={255}
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Mobile
                    </label>

                    <input
                      name="mobile"
                      value={editForm.mobile}
                      onChange={handleEditChange}
                      maxLength={30}
                    />
                  </div>

                </div>

                <div className="users-readonly-info">

                  <div>
                    <span>Username</span>
                    <strong>
                      {editingUser.username}
                    </strong>
                  </div>

                  <div>
                    <span>Role</span>
                    <strong>
                      {editingUser.role.replaceAll(
                        '_',
                        ' '
                      )}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="users-modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeEditModal}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={updating}
                >
                  {updating
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* STATUS MODAL */}
      {statusUser && (
        <div className="users-modal-overlay">

          <div className="users-confirm-modal">

            <div className="users-confirm-icon">
              {statusUser.status === 'ACTIVE'
                ? '!'
                : '✓'}
            </div>

            <h2>
              {statusUser.status === 'ACTIVE'
                ? 'Disable User?'
                : 'Enable User?'}
            </h2>

            <p>
              {statusUser.status === 'ACTIVE'
                ? `Disable ${getFullName(statusUser) || statusUser.username}? They will no longer be able to sign in.`
                : `Enable ${getFullName(statusUser) || statusUser.username}? They will be able to sign in again.`}
            </p>

            <div className="users-confirm-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={closeStatusModal}
                disabled={statusUpdating}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  statusUser.status === 'ACTIVE'
                    ? 'danger-button'
                    : 'primary-button'
                }
                onClick={handleStatusChange}
                disabled={statusUpdating}
              >
                {statusUpdating
                  ? 'Updating...'
                  : statusUser.status === 'ACTIVE'
                    ? 'Disable User'
                    : 'Enable User'}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetUser && (
        <div className="users-modal-overlay">

          <div className="users-modal">

            <div className="users-modal-header">

              <div>
                <h2>Reset Password</h2>

                <p>
                  Set a new password for{' '}
                  <strong>
                    {resetUser.username}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeResetPasswordModal}
                disabled={resettingPassword}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleResetPassword}>

              <div className="users-modal-body">

                <div className="users-form-grid">

                  <div className="form-field">
                    <label>
                      New Password <span>*</span>
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      minLength={8}
                      maxLength={100}
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>
                      Confirm Password <span>*</span>
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      minLength={8}
                      maxLength={100}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>

                </div>

                <div className="users-password-note">
                  <strong>Security notice</strong>
                  <span>
                    Resetting the password will sign the
                    user out of their active sessions.
                  </span>
                </div>

              </div>

              <div className="users-modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeResetPasswordModal}
                  disabled={resettingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={resettingPassword}
                >
                  {resettingPassword
                    ? 'Resetting...'
                    : 'Reset Password'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}