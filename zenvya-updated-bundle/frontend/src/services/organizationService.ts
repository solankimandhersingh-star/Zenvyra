import api from './api';

export interface OrganizationAdmin {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
}

export interface Organization {
  id: string;
  organizationCode: string;
  name: string;
  businessType: string | null;
  email: string | null;
  mobile: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  taxNumber: string | null;
  logoUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationCreateRequest {
  name: string;
  businessType: string;
  email: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxNumber: string;
  logoUrl: string;
  admin: OrganizationAdmin;
}

export const getOrganizations = async (): Promise<Organization[]> =>
  (await api.get<Organization[]>('/organizations')).data;

export const getOrganization = async (id: string): Promise<Organization> =>
  (await api.get<Organization>(`/organizations/${id}`)).data;

export const createOrganization = async (data: OrganizationCreateRequest) =>
  (await api.post<Organization>('/organizations', data)).data;

export const updateOrganization = async (id: string, data: Partial<Organization>) =>
  (await api.put<Organization>(`/organizations/${id}`, data)).data;

export const setOrganizationStatus = async (id: string, enabled: boolean) =>
  (await api.patch<Organization>(`/organizations/${id}/status`, null, {
    params: { enabled },
  })).data;

export const approveOrganization = async (
  id: string,
  admin: OrganizationAdmin
) => (await api.post<Organization>(`/organizations/${id}/approve`, { admin })).data;

export const rejectOrganization = async (id: string, reason = '') =>
  (await api.post<Organization>(`/organizations/${id}/reject`, { reason })).data;

export const registerOrganization = async (data: OrganizationCreateRequest) =>
  (await api.post<Organization>('/organizations/registrations', data)).data;
