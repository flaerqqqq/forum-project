import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';

export const ModeratedCategoriesContext = createContext({
    moderatedCategorySlugs: [],
    loadingModeratedCategories: true,
    errorModeratedCategories: null,

    addModeratedCategory: (slug) => {},
    removeModeratedCategory: (slug) => {},
});

export const ModeratedCategoriesProvider = ({ children }) => {

    const { user: authenticatedUser, loading: authLoading } = useUser();


    const [moderatedCategorySlugs, setModeratedCategorySlugs] = useState([]);
    const [loadingModeratedCategories, setLoadingModeratedCategories] = useState(true);
    const [errorModeratedCategories, setErrorModeratedCategories] = useState(null);

    useEffect(() => {
        const fetchModeratedCategories = async () => {

            if (authLoading) {
                setLoadingModeratedCategories(true);
                return;
            }


            if (!authenticatedUser) {
                setModeratedCategorySlugs([]);
                setLoadingModeratedCategories(false);
                setErrorModeratedCategories(null);
                return;
            }


            setLoadingModeratedCategories(true);
            setErrorModeratedCategories(null);

            try {
                const token = Cookies.get('token');
                if (!token) {


                    console.warn("Authenticated user found but no token in cookies.");
                    setModeratedCategorySlugs([]);
                    setLoadingModeratedCategories(false);
                    return;
                }


                const response = await axios.get('http://localhost:8080/api/v1/users/me/moderators', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setModeratedCategorySlugs(response.data || []);
                } else if (response.status === 204) {
                    setModeratedCategorySlugs([]);
                }

            } catch (err) {
                console.error('Error fetching moderated categories:', err);
                if (axios.isAxiosError(err) && err.response) {
                    const status = err.response.status;
                    if (status === 403) {
                        setErrorModeratedCategories("Permission denied to fetch moderated categories.");
                    } else if (status === 404) {
                        setErrorModeratedCategories("Moderated categories endpoint not found.");
                    } else {
                        setErrorModeratedCategories(err.response.data?.message || "Failed to load moderated categories.");
                    }
                } else {
                    setErrorModeratedCategories("Failed to load moderated categories.");
                }
                setModeratedCategorySlugs([]);
            } finally {
                setLoadingModeratedCategories(false);
            }
        };

        fetchModeratedCategories();

    }, [authenticatedUser, authLoading]);

    const addModeratedCategory = useCallback((slug) => {
        setModeratedCategorySlugs(prevSlugs => {
            if (!prevSlugs.includes(slug)) {
                return [...prevSlugs, slug];
            }
            return prevSlugs;
        });
    }, []);

    const removeModeratedCategory = useCallback((slug) => {
        setModeratedCategorySlugs(prevSlugs => prevSlugs.filter(s => s !== slug));
    }, []);


    const contextValue = {
        moderatedCategorySlugs,
        loadingModeratedCategories,
        errorModeratedCategories,
        addModeratedCategory,
        removeModeratedCategory,
    };

    return (
        <ModeratedCategoriesContext.Provider value={contextValue}>
            {children}
        </ModeratedCategoriesContext.Provider>
    );
};


export const useModeratedCategories = () => {
    const context = useContext(ModeratedCategoriesContext);

    if (context === undefined) {
        throw new Error('useModeratedCategories must be used within a ModeratedCategoriesProvider');
    }
    return context;
};