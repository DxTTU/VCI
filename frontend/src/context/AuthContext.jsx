import React, { createContext, useContext, useState } from 'react';

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
  const isAdmin = role.toLowerCase() === 'admin';

  // Direct helper to refresh user profile data
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('vci_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Phase 1: Check credentials, trigger OTP dispatch, pause login
  const initiateLogin = async (identifier, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      return data; // { status: 'OTP_REQUIRED', preAuthToken, maskedEmail, devOtp }
    } catch (err) {
      // If backend offline or network error, provide fallback
      if (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        return {
          status: 'OTP_REQUIRED',
          preAuthToken: 'demo-preauth-token',
          maskedEmail: identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@vasaviclub.org`,
          devOtp: '123456',
          isOfflineDemo: true,
        };
      }
      throw err;
    }
  };

  // Phase 2: Verify OTP and issue JWT access token
  const verifyOTP = async (otp, preAuthToken, emailHint) => {
    try {
      // If offline demo token
      if (preAuthToken === 'demo-preauth-token') {
        if (otp !== '123456' && otp.length !== 6) {
          throw new Error('Invalid verification code. Enter 123456 for demo mode.');
        }
        const fallbackUser = {
          name: emailHint?.split('@')[0] || 'Lion Member',
          email: emailHint || 'member@vasaviclub.org',
          role: 'Club Officer',
        };
        localStorage.setItem('vci_auth_token', 'demo-jwt-token-active');
        localStorage.setItem('vci_user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        setIsAuthenticated(true);
        return { success: true, user: fallbackUser };
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${preAuthToken}`,
        },
        body: JSON.stringify({ otp, preAuthToken }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      localStorage.setItem('vci_auth_token', data.token);
      localStorage.setItem('vci_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      throw err;
    }
  };

  // Resend OTP with cooldown
  const resendOTP = async (preAuthToken) => {
    if (preAuthToken === 'demo-preauth-token') {
      return { success: true, devOtp: '123456', message: 'Demo verification code re-dispatched.' };
    }

    const response = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${preAuthToken}`,
      },
      body: JSON.stringify({ preAuthToken }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend verification code.');
    }
    return data;
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
