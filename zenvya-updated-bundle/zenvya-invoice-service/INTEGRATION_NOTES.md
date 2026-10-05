# Zenvyra Invoice Service – integration contract

## Implemented in this service
- Organization is the authoritative seller master. Seller data is snapshotted when the invoice is created.
- Customer is the authoritative buyer master. Buyer data is snapshotted when the invoice is created.
- Product is the authoritative product/price/unit/tax master. Product data is snapshotted when the invoice is created.
- Invoice line price comes from Product Service; clients cannot inject a different product price.
- Invoice GST can be `NONE`, `GST_INCLUDED`, or `GST_EXTRA`.
- Invoice tax rate is optional. If omitted, Product Service's default tax rate is used. If `NONE` is selected, GST is forced to zero.
- Same-state GST is split into CGST + SGST; interstate GST is IGST.
- Invoice data is organization-isolated. `SUPER_ADMIN` may supply `X-Organization-Id` for a selected workspace; normal organization users are always restricted to their JWT organization.
- Downstream calls propagate the current JWT so Customer/Product/Organization services can authenticate the request.
- Invoice numbers are organization-specific and protected with a database row lock for existing sequences.
- Amount in words uses Indian Rupee terminology.

## API Gateway
Add this route to the gateway:

```yaml
- id: invoice-service
  uri: http://localhost:8085
  predicates:
    - Path=/api/invoices/**
```

The gateway should continue forwarding:
- `Authorization`
- `X-Organization-Id`

## Frontend: always open invoice creation/view in a new page
The invoice backend returns the complete invoice snapshot from:

`GET /api/invoices/{id}`

The React application should navigate invoice creation and invoice viewing to a dedicated route in a **new browser tab/window**. The backend does not control browser tabs.

Recommended behavior:

```ts
const openInvoicePage = (invoiceId: string) => {
  window.open(`/invoices/${invoiceId}`, '_blank', 'noopener,noreferrer');
};
```

After successful `POST /api/invoices`, call `openInvoicePage(response.data.id)`.
From the invoice list, the View action should call `openInvoicePage(invoice.id)`.

The dedicated `/invoices/:id` page should fetch `GET /api/invoices/:id` and render the finalized premium/classic GST invoice design.

## Current master-data limitations
The current Customer Service contract does not expose buyer state/state code, so buyer state fields remain null in the invoice snapshot. The current Product Service contract does not expose HSN/SAC, so HSN/SAC remains null. These can be added later without changing the invoice calculation model.

## Important Organization Service contract
The invoice service expects `GET /api/organizations/{id}` to expose at least:
- `id`
- `name`
- `taxNumber`
- `addressLine1`
- `addressLine2`
- `city`
- `state`
- `stateCode` (preferred)
- `country`
- `postalCode`
- `email`
- `mobile`
- `status`

If `stateCode` is absent, the invoice service derives the Indian GST state code from the organization state name where possible.
