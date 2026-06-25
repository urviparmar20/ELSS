import api from "./api";

interface OnOffHireCategoryParams {
  equipmentTypeId: string;
  token: string;
}

export const getOnOffHireCategoryApi = async ({
  equipmentTypeId,
  token,
}: OnOffHireCategoryParams) => {
  try {
    const response = await api.post(
      "/on-off-hires-category",
      {
        equipment_type: equipmentTypeId,
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
    console.log("API ERROR (on-off-hires-category):", error);
    throw error;
  }
};
