import api from "./api";

interface EquipmentListByTypeParams {
  equipmentTypeId: string;   // equipment_type_id
  token: string;
}

export const getEquipmentListByTypeApi = async ({
  equipmentTypeId,
  token,
}: EquipmentListByTypeParams) => {
  try {
    const response = await api.post(
      "/get-equipments-by-type",
      {
        equipment_type_id: equipmentTypeId,
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
