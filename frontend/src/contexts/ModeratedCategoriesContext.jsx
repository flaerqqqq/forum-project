// src/contexts/ModeratedCategoriesContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from './UserContext'; // Assuming UserContext is in the same directory

// Create the context
export const ModeratedCategoriesContext = createContext({
    moderatedCategorySlugs: [],
    loadingModeratedCategories: true,
    errorModeratedCategories: null,
});

// Create the provider component
export const ModeratedCategoriesProvider = ({ children }) => {
    const { user: authenticatedUser, loading: authLoading } = useUser();
    const [moderatedCategorySlugs, setModeratedCategorySlugs] = useState([]);
    const [loadingModeratedCategories, setLoadingModeratedCategories] = useState(true);
    const [errorModeratedCategories, setErrorModeratedCategories] = useState(null);

    useEffect(() => {
        const fetchModeratedCategories = async () => {
            // If auth is still loading, wait
            if (authLoading) {
                setLoadingModeratedCategories(true);
                return;
            }

            // If no user is authenticated, clear the list and set loading to false
            if (!authenticatedUser) {
                setModeratedCategorySlugs([]);
                setLoadingModeratedCategories(false);
                setErrorModeratedCategories(null); // Clear any previous errors
                return;
            }

            // User is authenticated, proceed with fetching
            setLoadingModeratedCategories(true);
            setErrorModeratedCategories(null); // Clear errors before new fetch

            try {
                const token = Cookies.get('token');
                if (!token) {
                    // This case should ideally be handled by useUser returning null if no token,
                    // but added as a safeguard. If user is authenticated, token should exist.
                    setModeratedCategorySlugs([]);
                    setLoadingModeratedCategories(false);
                    return;
                }

                const response = await axios.get('http://localhost:8080/api/v1/users/me/moderators', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                // Backend returns 204 No Content for an empty list, 200 OK with list otherwise
                if (response.status === 200) {
                    setModeratedCategorySlugs(response.data || []); // Ensure it's an array
                } else if (response.status === 204) {
                    setModeratedCategorySlugs([]);
                }

            } catch (err) {
                console.error('Error fetching moderated categories:', err);
                // Handle 403 Forbidden specifically if needed, though assuming backend handles
                // pre-auth correctly, this might indicate an issue with the token or user.
                if (axios.isAxiosError(err) && err.response?.status === 403) {
                    setErrorModeratedCategories("Permission denied to fetch moderated categories.");
                } else {
                    setErrorModeratedCategories("Failed to load moderated categories.");
                }
                setModeratedCategorySlugs([]); // Clear list on error
            } finally {
                setLoadingModeratedCategories(false);
            }
        };

        fetchModeratedCategories();

    }, [authenticatedUser, authLoading]); // Depend on authenticatedUser and authLoading

    // Provide the context value to children
    const contextValue = {
        moderatedCategorySlugs,
        loadingModeratedCategories,
        errorModeratedCategories,
    };

    return (
        <ModeratedCategoriesContext.Provider value={contextValue}>
            {children}
        </ModeratedCategoriesContext.Provider>
    );
};

// Custom hook to use the context
export const useModeratedCategories = () => {
    const context = useContext(ModeratedCategoriesContext);
    if (context === undefined) {
        throw new Error('useModeratedCategories must be used within a ModeratedCategoriesProvider');
    }
    return context;
};