# Zenvyra Frontend - Clean Role-Based Routing

This bundle is a cleaned frontend based on the supplied Zenvyra frontend.

## Route model

### SUPER_ADMIN
- `/` -> Dashboard
- `/organizations` -> Organizations list
- `/organizations/create` -> Create organization
- `/organizations/:id` -> Organization details
- `/organizations/:id/review` -> Review registration
- `/organizations/:id/edit` -> Edit organization
- `/workspace/:id/dashboard` -> Selected organization workspace
- `/workspace/:id/customers`
- `/workspace/:id/products`
- `/workspace/:id/invoices`
- `/workspace/:id/payments`
- `/workspace/:id/reports`
- `/workspace/:id/organization`

The Super Admin workspace keeps the selected organization ID in the URL and does NOT modify the Super Admin JWT or impersonate an organization user.

### ORG_ADMIN
- `/` -> Dashboard
- `/customers`
- `/products`
- `/invoices`
- `/payments`
- `/users`
- `/reports`
- `/organizations/:organizationId/edit`

### ORG_USER
- `/` -> Dashboard
- `/customers`
- `/products`
- `/invoices`
- `/payments`

## Important backend boundary

Customer backend APIs currently derive organization context from the authenticated user's JWT. Therefore the Super Admin workspace module pages do not call those organization-user APIs with the Super Admin token. They display the selected organization context safely until a backend Super Admin organization-context API is implemented.

Products, Invoices, Payments and Reports currently contain frontend module UI/demo state. Their backend services were not supplied as completed APIs in the source bundle.

## Install and run

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

The bundle intentionally excludes `node_modules` and `dist`. Always run `npm install` after extracting.
