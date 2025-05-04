// hooks/useScrollRestoration.js
import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const scrollPositions = {};

export default function useScrollRestoration(trigger = true) {
    const location = useLocation();

    // Save scroll before navigation
    useEffect(() => {
        return () => {
            scrollPositions[location.key] = {
                x: window.scrollX,
                y: window.scrollY,
            };
        };
    }, [location]);

    // Restore scroll only when explicitly triggered
    useLayoutEffect(() => {
        if (trigger && scrollPositions[location.key]) {
            const { x, y } = scrollPositions[location.key];
            window.scrollTo(x, y);
        }
    }, [location, trigger]);
}