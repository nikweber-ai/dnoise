
import { useEffect } from 'react';

export const useAuthTimeout = (
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void,
  timeoutDuration: number = 5000
) => {
  // Add a short timeout to prevent infinite loading state
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading timeout reached - forcing load completion");
        setIsLoading(false);
      }
    }, timeoutDuration);

    return () => clearTimeout(loadingTimeout);
  }, [isLoading, setIsLoading, timeoutDuration]);
};
