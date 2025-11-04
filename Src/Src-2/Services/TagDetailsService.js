import { useEffect, useState } from 'react';
import { useApiBaseUrl } from '../../Config/Config';

const useEstimationData = (itemId, tagNo) => {
  const [estimationData, setEstimationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = useApiBaseUrl();

  useEffect(() => {
    if (!itemId || !tagNo) return;

    const fetchEstimationData = async () => {
      setLoading(true);
      setError('');
      setEstimationData(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/estimationTotal?ITEMID=${itemId}&TAGNO=${tagNo}`
        );

        if (!response.ok) throw new Error('Failed to fetch estimation data');

        const data = await response.json();

        // Handle "No record found" message
        if (data?.message === "No record found") {
          setError("No records found for this Tag Key");
          setEstimationData(null);
        } else {
          setEstimationData(data[0] || null);
        }
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchEstimationData();
  }, [itemId, tagNo]);

  return { estimationData, loading, error };
};

export default useEstimationData;
