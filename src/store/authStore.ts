
import { create } from "zustand";



interface AdminState {
  id: number;
  adminId: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface AuthState {
  
  admin: AdminState | null;
  isAuthenticated: boolean;

  
  setAdmin: (data: AdminState) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  
  admin: null,
  isAuthenticated: false,


  setAdmin: (data) =>
    set({
      admin: data,
  
      isAuthenticated: true,
    }),

  logout: () =>
    set({

      admin: null,
      isAuthenticated: false,
    }),
}));
