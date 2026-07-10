import { useLocation } from 'react-router-dom';
import { useLayoutEffect, useEffect } from 'react';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    // Scroll to top on route change
    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    // Ensure page loads at top on initial mount/refresh
    useEffect(() => {
        window.history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
    }, []);

    return null;
}

export default ScrollToTop;