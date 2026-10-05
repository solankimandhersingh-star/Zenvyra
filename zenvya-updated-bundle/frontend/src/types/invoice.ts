export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type InvoiceTaxTreatment = 'NONE' | 'GST_INCLUDED' | 'GST_EXTRA';

export interface InvoiceItemRequest {
  productId: string;
  quantity: number;
  discountAmount?: number | null;
  taxTreatment: InvoiceTaxTreatment;
  taxRate?: number | null;
}

export interface CreateInvoiceRequest {
  invoiceDate: string;
  dueDate?: string | null;
  customerId: string;
  shippingName?: string | null;
  shippingAddress?: string | null;
  shippingState?: string | null;
  shippingStateCode?: string | null;
  placeOfSupply?: string | null;
  placeOfSupplyCode?: string | null;
  reverseCharge?: boolean;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  accountType?: string | null;
  bankBranch?: string | null;
  termsAndConditions?: string | null;
  authorizedSignatoryName?: string | null;
  items: InvoiceItemRequest[];
}

export interface InvoiceItemResponse {
  id: string;
  lineNumber: number;
  productId?: string | null;
  productCode?: string | null;
  productName: string;
  description?: string | null;
  hsnSac?: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountAmount: number;
  taxableValue: number;
  taxTreatment: InvoiceTaxTreatment;
  taxRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

export interface InvoiceResponse {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  status: InvoiceStatus;
  sellerName: string;
  sellerGstin?: string | null;
  sellerAddress?: string | null;
  sellerState?: string | null;
  sellerStateCode?: string | null;
  sellerEmail?: string | null;
  sellerMobile?: string | null;
  buyerName: string;
  buyerGstin?: string | null;
  buyerAddress?: string | null;
  buyerState?: string | null;
  buyerStateCode?: string | null;
  buyerEmail?: string | null;
  buyerMobile?: string | null;
  shippingName?: string | null;
  shippingAddress?: string | null;
  shippingState?: string | null;
  shippingStateCode?: string | null;
  placeOfSupply?: string | null;
  placeOfSupplyCode?: string | null;
  reverseCharge: boolean;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  roundOff: number;
  grandTotal: number;
  amountInWords?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  accountType?: string | null;
  bankBranch?: string | null;
  termsAndConditions?: string | null;
  authorizedSignatoryName?: string | null;
  items: InvoiceItemResponse[];
  createdAt: string;
  updatedAt: string;
}
