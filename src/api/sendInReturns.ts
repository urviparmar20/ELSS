import apiV2 from "./apiV2";

interface SendInReturnParams {
  userId: number;
  page: number;
  token: string;
}

export const sendInReturnsListApi = async ({
  userId,
  page,
  token,
}: SendInReturnParams) => {
  
  try {
    const response = await apiV2.post(
      "/send-in-return/list",
      { user_id: userId,
        //  page
      },
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
