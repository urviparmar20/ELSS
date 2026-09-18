import api from './api';
import { isCompanyV2Enabled } from '../utils/appVersion';

export const getCompaniesApi = async (
  userId: string,
  token: string
) => {
  try {
    const endpoint = isCompanyV2Enabled()
      ? "/get-companies-updated"
      : "/get-companies";

    const response = await api.post(
      endpoint,
      {
        user_id: userId,
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.log("API ERROR", error);
    console.log("STATUS", error.response?.status);
    console.log("DATA", error.response?.data);
    throw error;
  }
};