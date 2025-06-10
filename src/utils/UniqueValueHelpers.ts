import { QueryClient } from '@tanstack/react-query';
import { dbManager } from '@/services/IndexedDBManager';
import { uniqueValuesAPI } from '@/services/UniqueValuesApi';

// Helper to sync data when user creates new entries
export const syncUniqueValue = async (
  type: string, 
  value: string, 
  queryClient: QueryClient
): Promise<void> => {
  try {
    // Add to IndexedDB immediately
    await dbManager.addUniqueValue(type, value);

    // Update React Query cache
    queryClient.setQueryData(['uniqueValues'], (oldData: any) => {
      if (!oldData) return oldData;

      const currentValues = oldData[type] || [];
      if (!currentValues.includes(value)) {
        return {
          ...oldData,
          [type]: [...currentValues, value],
        };
      }
      return oldData;
    });

    console.log(`Successfully synced ${type}: ${value}`);
  } catch (error) {
    console.error(`Error syncing ${type}:`, error);
    throw error;
  }
};

export const valueExists = (list: string[], value: string): boolean => {
  return list.some(
    (item) => item.toLowerCase().trim() === value.toLowerCase().trim()
  );
};

// Helper to get all unique values from a specific type
export const getUniqueValuesByType = async (type: string): Promise<string[]> => {
  try {
    return await dbManager.getUniqueValues(type);
  } catch (error) {
    console.error(`Error getting ${type} values:`, error);
    return [];
  }
};

export const forceRefreshUniqueValues = async (queryClient: QueryClient): Promise<any> => {
  try {
    const apiData = await uniqueValuesAPI.getAllUniqueValues();

    // Update IndexedDB
    await Promise.all([
      dbManager.setUniqueValues('names', apiData.names),
      dbManager.setUniqueValues('gifts', apiData.gifts),
      dbManager.setUniqueValues('relations', apiData.relations),
      dbManager.setUniqueValues('cities', apiData.cities),
      dbManager.setUniqueValues('workTypes', apiData.workTypes),
    ]);

    // Update React Query cache
    queryClient.setQueryData(['uniqueValues'], apiData);

    return apiData;
  } catch (error) {
    console.error('Error force refreshing data:', error);
    throw error;
  }
};

// Helper to clear all cached data (useful for logout)
export const clearAllUniqueValues = async (queryClient: QueryClient): Promise<void> => {
  try {
    await dbManager.clearAllData();
    queryClient.setQueryData(['uniqueValues'], null);
    queryClient.invalidateQueries({ queryKey: ['uniqueValues'] });
    console.log('Cleared all unique values cache');
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
};

// Helper to export data (for backup or debugging)
export const exportUniqueValues = async (): Promise<void> => {
  try {
    const data = await dbManager.getAllUniqueValues();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `unique-values-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Exported unique values data');
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

// Helper to import data (for restore or migration)
export const importUniqueValues = async (
  file: File, 
  queryClient: QueryClient
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        // Validate data structure
        const requiredTypes = [
          'names',
          'gifts',
          'relations',
          'cities',
          'workTypes',
        ];
        const isValid = requiredTypes.every((type) =>
          Array.isArray(data[type])
        );

        if (!isValid) {
          throw new Error('Invalid data format');
        }

        // Store in IndexedDB
        await Promise.all([
          dbManager.setUniqueValues('names', data.names),
          dbManager.setUniqueValues('gifts', data.gifts),
          dbManager.setUniqueValues('relations', data.relations),
          dbManager.setUniqueValues('cities', data.cities),
          dbManager.setUniqueValues('workTypes', data.workTypes),
        ]);

        // Update React Query cache
        queryClient.setQueryData(['uniqueValues'], data);

        console.log('Imported unique values data');
        resolve(data);
      } catch (error) {
        console.error('Error importing data:', error);
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

// Network status helper
export const isOnline = (): boolean => navigator.onLine;

// Helper to merge new API data with existing local data
export const mergeUniqueValues = (
  existingData: Record<string, string[]>, 
  newApiData: Record<string, string[]>
): Record<string, string[]> => {
  const merged: Record<string, string[]> = {};

  Object.keys(newApiData).forEach((type) => {
    const existing = existingData[type] || [];
    const newValues = newApiData[type] || [];

    // Combine and deduplicate (case-insensitive)
    const combined = [...existing];
    newValues.forEach((value) => {
      if (!valueExists(combined, value)) {
        combined.push(value);
      }
    });

    merged[type] = combined.sort();
  });

  return merged;
};