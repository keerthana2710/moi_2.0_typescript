import axiosInstance from '@/utils/AxiosInstance';

export const uniqueValuesAPI = {
  getUniqueNames: async () => {
    const response = await axiosInstance.get('/payers/unique/names');
    return response.data;
  },

  getUniqueGifts: async () => {
    const response = await axiosInstance.get('/payers/unique/gifts');
    return response.data;
  },

  getUniqueRelations: async () => {
    const response = await axiosInstance.get('/payers/unique/relations');
    return response.data;
  },

  getUniqueCities: async () => {
    const response = await axiosInstance.get('/payers/unique/cities');
    return response.data;
  },

  getUniqueWorkTypes: async () => {
    const response = await axiosInstance.get('/payers/unique/works');
    return response.data;
  },

  // Fetch all unique values in one go
  getAllUniqueValues: async () => {
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
