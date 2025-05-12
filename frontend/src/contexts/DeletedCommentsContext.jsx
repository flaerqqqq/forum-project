// contexts/DeletedCommentsContext.jsx
import React, { createContext, useState, useCallback } from 'react';

export const DeletedCommentsContext = createContext();

export const DeletedCommentsProvider = ({ children }) => {
    const [deletedCommentIds, setDeletedCommentIds] = useState([]);

    const addDeletedCommentId = useCallback((commentId) => {
        setDeletedCommentIds(prevIds => [...new Set([...prevIds, commentId])]);
    }, []);

    return (
        <DeletedCommentsContext.Provider value={{ deletedCommentIds, addDeletedCommentId }}>
            {children}
        </DeletedCommentsContext.Provider>
    );
};