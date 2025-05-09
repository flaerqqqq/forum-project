// src/contexts/FollowedCategoriesContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from './UserContext'; // Assuming UserContext is in the same directory

// Create the context with default empty values and placeholder update functions
export const FollowedCategoriesContext = createContext({
    followedCategorySlugs: [],
    loadingFollowedCategories: true,
    errorFollowedCategories: null,
    // Add placeholder functions for updating the state
    addFollowedCategory: (slug) => {}, // Placeholder function
    removeFollowedCategory: (slug) => {}, // Placeholder function
});

// Create the provider component
export const FollowedCategoriesProvider = ({ children }) => {
    // Get authenticated user and auth loading state from UserContext
    const { user: authenticatedUser, loading: authLoading } = useUser();

    // State for the list of followed category slugs
    const [followedCategorySlugs, setFollowedCategorySlugs] = useState([]);
    // State for loading status
    const [loadingFollowedCategories, setLoadingFollowedCategories] = useState(true);
    // State for any errors during fetching
    const [errorFollowedCategories, setErrorFollowedCategories] = useState(null);


    useEffect(() => {
        const fetchFollowedCategories = async () => {
            // If authentication is still in progress, wait for it to complete
            if (authLoading) {
                setLoadingFollowedCategories(true); // Keep loading true while waiting for auth
                return;
            }

            // If no user is authenticated after authLoading is false,
            // clear the list, set loading to false, and clear any errors.
            if (!authenticatedUser) {
                setFollowedCategorySlugs([]);
                setLoadingFollowedCategories(false);
                setErrorFollowedCategories(null);
                return;
            }

            // User is authenticated, proceed with fetching followed categories
            setLoadingFollowedCategories(true); // Start loading for this fetch
            setErrorFollowedCategories(null); // Clear previous errors

            try {
                // Get the JWT token from cookies
                const token = Cookies.get('token');

                // Although useUser checks for authentication, this is a safeguard.
                // If authenticatedUser is present, the token should also be.
                if (!token) {
                    console.warn("Authenticated user found but no token in cookies.");
                    setFollowedCategorySlugs([]);
                    setLoadingFollowedCategories(false);
                    return;
                }

                // Make the API call to fetch followed categories for the authenticated user
                // Assuming the endpoint returns an array of slugs
                const response = await axios.get('http://localhost:8080/api/v1/users/me/follows/slug', {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the JWT token in the Authorization header
                    },
                });

                // Backend is expected to return 204 No Content for an empty list
                // and 200 OK with the list of slugs otherwise.
                if (response.status === 200) {
                    // Assuming the response data is an array of category slugs (strings)
                    setFollowedCategorySlugs(response.data || []); // Use || [] to ensure it's an array even if data is null/undefined
                } else if (response.status === 204) {
                    // Handle No Content response by setting an empty array
                    setFollowedCategorySlugs([]);
                }

            } catch (err) {
                // Log the error and set the error state
                console.error('Error fetching followed categories:', err);
                // Check if it's an Axios error and if there's a specific response status/message
                if (axios.isAxiosError(err) && err.response) {
                    const status = err.response.status;
                    if (status === 403) {
                        setErrorFollowedCategories("Permission denied to fetch followed categories.");
                    } else if (status === 404) {
                        // Handle 404 if the endpoint itself is not found, though less likely
                        setErrorFollowedCategories("Followed categories endpoint not found.");
                    } else {
                        // Use backend error message if available, otherwise a generic one
                        setErrorFollowedCategories(err.response.data?.message || "Failed to load followed categories.");
                    }
                } else {
                    setErrorFollowedCategories("Failed to load followed categories.");
                }
                setFollowedCategorySlugs([]); // Clear the list on error
            } finally {
                // Set loading to false once the fetch is complete (success or error)
                setLoadingFollowedCategories(false);
            }
        };

        // Call the fetch function when authenticatedUser or authLoading state changes
        fetchFollowedCategories();

        // Effect dependencies: re-run the effect if the authenticated user or auth loading state changes
    }, [authenticatedUser, authLoading]);

    // Memoized function to add a category slug to the followed list
    const addFollowedCategory = useCallback((slug) => {
        setFollowedCategorySlugs(prevSlugs => {
            // Only add if the slug is not already in the list
            if (!prevSlugs.includes(slug)) {
                return [...prevSlugs, slug];
            }
            return prevSlugs; // Return previous state if slug is already present
        });
    }, []); // No dependencies needed as setFollowedCategorySlugs is stable

    // Memoized function to remove a category slug from the followed list
    const removeFollowedCategory = useCallback((slug) => {
        setFollowedCategorySlugs(prevSlugs => prevSlugs.filter(s => s !== slug));
    }, []); // No dependencies needed as setFollowedCategorySlugs is stable


    // The value provided by the context provider
    const contextValue = {
        followedCategorySlugs,
        loadingFollowedCategories,
        errorFollowedCategories,
        addFollowedCategory, // Include the add function
        removeFollowedCategory, // Include the remove function
    };

    // Render the children wrapped by the provider, passing the context value
    return (
        <FollowedCategoriesContext.Provider value={contextValue}>
            {children}
        </FollowedCategoriesContext.Provider>
    );
};

// Custom hook to easily consume the Followed Categories Context
export const useFollowedCategories = () => {
    const context = useContext(FollowedCategoriesContext);
    // Throw an error if the hook is used outside of a FollowedCategoriesProvider
    if (context === undefined) {
        throw new Error('useFollowedCategories must be used within a FollowedCategoriesProvider');
    }
    return context;
};