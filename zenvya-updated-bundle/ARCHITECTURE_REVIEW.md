# Zenvyra Architecture Review and Update

Reviewed:
- API Gateway
- Organization Service
- User Service
- React/Vite Frontend

## Architecture checks

### API Gateway
- Routes `/api/users/**` -> User Service :8081
- Routes `/api/organizations/**` -> Organization Service :8082
- Gateway CORS is configured for `http://localhost:5173`.
- No source change was required.

### Organization Service
- Super Admin organization creation creates the organization as ACTIVE and orchestrates ORG_ADMIN creation.
- Self-registration creates PENDING organizations.
- Approval creates ORG_ADMIN and then activates the organization.
- Reject changes PENDING -> REJECTED.
- Enable/disable is restricted to Super Admin.
- Organization reads/updates enforce organization isolation for ORG_ADMIN.
- Internal organization-code lookup is protected with the internal service key.
- No source change was required.

### User Service
- SUPER_ADMIN login does not require an organization code.
- ORG_ADMIN/ORG_USER login resolves the organization code through Organization Service and then verifies the user belongs to that organization.
- Access tokens carry user id, organization id when applicable, username and role.
- ORG_ADMIN can create/list users only in the current organization.
- Internal ORG_ADMIN creation is protected by the internal service key.
- No source change was required.

## Frontend changes

1. Added role-protected routes:
   - SUPER_ADMIN: Organizations, organization creation/review/workspace.
   - ORG_ADMIN: Users, Customers, Products, Invoices, Payments, Reports, Organization settings.
   - ORG_USER: Customers, Products, Invoices, Payments.
2. Added the Organization module to the ORG_ADMIN sidebar/dashboard.
3. Improved Axios authentication handling:
   - Sends the access token on API calls.
   - On a protected 401, attempts one refresh using the refresh token.
   - Stores the rotated refresh token.
   - Retries the original request once.
   - Redirects to login only when authentication cannot be refreshed.
   - Avoids refresh loops for login/refresh endpoints.

## Important
Backend Maven compilation could not be executed in this environment because the Maven wrapper attempted to download Maven and external network access was unavailable.

Frontend TypeScript compilation (`tsc -b`) completed before Vite failed because the uploaded `node_modules` is missing Vite/Rolldown's native optional binding. Run `npm install` locally and then `npm run build`.

The existing Gateway, Organization Service and User Service source was intentionally left unchanged because the inspected implementation already matches the agreed architecture.
