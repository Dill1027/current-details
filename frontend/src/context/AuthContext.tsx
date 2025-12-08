import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import apiService from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          dispatch({ type: 'AUTH_START' });
          
          // Verify token with backend
          const result = await apiService.verifyToken(token);
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: result.user,
              token,
            },
          });
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await apiService.login(email, password);
      
      // Store token and user data
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await apiService.register(name, email, password);
      
      // Store token and user data
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = (): void => {
    // Remove token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (name: string, email: string): Promise<void> => {
    try {
      const result = await apiService.updateProfile(name, email);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(result.user));
      
      dispatch({
        type: 'UPDATE_USER',
        payload: result.user,
      });
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiService.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;