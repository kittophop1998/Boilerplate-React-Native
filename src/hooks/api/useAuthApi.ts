// ─── useAuthApi ───────────────────────────────────────────────────────────────
// React Query mutations for auth flow (login / register / logout / refresh).
// Integrates with AuthContext so token is persisted automatically.
// ─────────────────────────────────────────────────────────────────────────────
import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
} from '@services/authService';

const REFRESH_TOKEN_KEY = '@refresh_token';

// ── Login ──────────────────────────────────────────────────────────────────────
export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginRequest) => authService.login(body),
    onSuccess: async (data) => {
      // Persist refresh token in storage; access token is handled by AuthContext
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    },
  });
}

// ── Register ───────────────────────────────────────────────────────────────────
export function useRegister() {
  return useMutation({
    mutationFn: (body: RegisterRequest) => authService.register(body),
    onSuccess: async (data) => {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    },
  });
}

// ── Refresh Token ──────────────────────────────────────────────────────────────
export function useRefreshToken() {
  return useMutation({
    mutationFn: (body: RefreshTokenRequest) => authService.refreshToken(body),
    onSuccess: async (data) => {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    },
  });
}

// ── Logout ─────────────────────────────────────────────────────────────────────
export function useLogout() {
  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: async () => {
      // Clear stored tokens regardless of server response
      await AsyncStorage.multiRemove(['@auth_token', REFRESH_TOKEN_KEY]);
    },
  });
}
