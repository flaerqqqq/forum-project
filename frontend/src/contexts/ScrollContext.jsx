// src/contexts/ScrollContext.jsx
import React, { createContext, useContext, useRef } from 'react';

const ScrollContext = createContext();

export const ScrollProvider = ({ children }) => {
    const scrollMapRef = useRef(new Map()); // key: categorySlug, value: { scrollY, loadedPages }

    const saveScrollData = (key, data) => {
        scrollMapRef.current.set(key, data);
    };

    const getScrollData = (key) => {
        return scrollMapRef.current.get(key);
    };

    const clearScrollData = (key) => {
        scrollMapRef.current.delete(key);
    };

    return (
        <ScrollContext.Provider value={{ saveScrollData, getScrollData, clearScrollData }}>
            {children}
        </ScrollContext.Provider>
    );
};

export const useScrollContext = () => useContext(ScrollContext);