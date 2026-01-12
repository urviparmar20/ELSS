import api from "./api";

interface EquipmentTypeParams {
  userId: number;
  token: string;
}

export const getEquipmentTypeListApi = async ({ userId, token }: EquipmentTypeParams) => {
  try {
    const response = await api.post(
      "/get-equipment-type-list",
      { user_id: userId },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;

  } catch (error) {
    console.log("API ERROR (equipment type):", error);
    throw error;
  }
};
