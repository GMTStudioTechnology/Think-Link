import React, { createContext, useState, ReactNode, useEffect } from 'react';

// Define the shape of the AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the AuthContext with default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
});

// Define the props for the AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component that wraps the application and provides authentication state
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Mock login function (replace with real API call)
  const login = async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace this with your actual authentication logic/API call
    // For demonstration, we'll accept any non-empty email and password
    if (email && password) {
      const token = 'mock-auth-token'; // Replace with real token from backend
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  // Mock signup function (replace with real API call)
  const signup = async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace this with your actual signup logic/API call
    // For demonstration, we'll accept any non-empty email and password
    if (email && password) {
      // Simulate successful signup
      return true;
    }
    return false;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 