import { useState, useEffect } from 'react';
import { hybridAnalyticsService, BenchmarkData } from '@/services/hybridAnalyticsService';

interface BenchmarkHook {
  benchmark: BenchmarkData | null;
  loading: boolean;
  error: string | null;
  refreshBenchmark: () => Promise<void>;
}

export const useBenchmarks = (category: string): BenchmarkHook => {
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBenchmark = async () => {
    if (!category) return;

    try {
      setLoading(true);
      setError(null);
      
      const benchmarkData = await hybridAnalyticsService.getBenchmark(category);
      setBenchmark(benchmarkData);
    } catch (err) {
      console.error('Error loading benchmark:', err);
      setError('Erreur lors du chargement du benchmark');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenchmark();
  }, [category]);

  const refreshBenchmark = async () => {
    // Clear cache and reload
    hybridAnalyticsService.clearCache();
    await loadBenchmark();
  };

  return {
    benchmark,
    loading,
    error,
    refreshBenchmark
  };
};

// Hook pour benchmarks multiples catégories
export const useMultipleBenchmarks = (categories: string[]) => {
  const [benchmarks, setBenchmarks] = useState<Record<string, BenchmarkData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBenchmarks = async () => {
      if (!categories || categories.length === 0) return;

      try {
        setLoading(true);
        setError(null);
        
        const benchmarkPromises = categories.map(async (category) => {
          const data = await hybridAnalyticsService.getBenchmark(category);
          return { category, data };
        });

        const results = await Promise.all(benchmarkPromises);
        const benchmarkMap: Record<string, BenchmarkData> = {};
        
        results.forEach(({ category, data }) => {
          if (data) {
            benchmarkMap[category] = data;
          }
        });

        setBenchmarks(benchmarkMap);
      } catch (err) {
        console.error('Error loading benchmarks:', err);
        setError('Erreur lors du chargement des benchmarks');
      } finally {
        setLoading(false);
      }
    };

    loadBenchmarks();
  }, [categories.join(',')]);

  return {
    benchmarks,
    loading,
    error
  };
};