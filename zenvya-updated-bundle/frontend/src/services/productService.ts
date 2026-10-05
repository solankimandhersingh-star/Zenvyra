import api from './api';

export type ProductStatus = 'ACTIVE' | 'DISABLED';

export type Product = {
  id: string;
  organizationId: string;
  productCode: string;
  name: string;
  description?: string | null;
  category?: string | null;
  unit: string;
  sellingPrice: number;
  taxRate: number;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductCreateRequest = {
  name: string;
  description?: string;
  category?: string;
  unit: string;
  sellingPrice: number;
  taxRate: number;
};

export type ProductUpdateRequest = {
  name: string;
  description?: string;
  category?: string;
  unit: string;
  sellingPrice: number;
  taxRate: number;
};

export type ProductStatusUpdateRequest = {
  status: ProductStatus;
};

export const getProducts = async (
  search?: string
): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products', {
    params: search?.trim()
      ? { search: search.trim() }
      : undefined,
  });

  return response.data;
};

export const getProduct = async (
  id: string
): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);

  return response.data;
};

export const createProduct = async (
  request: ProductCreateRequest
): Promise<Product> => {
  const response = await api.post<Product>(
    '/products',
    request
  );

  return response.data;
};

export const updateProduct = async (
  id: string,
  request: ProductUpdateRequest
): Promise<Product> => {
  const response = await api.put<Product>(
    `/products/${id}`,
    request
  );

  return response.data;
};

export const updateProductStatus = async (
  id: string,
  status: ProductStatus
): Promise<Product> => {
  const response = await api.patch<Product>(
    `/products/${id}/status`,
    { status }
  );

  return response.data;
};

export const deleteProduct = async (
  id: string
): Promise<void> => {
  await api.delete(`/products/${id}`);
};