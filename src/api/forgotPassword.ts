import api from './api';

export const forgotPassword = async ({
  email
}: {
  email: string;
}) => {
  const response = await api.post('/password/forgot-password', {
    email
  });

  return response.data;
};
