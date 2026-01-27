import api from './api';

interface GeneralMaintenanceParams {
  userId: number;
  token: string;  
}

export const pastGMListApi = async ({
  userId,
  token,
}: GeneralMaintenanceParams) => {
  try {
    const response = await api.post(
      '/past/general-maintenances',
      { user_id: userId },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;

  } catch (error) {
    console.log('API ERROR:', error);
    throw error;
  }
};
