import axiosInstance from '@/utils/AxiosInstance';
import { ApiResponse } from '@/types/api';

interface UniqueValuesData {
  names: string[];
  gifts: string[];
  relations: string[];
  cities: string[];
  workTypes: string[];
}

export const uniqueValuesAPI = {
  getUniqueNames: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosInstance.get('/payers/unique/names');
    return response.data;
  },

  getUniqueGifts: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosInstance.get('/payers/unique/gifts');
    return response.data;
  },

  getUniqueRelations: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosInstance.get('/payers/unique/relations');
    return response.data;
  },

  getUniqueCities: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosInstance.get('/payers/unique/cities');
    return response.data;
  },

  getUniqueWorkTypes: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosInstance.get('/payers/unique/works');
    return response.data;
  },

  // Fetch all unique values in one go
  getAllUniqueValues: async (): Promise<UniqueValuesData> => {
    const [names, gifts, relations, cities, workTypes] = await Promise.all([
      uniqueValuesAPI.getUniqueNames(),
      uniqueValuesAPI.getUniqueGifts(),
      uniqueValuesAPI.getUniqueRelations(),
      uniqueValuesAPI.getUniqueCities(),
      uniqueValuesAPI.getUniqueWorkTypes(),
    ]);

    return {
      names: names.data,
      gifts: gifts.data,
      relations: relations.data,
      cities: cities.data,
      workTypes: workTypes.data,
    };
  },
};