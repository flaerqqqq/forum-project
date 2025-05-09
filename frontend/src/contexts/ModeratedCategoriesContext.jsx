// src/contexts/ModeratedCategoriesContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from './UserContext'; // Assuming UserContext is in the same directory

// Create the context with default empty values and placeholder update functions
export const ModeratedCategoriesContext = createContext({
    moderatedCategorySlugs: [],
    loadingModeratedCategories: true,
    errorModeratedCategories: null,
    // Add placeholder functions for updating the state
    addModeratedCategory: (slug) => {}, // Placeholder function
    removeModeratedCategory: (slug) => {}, // Placeholder function
});

// Create the provider component
export const ModeratedCategoriesProvider = ({ children }) => {
    // Get authenticated user and auth loading state from UserContext
    const { user: authenticatedUser, loading: authLoading } = useUser();

    // State for the list of moderated category slugs
    const [moderatedCategorySlugs, setModeratedCategorySlugs] = useState([]);
    // State for loading status
    const [loadingModeratedCategories, setLoadingModeratedCategories] = useState(true);
    // State for any errors during fetching
    const [errorModeratedCategories, setErrorModeratedCategories] = useState(null);

    useEffect(() => {
        const fetchModeratedCategories = async () => {
            // If auth is still loading, wait
            if (authLoading) {
                setLoadingModeratedCategories(true); // Keep loading true while waiting for auth
                return;
            }

            // If no user is authenticated after authLoading is false,
            // clear the list, set loading to false, and clear any errors.
            if (!authenticatedUser) {
                setModeratedCategorySlugs([]);
                setLoadingModeratedCategories(false);
                setErrorModeratedCategories(null); // Clear any previous errors
                return;
            }

            // User is authenticated, proceed with fetching
            setLoadingModeratedCategories(true); // Start loading for this fetch
            setErrorModeratedCategories(null); // Clear errors before new fetch

            try {
                const token = Cookies.get('token');
                if (!token) {
                    // This case should ideally be handled by useUser returning null if no token,
                    // but added as a safeguard. If user is authenticated, token should exist.
                    console.warn("Authenticated user found but no token in cookies.");
                    setModeratedCategorySlugs([]);
                    setLoadingModeratedCategories(false);
                    return;
                }

                // Make the API call to fetch moderated categories for the authenticated user
                // Assuming the endpoint returns an array of slugs
                const response = await axios.get('http://localhost:8080/api/v1/users/me/moderators', {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the JWT token in the Authorization header
                    },
                });

                // Backend returns 204 No Content for an empty list, 200 OK with list otherwise
                if (response.status === 200) {
                    // Assuming the response data is an array of category slugs (strings)
                    setModeratedCategorySlugs(response.data || []); // Use || [] to ensure it's an array even if data is null/undefined
                } else if (response.status === 204) {
                    // Handle No Content response by setting an empty array
                    setModeratedCategorySlugs([]);
                }

            } catch (err) {
                // Log the error and set the error state
                console.error('Error fetching moderated categories:', err);
                // Check if it's an Axios error and if there's a specific response status/message
                if (axios.isAxiosError(err) && err.response) {
                    const status = err.response.status;
                    if (status === 403) {
                        setErrorModeratedCategories("Permission denied to fetch moderated categories.");
                    } else if (status === 404) {
                        // Handle 404 if the endpoint itself is not found, though less likely
                        setErrorModeratedCategories("Moderated categories endpoint not found.");
                    } else {
                        // Use backend error message if available, otherwise a generic one
                        setErrorModeratedCategories(err.response.data?.message || "Failed to load moderated categories.");
                    }
                } else {
                    setErrorModeratedCategories("Failed to load moderated categories.");
                }
                setModeratedCategorySlugs([]); // Clear list on error
            } finally {
                // Set loading to false once the fetch is complete (success or error)
                setLoadingModeratedCategories(false);
            }
        };

        // Call the fetch function when authenticatedUser or authLoading state changes
        fetchModeratedCategories();

        // Effect dependencies: re-run the effect if the authenticated user or auth loading state changes
    }, [authenticatedUser, authLoading]);

    // Memoized function to add a category slug to the moderated list
    const addModeratedCategory = useCallback((slug) => {
        setModeratedCategorySlugs(prevSlugs => {
            // Only add if the slug is not already in the list
            if (!prevSlugs.includes(slug)) {
                return [...prevSlugs, slug];
            }
            return prevSlugs; // Return previous state if slug is already present
        });
    }, []); // No dependencies needed as setModeratedCategorySlugs is stable

    // Memoized function to remove a category slug from the moderated list
    const removeModeratedCategory = useCallback((slug) => {
        setModeratedCategorySlugs(prevSlugs => prevSlugs.filter(s => s !== slug));
    }, []); // No dependencies needed as setModeratedCategorySlugs is stable


    // The value provided by the context provider
    const contextValue = {
        moderatedCategorySlugs,
        loadingModeratedCategories,
        errorModeratedCategories,
        addModeratedCategory, // Include the add function
        removeModeratedCategory, // Include the remove function
    };

    // Render the children wrapped by the provider, passing the context value
    return (
        <ModeratedCategoriesContext.Provider value={contextValue}>
            {children}
        </ModeratedCategoriesContext.Provider>
    );
};

// Custom hook to easily consume the Moderated Categories Context
export const useModeratedCategories = () => {
    const context = useContext(ModeratedCategoriesContext);
    // Throw an error if the hook is used outside of a ModeratedCategoriesProvider
    if (context === undefined) {
        throw new Error('useModeratedCategories must be used within a ModeratedCategoriesProvider');
    }
    return context;
};