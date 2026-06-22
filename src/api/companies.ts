import api from './api';
import qs from 'qs';
import { isCompanyV2Enabled } from '../utils/appVersion';

export const getCompaniesApi = async (
  userId: string,
  token: string
) => {
  const endpoint = isCompanyV2Enabled()
    ? '/get-companies-updated'
    : '/get-companies';

  const response = await api.post(
    endpoint,
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
};