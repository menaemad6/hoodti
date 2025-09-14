import { useEffect, useState } from 'react';

export function useIsTouch() {
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    // Check if the device supports touch events
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(hasTouch);
  }, []);

  return isTouch;
}
