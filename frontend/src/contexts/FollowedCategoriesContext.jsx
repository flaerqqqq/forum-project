import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from './UserContext';


export const FollowedCategoriesContext = createContext({
    followedCategorySlugs: [],
    loadingFollowedCategories: true,
    errorFollowedCategories: null,

    addFollowedCategory: (slug) => {},
    removeFollowedCategory: (slug) => {},
});


export const FollowedCategoriesProvider = ({ children }) => {

    const { user: authenticatedUser, loading: authLoading } = useUser();


    const [followedCategorySlugs, setFollowedCategorySlugs] = useState([]);

    const [loadingFollowedCategories, setLoadingFollowedCategories] = useState(true);

    const [errorFollowedCategories, setErrorFollowedCategories] = useState(null);


    useEffect(() => {
        const fetchFollowedCategories = async () => {

            if (authLoading) {
                setLoadingFollowedCategories(true);
                return;
            }



            if (!authenticatedUser) {
                setFollowedCategorySlugs([]);
                setLoadingFollowedCategories(false);
                setErrorFollowedCategories(null);
                return;
            }


            setLoadingFollowedCategories(true);
            setErrorFollowedCategories(null);

            try {

                const token = Cookies.get('token');



                if (!token) {
                    console.warn("Authenticated user found but no token in cookies.");
                    setFollowedCategorySlugs([]);
                    setLoadingFollowedCategories(false);
                    return;
                }



                const response = await axios.get('http://localhost:8080/api/v1/users/me/follows/slug', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });



                if (response.status === 200) {

                    setFollowedCategorySlugs(response.data || []);
                } else if (response.status === 204) {

                    setFollowedCategorySlugs([]);
                }

            } catch (err) {

                console.error('Error fetching followed categories:', err);

                if (axios.isAxiosError(err) && err.response) {
                    const status = err.response.status;
                    if (status === 403) {
                        setErrorFollowedCategories("Permission denied to fetch followed categories.");
                    } else if (status === 404) {

                        setErrorFollowedCategories("Followed categories endpoint not found.");
                    } else {

                        setErrorFollowedCategories(err.response.data?.message || "Failed to load followed categories.");
                    }
                } else {
                    setErrorFollowedCategories("Failed to load followed categories.");
                }
                setFollowedCategorySlugs([]);
            } finally {

                setLoadingFollowedCategories(false);
            }
        };


        fetchFollowedCategories();


    }, [authenticatedUser, authLoading]);


    const addFollowedCategory = useCallback((slug) => {
        setFollowedCategorySlugs(prevSlugs => {

            if (!prevSlugs.includes(slug)) {
                return [...prevSlugs, slug];
            }
            return prevSlugs;
        });
    }, []);


    const removeFollowedCategory = useCallback((slug) => {
        setFollowedCategorySlugs(prevSlugs => prevSlugs.filter(s => s !== slug));
    }, []);



    const contextValue = {
        followedCategorySlugs,
        loadingFollowedCategories,
        errorFollowedCategories,
        addFollowedCategory,
        removeFollowedCategory,
    };


    return (
        <FollowedCategoriesContext.Provider value={contextValue}>
            {children}
        </FollowedCategoriesContext.Provider>
    );
};


export const useFollowedCategories = () => {
    const context = useContext(FollowedCategoriesContext);

    if (context === undefined) {
        throw new Error('useFollowedCategories must be used within a FollowedCategoriesProvider');
    }
    return context;
};