import { ServiceReportStoreParams } from "../types/serviceReport";

export const buildServiceReportFormData = (
  params: Omit<ServiceReportStoreParams, "token">
) => {
  const formData = new FormData();

  formData.append("report_id", String(params.report_id))
  formData.append("user_id", String(params.user_id));
  formData.append("company_name", params.company_name);
  formData.append("company_address", params.company_address);
  formData.append("job_no", params.job_no);
  formData.append("hr_meter", params.hr_meter);
  formData.append("equipment_type", params.equipment_type);
  formData.append("equipment_id", params.equipment_id);
  formData.append("serial_no", params.serial_no);
  formData.append("mc", params.mc);

  params.date_list.forEach((d, i) =>
    formData.append(`date_list[date${i + 1}]`, d)
  );

  params.time_list.start.forEach((t, i) =>
    formData.append(`time_list[start_time${i + 1}]`, t)
  );
  params.time_list.end.forEach((t, i) =>
    formData.append(`time_list[end_time${i + 1}]`, t)
  );

  Object.entries(params.operation_check_list).forEach(([group, items]) => {
    Object.entries(items).forEach(([key, value]) => {
      formData.append(
        `operation_check_list[${group}][${key}]`,
        String(value)
      );
    });
  });

  Object.entries(params.servicing_parts_lubricants_list).forEach(([k, v]) =>
    formData.append(`servicing_parts_lubricants_list[${k}]`, v)
  );

  params.other_parts_supplied_list.forEach(v =>
    formData.append("other_parts_supplied_list[]", v)
  );

  formData.append(
    "description_status_list[checking]",
    String(params.description_status_list.checking)
  );
  formData.append(
    "description_status_list[servicing]",
    String(params.description_status_list.servicing)
  );
  formData.append(
    "description_status_list[repair]",
    String(params.description_status_list.repair)
  );

  formData.append("description", params.description);

  if(params.images){
    params.images.forEach((img, i) => {
      formData.append("images[]", {
        uri: img.uri,
        name: img.name ?? `image_${i}.jpg`,
        type: img.type ?? "image/jpeg",
      } as any);
    });
  }

  if (params.signature_technician) {
    formData.append("signature_technician", {
      uri: params.signature_technician.uri,
      name: params.signature_technician.name,
      type: params.signature_technician.type,
    } as any);
  }

  if (params.signature_client) {
    formData.append("signature_client", {
      uri: params.signature_client.uri,
      name: params.signature_client.name,
      type: params.signature_client.type,
    } as any);
  }

  formData.append("filled_date", params.filled_date);
  formData.append("is_chargable", params.is_chargable);
  formData.append("client_name", params.client_name);
  formData.append("client_tel_no", params.client_tel_no);

  return formData;
};
