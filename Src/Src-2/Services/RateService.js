import { useEffect, useState } from 'react';
import { useApiBaseUrl } from '../../Config/Config';

const useServiceRates = () => {
  const [rates, setRates] = useState({ SILVERRATE: 0, GOLDRATE: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = useApiBaseUrl();

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/todayrate`);
        if (!response.ok) throw new Error('Failed to fetch rates');
        const data = await response.json();
        setRates({
          SILVERRATE: data.SILVERRATE,
          GOLDRATE: data.GOLDRATE
        });
        console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return { rates, loading, error };
};

export default useServiceRates;
