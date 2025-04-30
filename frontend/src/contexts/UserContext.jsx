import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = useCallback(async (publicId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/users/${publicId}`);
            const userData = response.data;
            const token = Cookies.get('token');
            setUser({ ...userData, token });
        } catch (error) {
            console.error('Error fetching user data:', error);
            Cookies.remove('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = Cookies.get('token');
        if (token && !user) {
            try {
                const decoded = jwtDecode(token);
                fetchUserData(decoded.publicId);
            } catch (error) {
                console.error('Error decoding token:', error);
                Cookies.remove('token');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [fetchUserData]);

    return (
        <UserContext.Provider value={{ user, loading, setUser, fetchUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};