import api from "./api";

interface ServiceReportParams {
  userId: number;
  page: number;
  token: string;
}

export const serviceReportsListApi = async ({
  userId,
  page,
  token,
}: ServiceReportParams) => {
  
  try {
    const response = await api.post(
      "/service-reports",
      { user_id: userId, page },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error) {
    console.log("API ERROR (service reports):", error);
    throw error;
  }
};
