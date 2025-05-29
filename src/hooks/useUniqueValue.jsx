// hooks/useUniqueValues.js
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { dbManager } from '@/services/IndexedDBManager';
import { uniqueValuesAPI } from '@/services/UniqueValuesApi';

// Query keys
export const UNIQUE_VALUES_KEYS = {
  all: ['uniqueValues'],
  names: ['uniqueValues', 'names'],
  gifts: ['uniqueValues', 'gifts'],
  relations: ['uniqueValues', 'relations'],
  cities: ['uniqueValues', 'cities'],
  workTypes: ['uniqueValues', 'workTypes'],
};

// Custom hook to fetch and manage all unique values
export const useUniqueValues = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: UNIQUE_VALUES_KEYS.all,
    queryFn: async () => {
      try {
        // First, try to get data from IndexedDB
        const cachedData = await dbManager.getAllUniqueValues();

        // Check if we have all required data
        const requiredTypes = [
          'names',
          'gifts',
          'relations',
          'cities',
          'workTypes',
        ];
        const hasAllData = requiredTypes.every(
          (type) => cachedData[type] && cachedData[type].length > 0
        );

        if (hasAllData) {
          console.log('Loading unique values from IndexedDB');
          return cachedData;
        }

        // If not in cache or incomplete, fetch from API
        console.log('Fetching unique values from API');
        const apiData = await uniqueValuesAPI.getAllUniqueValues();

        // Store each type in IndexedDB
        await Promise.all([
          dbManager.setUniqueValues('names', apiData.names),
          dbManager.setUniqueValues('gifts', apiData.gifts),
          dbManager.setUniqueValues('relations', apiData.relations),
          dbManager.setUniqueValues('cities', apiData.cities),
          dbManager.setUniqueValues('workTypes', apiData.workTypes),
        ]);

        return apiData;
      } catch (error) {
        console.error('Error fetching unique values:', error);
        // Fallback to cached data if API fails
        const cachedData = await dbManager.getAllUniqueValues();
        if (Object.keys(cachedData).length > 0) {
          return cachedData;
        }
        throw error;
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnWindowFocus: false,
    retry: (failureCount) => {
      // Don't retry if we're offline
      return navigator.onLine && failureCount < 2;
    },
  });

  // Mutation to add new unique value
  const addUniqueValueMutation = useMutation({
    mutationFn: async ({ type, value }) => {
      // Add to IndexedDB
      const updatedData = await dbManager.addUniqueValue(type, value);
      return { type, data: updatedData };
    },
    onSuccess: ({ type, data }) => {
      // Update the query cache
      queryClient.setQueryData(UNIQUE_VALUES_KEYS.all, (oldData) => ({
        ...oldData,
        [type]: data,
      }));
    },
  });

  // Mutation to refresh data from API
  const refreshDataMutation = useMutation({
    mutationFn: async () => {
      const apiData = await uniqueValuesAPI.getAllUniqueValues();

      // Update IndexedDB
      await Promise.all([
        dbManager.setUniqueValues('names', apiData.names),
        dbManager.setUniqueValues('gifts', apiData.gifts),
        dbManager.setUniqueValues('relations', apiData.relations),
        dbManager.setUniqueValues('cities', apiData.cities),
        dbManager.setUniqueValues('workTypes', apiData.workTypes),
      ]);

      return apiData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(UNIQUE_VALUES_KEYS.all, data);
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    addUniqueValue: addUniqueValueMutation.mutate,
    refreshData: refreshDataMutation.mutate,
    isAddingValue: addUniqueValueMutation.isLoading,
    isRefreshing: refreshDataMutation.isLoading,
  };
};

// Individual hooks for specific types
export const useUniqueNames = () => {
  const { data } = useUniqueValues();
  return data?.names || [];
};

export const useUniqueGifts = () => {
  const { data } = useUniqueValues();
  return data?.gifts || [];
};

export const useUniqueRelations = () => {
  const { data } = useUniqueValues();
  return data?.relations || [];
};

export const useUniqueCities = () => {
  const { data } = useUniqueValues();
  return data?.cities || [];
};

export const useUniqueWorkTypes = () => {
  const { data } = useUniqueValues();
  return data?.workTypes || [];
};
