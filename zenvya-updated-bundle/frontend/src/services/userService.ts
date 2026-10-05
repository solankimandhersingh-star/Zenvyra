import api from './api';

export interface User {
  id: string;
  organizationId: string | null;
  username: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  mobile: string | null;
  role: string;
  status: string;
}

export interface CreateUserRequest {
  username: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  mobile?: string;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const createUser = async (
  request: CreateUserRequest
): Promise<User> => {
  const response = await api.post<User>('/users', request);
  return response.data;
};

export const updateUser = async (
  userId: string,
  request: UpdateUserRequest
): Promise<User> => {
  const response = await api.put<User>(
    `/users/${userId}`,
    request
  );

  return response.data;
};

export const updateUserStatus = async (
  userId: string,
  status: 'ACTIVE' | 'DISABLED'
): Promise<User> => {
  const response = await api.patch<User>(
    `/users/${userId}/status`,
    { status }
  );

  return response.data;
};

export const resetUserPassword = async (
  userId: string,
  newPassword: string
): Promise<User> => {
  const response = await api.post<User>(
    `/users/${userId}/reset-password`,
    { newPassword }
  );

  return response.data;
};