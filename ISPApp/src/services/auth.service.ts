import axiosInstance from '../../config/axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const ROLE_KEY = 'user_role';
const COMPANY_KEY = 'company_id';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'company_owner' | 'manager' | 'employee' | 'customer' | 'technician';
  first_name: string;
  last_name: string;
  companyId?: string;
}

export interface LoginResponse {
  access_token?: string;
  token?: string;
  user?: User;
  role?: string;
  company_id?: string | number;
}

export const AuthService = {
  login: async (username: string, password: string): Promise<{ user: User | null, token: string, role: string, companyId: string }> => {
    try {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', {
        username,
        password,
      });

      const data = response.data;
      const token = data.access_token || data.token || '';
      const user = data.user || null;
      const role = data.role || (user ? user.role : 'customer');
      const companyId = String(data.company_id || (user ? user.companyId : ''));

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      if (user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      }
      await SecureStore.setItemAsync(ROLE_KEY, role);
      await SecureStore.setItemAsync(COMPANY_KEY, companyId);

      // Set default header for future requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { user, token, role, companyId };
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      await SecureStore.deleteItemAsync(ROLE_KEY);
      await SecureStore.deleteItemAsync(COMPANY_KEY);
      delete axiosInstance.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout failed', error);
    }
  },

  getToken: async () => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  getUser: async (): Promise<User | null> => {
    const userJson = await SecureStore.getItemAsync(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  getRole: async () => {
    return await SecureStore.getItemAsync(ROLE_KEY);
  },

  getCompanyId: async () => {
    return await SecureStore.getItemAsync(COMPANY_KEY);
  },
};

