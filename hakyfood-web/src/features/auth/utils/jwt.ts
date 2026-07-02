import { useAuthStore } from '../store/useAuthStore';

interface DecodedToken {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  exp: number;
  iat: number;
}

/**
 * Giải mã JWT payload ở phía client không cần thư viện ngoài.
 */
export function decodeJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Kiểm tra xem người dùng hiện tại có chứa quyền hạn cụ thể hay không.
 */
export function hasPermission(permission: string): boolean {
  const token = useAuthStore.getState().accessToken;
  if (!token) return false;

  const payload = decodeJwt(token);
  if (!payload || !payload.permissions) return false;

  return payload.permissions.includes(permission);
}

/**
 * Kiểm tra xem người dùng hiện tại có vai trò cụ thể hay không.
 */
export function hasRole(role: string): boolean {
  const token = useAuthStore.getState().accessToken;
  if (!token) return false;

  const payload = decodeJwt(token);
  if (!payload || !payload.roles) return false;

  return payload.roles.includes(role);
}
