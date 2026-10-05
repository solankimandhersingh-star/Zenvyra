import api from './api';

export interface LoginUser {
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

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: LoginUser;
}

export const login = async (
  username: string,
  password: string,
  organizationCode?: string
): Promise<LoginUser> => {
  const response = await api.post<LoginResponse>('/users/login', {
    username,
    password,
    organizationCode: organizationCode?.trim() || null,
  });

  const { accessToken, refreshToken, user } = response.data;
  const userJson = JSON.stringify(user);

  // Keep the session in the current tab and a shared copy so invoice
  // create/view pages opened in a new tab remain authenticated.
  sessionStorage.setItem('zenvya_access_token', accessToken);
  sessionStorage.setItem('zenvya_refresh_token', refreshToken);
  sessionStorage.setItem('zenvya_user', userJson);

  localStorage.setItem('zenvya_access_token', accessToken);
  localStorage.setItem('zenvya_refresh_token', refreshToken);
  localStorage.setItem('zenvya_user', userJson);

  return user;
};

export const getStoredUser = (): LoginUser | null => {
  const storedUser =
    sessionStorage.getItem('zenvya_user') ||
    localStorage.getItem('zenvya_user');

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as LoginUser;
  } catch {
    sessionStorage.removeItem('zenvya_user');
    localStorage.removeItem('zenvya_user');
    return null;
  }
};

export const logout = (): void => {
  sessionStorage.removeItem('zenvya_access_token');
  sessionStorage.removeItem('zenvya_refresh_token');
  sessionStorage.removeItem('zenvya_user');
  localStorage.removeItem('zenvya_access_token');
  localStorage.removeItem('zenvya_refresh_token');
  localStorage.removeItem('zenvya_user');
};
