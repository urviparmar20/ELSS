// import api from "./api";

// interface GeneralChecklistParams {
//   equipmentTypeId: string;
//   token: string;
// }

// export const getGeneralChecklistApi = async ({
//   equipmentTypeId,
//   token,
// }: GeneralChecklistParams) => {
//   try {
//     const response = await api.post(
//       "/general-maintenances-checklist",
//       { equipment_type_id: equipmentTypeId },
//       {
//         headers: {
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data;

//   } 
//   // catch (error) {
//   //   console.log("API ERROR (general-maintenance-checklist):", error);
//   //   throw error;
//   // }
//   catch (error: any) {
//     console.log(
//       "API ERROR (general-maintenance-checklist):",
//       error?.response?.data
//     );
  
//     // throw backend response so React Query can access it
//     throw error?.response?.data;
//   }
  
// };


// api/generalChecklist.ts

import axios from "axios";
import api from "./api";

import { EQUIPMENT_TYPES } from "../constants/equipment";

interface GeneralChecklistParams {
  equipmentTypeId: string;
  frequency?: string;
  token: string;
}

// API V2 ONLY FOR AP & FORKLIFT
const apiV2 = axios.create({
  baseURL: "https://elss.devwebproject.com/api/v2",
  // baseURL: "https://alpineelss.seatrium.com/api/v2",
  timeout: 60000,
});

export const getGeneralChecklistApi = async ({
  equipmentTypeId,
  frequency,
  token,
}: GeneralChecklistParams) => {
  try {

    // ==============================
    // MAP EQUIPMENT TYPES
    // ==============================
    const equipmentTypeMap: Record<string, string> = {
      "3": "AP",
      "11": "FORKLIFT",
    };

    // ==============================
    // AP / FORKLIFT CHECK
    // ==============================
    const isAPorForklift =
      equipmentTypeId === EQUIPMENT_TYPES.AP ||
      equipmentTypeId === EQUIPMENT_TYPES.FORKLIFT;

    // ==============================
    // REQUEST BODY
    // ==============================
    const body: any = {
      equipment_type_id: isAPorForklift
        ? equipmentTypeMap[equipmentTypeId]
        : equipmentTypeId,
    };

    // frequency only for AP/FORKLIFT
    if (isAPorForklift && frequency) {
      body.frequency = frequency.toLowerCase();
    }

    // ==============================
    // SELECT API
    // ==============================
    const selectedApi = isAPorForklift
      ? apiV2
      : api;

    // ==============================
    // API CALL
    // ==============================
    const response = await selectedApi.post(
      "/general-maintenances-checklist",
      body,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error: any) {

    console.log(
      "API ERROR (general-maintenance-checklist):",
      error?.response?.data
    );

    throw error?.response?.data;
  }
};