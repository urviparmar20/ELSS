import apiV2 from "./apiV2";

interface OnOffHireParams {
  userId: number;
  page: number;
  token: string;
}

export const onOffHireListApi = async ({
  userId,
  page,
  token,
}: OnOffHireParams) => {
  
  try {

    const response = await apiV2.post(
      "/hire/list",
      { user_id: userId, page },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error: any) {
    console.log("API ERROR (on-off-hires-list):", error);
    throw error;
  }
};
