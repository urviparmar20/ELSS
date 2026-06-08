import api from './api';

interface BDCParams {
  userId: number;
  token: string;  
}

export const bDCListApi = async ({
  userId,
  token
}: BDCParams) => {
  try {
    const response = await api.post(
      '/breakdown-checkouts/list',
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
