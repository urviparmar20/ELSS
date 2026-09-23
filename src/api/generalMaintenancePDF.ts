import api from './api';

interface GeneralMaintenancePDFParams {
  gmId: number;
  userId: number;
  token: string;  
}

export const generalMaintenancePDFApi = async ({
  gmId,
  userId,
  token,
}: GeneralMaintenancePDFParams) => {
  try {
    const response = await api.post(
      '/general-maintenance/checklist/download',
      { gmId, userId },
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
