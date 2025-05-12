import React, { createContext, useContext, useState, useCallback } from 'react';

const DeletedPostsContext = createContext();

export const useDeletedPosts = () => {
    const context = useContext(DeletedPostsContext);
    if (!context) {
        throw new Error('useDeletedPosts must be used within a DeletedPostsProvider');
    }
    return context;
};

export const DeletedPostsProvider = ({ children }) => {
    const [deletedPostIds, setDeletedPostIds] = useState([]);

    const addDeletedPostId = useCallback((postId) => {
        setDeletedPostIds(prevIds => {
            const idsSet = new Set(prevIds);
            if (!idsSet.has(postId)) {
                idsSet.add(postId);
                return Array.from(idsSet);
            }
            return prevIds;
        });
    }, []);

    const clearDeletedPostIds = useCallback(() => {
        setDeletedPostIds([]);
    }, []);

    const contextValue = {
        deletedPostIds,
        addDeletedPostId,
        clearDeletedPostIds,
    };

    return (
        <DeletedPostsContext.Provider value={contextValue}>
            {children}
        </DeletedPostsContext.Provider>
    );
};