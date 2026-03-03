import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session on mount
        const savedUser = localStorage.getItem('aether_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const loginWithGoogle = async (email = 'guest@aether.ai') => {
        setLoading(true);
        // Simulate Google OAuth flow
        return new Promise((resolve) => {
            setTimeout(() => {
                const nameFromEmail = email.split('@')[0];
                const displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

                const mockUser = {
                    id: `google_${Date.now()}`,
                    name: displayName || 'Guest User',
                    email: email,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`
                };
                setUser(mockUser);
                setIsAuthenticated(true);
                localStorage.setItem('aether_user', JSON.stringify(mockUser));
                setLoading(false);
                resolve(mockUser);
            }, 1500);
        });
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('aether_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, loginWithGoogle, logout }}>
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
