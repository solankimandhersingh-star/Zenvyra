import api from './api';

export interface Customer {
  id: string;
  organizationId: string;
  customerCode: string;
  name: string;
  email: string | null;
  mobile: string | null;
  taxNumber: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  mobile?: string;
  taxNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
}

export interface UpdateCustomerRequest {
  name: string;
  email?: string;
  mobile?: string;
  taxNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
}

export const getCustomers = async (search?: string): Promise<Customer[]> => {
  const response = await api.get<Customer[]>('/customers', {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return response.data;
};

export const getCustomer = async (customerId: string): Promise<Customer> => {
  const response = await api.get<Customer>(`/customers/${customerId}`);
  return response.data;
};

export const createCustomer = async (
  request: CreateCustomerRequest
): Promise<Customer> => {
  const response = await api.post<Customer>('/customers', request);
  return response.data;
};

export const updateCustomer = async (
  customerId: string,
  request: UpdateCustomerRequest
): Promise<Customer> => {
  const response = await api.put<Customer>(`/customers/${customerId}`, request);
  return response.data;
};

export const updateCustomerStatus = async (
  customerId: string,
  status: 'ACTIVE' | 'DISABLED'
): Promise<Customer> => {
  const response = await api.patch<Customer>(
    `/customers/${customerId}/status`,
    { status }
  );
  return response.data;
};

export const deleteCustomer = async (customerId: string): Promise<void> => {
  await api.delete(`/customers/${customerId}`);
};
