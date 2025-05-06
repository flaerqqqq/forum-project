import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const DeletedPostsContext = createContext();

// Custom hook to use the context
export const useDeletedPosts = () => {
    const context = useContext(DeletedPostsContext);
    if (!context) {
        throw new Error('useDeletedPosts must be used within a DeletedPostsProvider');
    }
    return context;
};

// Provider component
export const DeletedPostsProvider = ({ children }) => {
    // State to hold the IDs of deleted posts
    const [deletedPostIds, setDeletedPostIds] = useState([]);

    // Function to add a deleted post ID to the list
    const addDeletedPostId = useCallback((postId) => {
        setDeletedPostIds(prevIds => {
            // Use a Set for efficient checking and to avoid duplicates
            const idsSet = new Set(prevIds);
            if (!idsSet.has(postId)) {
                idsSet.add(postId);
                return Array.from(idsSet); // Convert back to array for state
            }
            return prevIds; // Return previous state if ID already exists
        });
    }, []);

    // Function to clear deleted post IDs (optional, depending on your needs)
    // You might clear this list on a full page refresh or logout, for example.
    const clearDeletedPostIds = useCallback(() => {
        setDeletedPostIds([]);
    }, []);

    // The value provided by the context
    const contextValue = {
        deletedPostIds,
        addDeletedPostId,
        clearDeletedPostIds, // Expose clear function if needed
    };

    return (
        <DeletedPostsContext.Provider value={contextValue}>
            {children}
        </DeletedPostsContext.Provider>
    );
};