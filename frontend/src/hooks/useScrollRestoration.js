import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const scrollPositions = {};

export default function useScrollRestoration(trigger = true) {
    const location = useLocation();

    useEffect(() => {
        return () => {
            scrollPositions[location.key] = {
                x: window.scrollX,
                y: window.scrollY,
            };
        };
    }, [location]);

    useLayoutEffect(() => {
        if (trigger && scrollPositions[location.key]) {
            const { x, y } = scrollPositions[location.key];
            window.scrollTo(x, y);
        }
    }, [location, trigger]);
}