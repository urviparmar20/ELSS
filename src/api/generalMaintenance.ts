import api from './api';

interface GeneralMaintenanceParams {
  userId: number;
  token: string;  
}

export const generalMaintenanceListApi = async ({
  userId,
  token,
}: GeneralMaintenanceParams) => {
  try {
    const response = await api.post(
      '/general-maintenances',
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
