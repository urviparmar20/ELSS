import api from './api';

interface OnOffHireParams {
  userId: number;
  token: string;  
}

export const pastOnOffHireListApi = async ({
  userId,
  token,
}: OnOffHireParams) => {
  try {
    const response = await api.post(
      '/past/on-off-hire',
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
