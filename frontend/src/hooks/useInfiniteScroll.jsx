import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useApi() {
  const { currentUser } = useAuth();

  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if user is logged in
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  };

  return { apiCall };
}

export function useFetch(endpoint, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiCall } = useApi();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(endpoint);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
}

export function useInfiniteScroll(endpoint, limit = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { apiCall } = useApi();

  const loadMore = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const result = await apiCall(`${endpoint}?page=${page}&limit=${limit}`);
      
      setData(prev => [...prev, ...result.posts || result.comments || result.communities || []]);
      setHasMore(result.pagination.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData([]);
    setPage(1);
    setHasMore(true);
  };

  useEffect(() => {
    loadMore();
  }, []);

  return { data, loading, hasMore, loadMore, reset };
}