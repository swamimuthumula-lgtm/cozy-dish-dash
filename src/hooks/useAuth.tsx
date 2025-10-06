import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  signIn: (credentials: string) => boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const HARDCODED_CREDENTIALS = '8639390915@YL';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('isAdmin');
    setIsAdmin(stored === 'true');
    setLoading(false);
  }, []);

  const signIn = (credentials: string) => {
    if (credentials === HARDCODED_CREDENTIALS) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  const signOut = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
