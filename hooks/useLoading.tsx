import { useState, useEffect, useCallback } from "react";

interface LoadingProps {
  loadingFunction: () => Promise<any>;
}

function useLoading({ loadingFunction }: LoadingProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = useCallback(async () => {
    setIsLoading(true);
    await loadingFunction();
    setIsLoading(false);
  }, [loadingFunction]);

  useEffect(() => {
    handleLoad();
  }, []);

  return { isLoading };
}

export default useLoading;
