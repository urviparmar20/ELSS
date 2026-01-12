import api from "./api";

interface GeneralChecklistParams {
  equipmentTypeId: string;
  token: string;
}

export const getGeneralChecklistApi = async ({
  equipmentTypeId,
  token,
}: GeneralChecklistParams) => {
  try {
    const response = await api.post(
      "/general-maintenances-checklist",
      { equipment_type_id: equipmentTypeId },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error) {
    console.log("API ERROR (general-maintenance-checklist):", error);
    throw error;
  }
};
