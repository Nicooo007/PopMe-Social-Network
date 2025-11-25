import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps {
  fetchMore: () => Promise<void>;
  hasMore: boolean;
}

export function useInfiniteScroll({ fetchMore, hasMore }: UseInfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      >= document.documentElement.offsetHeight - 100
    ) {
      if (hasMore && !isFetching) {
        setIsFetching(true);
      }
    }
  }, [hasMore, isFetching]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) return;
    
    fetchMore().finally(() => {
      setIsFetching(false);
    });
  }, [isFetching, fetchMore]);

  return { isFetching };
}