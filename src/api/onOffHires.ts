import api from "./api";

interface OnOffHireParams {
  userId: number;
  token: string;
}

export const onOffHireListApi = async ({
  userId,
  token,
}: OnOffHireParams) => {
  
  try {
    console.log('userId',userId, token);

    const response = await api.post(
      "/on-hires",
      { user_id: userId },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error: any) {
    console.log("STATUS:", error?.response?.status);
    console.log("DATA:", error?.response?.data);
    console.log("HEADERS:", error?.response?.headers);
    throw error;
  }
};
