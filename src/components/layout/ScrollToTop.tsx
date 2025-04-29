import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top
 * whenever the pathname in the URL changes
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop; 