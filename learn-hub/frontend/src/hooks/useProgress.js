import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const useProgress = (courseId) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !courseId) {
      setProgress(null);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api(`/progress/${courseId}`);
        setProgress(res.data);
      } catch (err) {
        console.error('Progress fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [courseId, user]);

  return { progress, loading, error };
};