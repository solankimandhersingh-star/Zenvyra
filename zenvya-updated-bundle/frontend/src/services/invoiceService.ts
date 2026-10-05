import api from './api';

import type {
  CreateInvoiceRequest,
  InvoiceResponse,
} from '../types/invoice';

const PRINT_CACHE_PREFIX =
  'zenvya_invoice_print_';

export const getInvoices = async (): Promise<
  InvoiceResponse[]
> => {
  const response =
    await api.get<InvoiceResponse[]>(
      '/invoices'
    );

  return response.data;
};

export const getInvoiceById = async (
  invoiceId: string
): Promise<InvoiceResponse> => {
  const response =
    await api.get<InvoiceResponse>(
      `/invoices/${invoiceId}`
    );

  return response.data;
};

export const createInvoice = async (
  request: CreateInvoiceRequest
): Promise<InvoiceResponse> => {
  const response =
    await api.post<InvoiceResponse>(
      '/invoices',
      request
    );

  return response.data;
};

/**
 * Store invoice data only.
 *
 * We do NOT store the JWT.
 * This is only used to transfer the already
 * authenticated invoice result to a new
 * print/PDF tab.
 */
export const cacheInvoiceForPrint = (
  invoice: InvoiceResponse
): void => {
  localStorage.setItem(
    `${PRINT_CACHE_PREFIX}${invoice.id}`,
    JSON.stringify({
      invoice,
      expiresAt:
        Date.now() + 5 * 60 * 1000,
    })
  );
};

export const getCachedInvoiceForPrint = (
  invoiceId: string
): InvoiceResponse | null => {
  const raw = localStorage.getItem(
    `${PRINT_CACHE_PREFIX}${invoiceId}`
  );

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {
      invoice: InvoiceResponse;
      expiresAt: number;
    };

    if (
      !parsed.expiresAt ||
      parsed.expiresAt < Date.now()
    ) {
      localStorage.removeItem(
        `${PRINT_CACHE_PREFIX}${invoiceId}`
      );

      return null;
    }

    return parsed.invoice;
  } catch {
    localStorage.removeItem(
      `${PRINT_CACHE_PREFIX}${invoiceId}`
    );

    return null;
  }
};