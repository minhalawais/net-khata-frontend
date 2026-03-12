import { create } from 'zustand';
import { AuthService, User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null;
  companyId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  role: null,
  companyId: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(username, password);
      // Depending on the API response structure, we might need to adjust this.
      // The JS version suggested { token, role, company_id }.
      // The TS version suggested { access_token, user }.
      // We'll unify them in AuthService.
      set({
        user: response.user,
        token: response.token,
        role: response.role,
        companyId: response.companyId,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed. Please check your credentials.';
      set({ error: message, isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await AuthService.logout();
    set({
      user: null,
      token: null,
      role: null,
      companyId: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  initialize: async () => {
    try {
      const token = await AuthService.getToken();
      const user = await AuthService.getUser();
      const role = await AuthService.getRole();
      const companyId = await AuthService.getCompanyId();

      if (token) {
        set({
          token,
          user,
          role,
          companyId,
          isAuthenticated: true,
          isInitialized: true
        });
      } else {
        set({ isInitialized: true, isAuthenticated: false });
      }
    } catch (error) {
      set({ isInitialized: true, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));


export default useAuthStore;
