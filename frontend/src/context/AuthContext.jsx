import React, { createContext, useContext, useState } from 'react';
import { getApiUrl } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('vci_auth_token');
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('vci_auth_token') || null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vci_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Derived role states
  const role = user?.role || 'member';
  const isSuperAdmin = role.toLowerCase() === 'superadmin';
  const isAdmin = role.toLowerCase() === 'admin' || isSuperAdmin;

  // Direct helper to refresh user profile data
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('vci_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Phase 1: Check credentials, trigger OTP dispatch, pause login
  // If Super Admin OTP bypass triggered, backend immediately returns session JWT
  const initiateLogin = async (identifier, password) => {
    try {
      const response = await fetch(getApiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, email: identifier, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text.startsWith('<') ? `Server error (${response.status})` : text };
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }

      // If Super Admin OTP bypass: backend returned full JWT session token immediately
      if (data.token && data.user) {
        localStorage.setItem('vci_auth_token', data.token);
        localStorage.setItem('vci_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
      }

      return data; // { status: 'OTP_REQUIRED', preAuthToken, maskedEmail } OR { status: 'AUTHENTICATED', token, user }
    } catch (err) {
      if (
        err?.name === 'TypeError' ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.message?.includes('network error')
      ) {
        const netErr = new Error('[ERR // NETWORK] Backend server unreachable. Ensure server is running.');
        netErr.name = 'TypeError';
        throw netErr;
      }
      throw err;
    }
  };

  // Phase 2: Verify OTP and issue JWT access token
  const verifyOTP = async (otp, preAuthToken, emailHint) => {
    try {
      const response = await fetch(getApiUrl('/api/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: emailHint?.toLowerCase()?.trim(),
          otp: otp.trim(),
          preAuthToken,
        }),
      });

      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text.startsWith('<') ? `Server error (${response.status})` : text };
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }

      if (data.token && data.user) {
        localStorage.setItem('vci_auth_token', data.token);
        localStorage.setItem('vci_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
      }
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      if (
        err?.name === 'TypeError' ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.message?.includes('network error')
      ) {
        const netErr = new Error('[ERR // NETWORK] Backend server unreachable. Ensure server is running.');
        netErr.name = 'TypeError';
        throw netErr;
      }
      throw err;
    }
  };

  // Resend OTP with cooldown
  const resendOTP = async (preAuthToken) => {
    try {
      const response = await fetch(getApiUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${preAuthToken}`,
        },
        body: JSON.stringify({ preAuthToken }),
      });

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text.startsWith('<') ? `Server error (${response.status})` : text };
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }
      return data;
    } catch (err) {
      if (
        err?.name === 'TypeError' ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.message?.includes('network error')
      ) {
        const netErr = new Error('[ERR // NETWORK] Backend server unreachable. Ensure server is running.');
        netErr.name = 'TypeError';
        throw netErr;
      }
      throw err;
    }
  };

  // Direct login helper (e.g. for post-induction auto-sign in or fallback)
  const directLogin = (userData, customToken = 'vci-session-direct') => {
    localStorage.setItem('vci_auth_token', customToken);
    localStorage.setItem('vci_user', JSON.stringify(userData));
    setToken(customToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('vci_auth_token');
    localStorage.removeItem('vci_user');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        role,
        isAdmin,
        isSuperAdmin,
        token,
        updateUser,
        initiateLogin,
        verifyOTP,
        resendOTP,
        directLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
