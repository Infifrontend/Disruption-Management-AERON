
export interface User {
  id: number;
  email: string;
  userType: 'super_admin' | 'passenger_manager' | 'crew_manager';
  userCode: string;
  fullName: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

class AuthService {
  private baseUrl: string;
  private tokenKey = 'aeron_auth_token';
  private userKey = 'aeron_user_data';

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    // Ensure baseUrl doesn't end with slash to prevent double slashes
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.setToken(data.token);
        this.setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async verifyToken(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        this.setUser(data.user);
        return data.user;
      } else {
        this.clearAuth();
        return null;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      this.clearAuth();
      return null;
    }
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  hasPermission(requiredUserType?: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    if (!requiredUserType) return true;
    
    // Super admin has access to everything
    if (user.userType === 'super_admin') return true;
    
    return user.userType === requiredUserType;
  }
}

export const authService = new AuthService();
