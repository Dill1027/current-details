import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: 'AUTH_FAILURE' });
        return;
      }

      // Set the token in API service
      apiService.setAuthToken(token);
      
      // Verify token with backend
      const response = await apiService.verifyToken();
      
      if (response.success && response.data.user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: token,
          },
        });
      } else {
        // Invalid token
        localStorage.removeItem('token');
        apiService.clearAuthToken();
        dispatch({ type: 'AUTH_FAILURE' });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('token');
      apiService.clearAuthToken();
      dispatch({ type: 'AUTH_FAILURE' });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.login(email, password);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        apiService.setAuthToken(token);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.register(name, email, password);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        apiService.setAuthToken(token);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove token
      localStorage.removeItem('token');
      apiService.clearAuthToken();
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('token');
      apiService.clearAuthToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};