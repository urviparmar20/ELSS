import apiV2 from "./apiV2";

interface SendInReturnParams {
  equipmentTypeId: string;
  token: string;
}

export const getSendInReturnChecklistApi = async ({
  equipmentTypeId,
  token,
}: SendInReturnParams) => {
  try {
    const response = await apiV2.post(
      "/send-in-return/checklist",
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
    console.log("API ERROR (get-equipments-by-type):", error);
    throw error;
  }
};
