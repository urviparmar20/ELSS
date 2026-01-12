import api from './api';

interface GeneralMaintenanceParams {
  userId: number;
  page: number;
  token: string;  
}

export const generalMaintenanceListApi = async ({
  userId,
  page,
  token,
}: GeneralMaintenanceParams) => {
  try {
    const response = await api.post(
      '/general-maintenances',
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
    console.log('API ERROR:', error);
    throw error;
  }
};
