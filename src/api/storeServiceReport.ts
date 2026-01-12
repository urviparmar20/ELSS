// /src/api/storeServiceReport.ts
import api from "./api";
import { AxiosRequestConfig } from "axios";
import { 
  CHECKLIST_GENERAL, 
  CHECKLIST_FORKLIFT_LOADER, 
  CHECKLIST_AERIAL_PLATFORM, 
} from "../constants/checklists";

export interface ServiceReportStoreParams {
  token: string;

  report_id: number;
  user_id: number;
  company_name: string;
  company_address: string;
  job_no: string;
  hr_meter: string;
  equipment_type: string;
  equipment_id: string;
  serial_no: string;
  mc: string;

  date_list: string[]; // date1..4
  time_list: {
    start: string[]; // start_time1..4
    end: string[];   // end_time1..4
  };

  operation_check_list: {
    general_list: Record<string, boolean>;
    forklift_list: Record<string, boolean>;
    aerial_platform_list: Record<string, boolean>;
  };

  servicing_parts_lubricants_list: Record<string, string>;
  other_parts_supplied_list: string[];

  description_status_list: {
    checking: boolean;
    servicing: boolean;
    repair: boolean;
  };

  description: string;
  // technicianSign: File | Blob;
  // clientSign: File | Blob;
  signature_technician: File | Blob;
  signature_client: File | Blob;
  filled_date: string;
  is_chargable: string;
  client_name: string;
  client_tel_no: string;

  images: (File | Blob)[];

}

export const storeServiceReportApi = async (params: ServiceReportStoreParams) => {
  try {

    const checklistGroupMap: Record<
    string,
    "general_list" | "forklift_list" | "aerial_platform_list"
    > = Object.fromEntries([
      ...CHECKLIST_GENERAL.map(i => [i.key, "general_list"]),
      ...CHECKLIST_FORKLIFT_LOADER.map(i => [i.key, "forklift_list"]),
      ...CHECKLIST_AERIAL_PLATFORM.map(i => [i.key, "aerial_platform_list"]),
    ]);

    const formData = new FormData();

    // formData.append("report_id", String(params.report_id));
    formData.append("user_id", String(params.user_id));
    formData.append("company_name", params.company_name);
    formData.append("company_address", params.company_address);
    formData.append("job_no", params.job_no);
    formData.append("hr_meter", params.hr_meter);
    formData.append("equipment_type", params.equipment_type);
    formData.append("equipment_id", params.equipment_id);
    formData.append("serial_no", params.serial_no);
    formData.append("mc", params.mc);

    // Dates
    params.date_list.forEach((d, i) => {
      formData.append(`date_list[date${i + 1}]`, d);
    });

    // Times
    params.time_list.start.forEach((t, i) => {
      formData.append(`time_list[start_time${i + 1}]`, t);
    });
    params.time_list.end.forEach((t, i) => {
      formData.append(`time_list[end_time${i + 1}]`, t);
    });

    // Operation checklist
    // Object.entries(params.operation_check_list.general_list).forEach(([key, val]) => {
    //   formData.append(`operation_check_list[general_list][${key}]`, String(val));
    // });
    // Object.entries(params.operation_check_list.forklift_list).forEach(([key, val]) => {
    //   formData.append(`operation_check_list[forklift_list][${key}]`, String(val));
    // });
    // Object.entries(params.operation_check_list.aerial_platform_list).forEach(([key, val]) => {
    //   formData.append(`operation_check_list[aerial_platform_list][${key}]`, String(val));
    // });
    // ✅ OPERATION CHECKLIST (POSTMAN EXACT FORMAT)
    Object.entries(params.operation_check_list).forEach(([key, value]: any) => {
      const group = checklistGroupMap[key];
      if (group) {
        formData.append(
          `operation_check_list[${group}][${key}]`,
          String(value)
        );
      }
    });

    // Parts & lubricants
    Object.entries(params.servicing_parts_lubricants_list).forEach(([key, val]) => {
      formData.append(`servicing_parts_lubricants_list[${key}]`, val);
    });

    params.other_parts_supplied_list.forEach((val) => {
      formData.append("other_parts_supplied_list[]", val);
    });

    // Description status
    formData.append("description_status_list[checking]", String(params.description_status_list.checking));
    formData.append("description_status_list[servicing]", String(params.description_status_list.servicing));
    formData.append("description_status_list[repair]", String(params.description_status_list.repair));

    formData.append("description", params.description);

    // Images as File | Blob
    if (params.images && params.images.length > 0) {
      params.images.forEach((file, index) => {
        const fileName = (file as any).name || `image_${index}.jpg`; // fallback name
        formData.append("images[]", file, fileName);
      });
    }

    // Signatures
    if (params.signature_technician) {
      formData.append(
        "signature_technician",
        params.signature_technician,
        "technician-signature.svg"
      );
    }
    
    if (params.signature_client) {
      formData.append(
        "signature_client",
        params.signature_client,
        "client-signature.svg"
      );
    }

    formData.append("filled_date", params.filled_date);
    formData.append("is_chargable", params.is_chargable);
    formData.append("client_name", params.client_name);
    formData.append("client_tel_no", params.client_tel_no);

    
    formData.forEach((value, key) => console.log('formData',key, value));

    const config: AxiosRequestConfig = {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${params.token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await api.post("service-report/store", formData, config);
    return response.data;

  } catch (err) {
    console.log("Service report store ERROR:", err);
    throw err;
  }
};
