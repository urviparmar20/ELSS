import api from './api';

interface ServiceReportsParams {
  userId: number;
  page: number;
  token: string;  
}

export const pastSRListApi = async ({
  userId,
  page,
  token,
}: ServiceReportsParams) => {
  try {
    const response = await api.post(
      '/past/service-report',
      { user_id: userId, page },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;

  } catch (error) {
    console.log('API ERROR past service report:', error);
    throw error;
  }
};
