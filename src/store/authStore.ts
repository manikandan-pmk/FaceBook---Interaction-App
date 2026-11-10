
import { create } from "zustand";

interface SuperAdminState {
  id: number;
  superAdminId: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface AdminState {
  id: number;
  adminId: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface AuthState {
  superAdmin: SuperAdminState | null;
  admin: AdminState | null;
  isAuthenticated: boolean;

  setSuperAdmin: (data: SuperAdminState) => void;
  setAdmin: (data: AdminState) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  superAdmin: null,
  admin: null,
  isAuthenticated: false,

  setSuperAdmin: (data) =>
    set({
      superAdmin: data,
      admin: null,
      isAuthenticated: true,
    }),

  setAdmin: (data) =>
    set({
      admin: data,
      superAdmin: null,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      superAdmin: null,
      admin: null,
      isAuthenticated: false,
    }),
}));
