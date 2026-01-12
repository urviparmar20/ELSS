import api from './api';
import qs from 'qs';

export const getCompaniesApi = async (userId: string, token: string) => {
  try {
    const response = await api.post(
      '/get-companies',
      qs.stringify({
        user_id: userId,
      }),
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return response.data;

  } catch (error) {
    console.log('Companies API ERROR:', error);
    throw error;
  }
};
