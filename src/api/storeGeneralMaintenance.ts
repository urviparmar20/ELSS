// /src/api/generalMaintenance.ts
import api from "./api";
import { AxiosRequestConfig } from "axios";

export interface GeneralMaintenanceStoreParams {
  maintenance_id: number;
  company_name: string;
  email: string;
  address: string;
  contact_person: string;
  contact_no: string;
  equipment_type: string;
  equipment_id: string;
  job_no: string;
  hr_meter: string;
  mc: string;
  serial_no: string;
  remarks: string;
  answer: Record<string, string>;
  technician: string;
  client_name: string;
  client_tel_no: string;
  service_technician: string;
  date_list: string[]; // up to 4 dates
  time_list: { start: string[]; end: string[] }; // arrays of start/end times
  job_descriptions: string;
  servicing_parts_lubricants_list: Record<string, string>;
  other_parts_supplied_list: string;
  signature_technician: File | Blob;
  signature_supervisor: File | Blob;
  service_department: string;
  current_date: string;
  is_pending: string;
  operation_check_list: Array<Record<string, boolean>>;
  is_otp_verified: string;
  token: string;
}

export const storeGeneralMaintenanceApi = async (params: GeneralMaintenanceStoreParams) => {
  try {
    const formData = new FormData();

    formData.append("maintenance_id", String(params.maintenance_id));
    formData.append("company_name", params.company_name);
    formData.append("email", params.email);
    formData.append("address", params.address);
    formData.append("contact_person", params.contact_person);
    formData.append("contact_no", params.contact_no);
    formData.append("equipment_type", params.equipment_type);
    formData.append("equipment_id", params.equipment_id);
    formData.append("job_no", params.job_no);
    formData.append("hr_meter", params.hr_meter);
    formData.append("mc", params.mc);
    formData.append("serial_no", params.serial_no);
    formData.append("remarks", params.remarks);

    // Answer map
    Object.entries(params.answer).forEach(([key, value]) => {
      formData.append(`answer[${key}]`, value);
    });

    formData.append("technician", params.technician);
    formData.append("client_name", params.client_name);
    formData.append("client_tel_no", params.client_tel_no);
    formData.append("service_technician", params.service_technician);

    // Dates
    params.date_list.forEach((date, idx) => {
      formData.append(`date_list[date${idx + 1}]`, date);
    });

    // Times
    params.time_list.start.forEach((time, idx) => {
      formData.append(`time_list[start_time${idx + 1}]`, time);
    });
    params.time_list.end.forEach((time, idx) => {
      formData.append(`time_list[end_time${idx + 1}]`, time);
    });

    formData.append("job_descriptions", params.job_descriptions);

    // Parts & lubricants
    Object.entries(params.servicing_parts_lubricants_list).forEach(([key, value]) => {
      formData.append(`servicing_parts_lubricants_list[${key}]`, value);
    });

    formData.append("other_parts_supplied_list", params.other_parts_supplied_list);

    // Signatures
    formData.append("signature_technician", params.signature_technician);
    formData.append("signature_supervisor", params.signature_supervisor);

    formData.append("service_department", params.service_department);
    formData.append("current_date", params.current_date);
    formData.append("is_pending", params.is_pending);

    // Operation checklist
    params.operation_check_list.forEach((item) => {
      formData.append("operation_check_list[]", JSON.stringify(item));
    });

    formData.append("is_otp_verified", params.is_otp_verified);

    const config: AxiosRequestConfig = {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${params.token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await api.post("/general-maintenance/store", formData, config);

    return response.data;

  } catch (error) {
    console.error("API ERROR (store general maintenance):", error);
    throw error;
  }
};
