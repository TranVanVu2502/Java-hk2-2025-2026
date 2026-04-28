import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('bicap_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(false);

    const login = (userData, token) => {
        setIsLoading(true);
        localStorage.setItem('bicap_token', token);
        localStorage.setItem('bicap_user', JSON.stringify(userData));
        setUser(userData);
        setIsLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('bicap_token');
        localStorage.removeItem('bicap_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);