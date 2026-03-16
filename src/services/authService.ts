// ─── Auth Service ─────────────────────────────────────────────────────────────
// Handles login, register, token refresh.
// All endpoints map to a real backend — replace BASE path when ready.
// ─────────────────────────────────────────────────────────────────────────────
import api from './api';

// ── Request / Response types ──────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  avatarEmoji?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
const BASE = '/auth';

export const authService = {
  /**
   * POST /auth/login
   * Returns access + refresh token pair.
   */
  login: (body: LoginRequest) =>
    api.post<AuthResponse>(`${BASE}/login`, body).then((r) => r.data),

  /**
   * POST /auth/register
   * Creates a new player account.
   */
  register: (body: RegisterRequest) =>
    api.post<AuthResponse>(`${BASE}/register`, body).then((r) => r.data),

  /**
   * POST /auth/refresh
   * Exchanges an existing refresh token for a new access token.
   */
  refreshToken: (body: RefreshTokenRequest) =>
    api.post<AuthResponse>(`${BASE}/refresh`, body).then((r) => r.data),

  /**
   * POST /auth/logout
   * Invalidates the refresh token on the server.
   */
  logout: () =>
    api.post<{ success: boolean }>(`${BASE}/logout`).then((r) => r.data),
};

export default authService;
