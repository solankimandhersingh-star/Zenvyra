import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [organizationCode, setOrganizationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(
        username.trim(),
        password,
        organizationCode.trim() || undefined
      );

      navigate('/');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : '') ||
        'We could not sign you in. Please check your credentials and try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />

      <main className="login-shell">
        <section className="login-brand-panel">
          <div className="login-brand">
            <img
              src="/favicon.svg"
              alt="Zenvyra"
              className="zenvyra-logo"
            />
            <span className="brand-name">Zenvyra</span>
          </div>

          <div className="brand-message">
            <span className="eyebrow">BUSINESS OPERATIONS</span>
            <h1>Invoices, customers and growth — in one place.</h1>
            <p>
              A focused workspace for modern businesses to manage billing
              operations with clarity and confidence.
            </p>
          </div>

          <div className="brand-points">
            <div>
              <span className="point-icon">✓</span>
              <span>Centralized business workspace</span>
            </div>
            <div>
              <span className="point-icon">✓</span>
              <span>Secure role-based access</span>
            </div>
            <div>
              <span className="point-icon">✓</span>
              <span>Built for growing organizations</span>
            </div>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-card">
            <div className="login-heading">
              <div className="mobile-brand">
                <img src="/favicon.svg" alt="" className="mobile-logo" />
                <span>Zenvyra</span>
              </div>
              <span className="eyebrow">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>Enter your credentials to continue to your workspace.</p>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span className="error-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit}>
              <div className="login-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>

              <div className="login-field">
                <div className="field-label-row">
                  <label htmlFor="password">Password</label>
                </div>

                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="login-field login-optional-field">
                <label htmlFor="organizationCode">
                  Organization Code
                  <span className="optional">
                    Required for organization accounts
                  </span>
                </label>

                <input
                  id="organizationCode"
                  type="text"
                  value={organizationCode}
                  onChange={(e) => setOrganizationCode(e.target.value)}
                  placeholder="e.g. ORG-00D59236"
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-assurance">
              <span className="assurance-icon">✓</span>
              <span>Your session is protected with secure authentication.</span>
            </div>
          </div>

          <footer className="login-footer">
            <span>© {new Date().getFullYear()} Zenvyra</span>
            <span>Business invoicing platform</span>
          </footer>
        </section>
      </main>
    </div>
  );
}


export default Login;
