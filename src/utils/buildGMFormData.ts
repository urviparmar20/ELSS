import { GMStoreParams } from "../types/maintenance";

export const buildGMFormData = (
  params: Omit<GMStoreParams, "token">
) => {
  const formData = new FormData();

  formData.append("maintenance_id", String(params.maintenance_id))
  formData.append("company_name", params.company_name);
  // formData.append("email", params.email);
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
  // params.services.forEach((service, index) => {
  //   formData.append(`services[${index}]`, service);
  // });

  if (params.services?.length > 0) {
    params.services.forEach((service, index) => {
      formData.append(`services[${index}]`, service);
    });
  }
  formData.append("technician", params.technician);
  formData.append("client_name", params.client_name);
  formData.append("client_tel_no", params.client_tel_no);
  formData.append("service_technician", params.service_technician);


  params.date_list.forEach((d, i) =>
    formData.append(`date_list[date${i + 1}]`, d)
  );

  params.time_list.start.forEach((t, i) =>
    formData.append(`time_list[start_time${i + 1}]`, t)
  );
  params.time_list.end.forEach((t, i) =>
    formData.append(`time_list[end_time${i + 1}]`, t)
  );

  formData.append("job_descriptions", params.remarks);

  Object.entries(params.servicing_parts_lubricants_list).forEach(([k, v]) =>
    formData.append(`servicing_parts_lubricants_list[${k}]`, v)
  );

  formData.append("other_parts_supplied_list", params.other_parts_supplied_list);

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

  if (params.signature_supervisor) {
    formData.append("signature_supervisor", {
      uri: params.signature_supervisor.uri,
      name: params.signature_supervisor.name,
      type: params.signature_supervisor.type,
    } as any);
  }

  formData.append("service_department", params.service_department);
  formData.append("current_date", params.current_date);
  formData.append("is_pending", params.is_pending);
  
  // formData.append(
  //   "operation_check_list[]",
  //   JSON.stringify(params.operation_check_list)
  // );
  if (
    params.operation_check_list &&
    Object.keys(params.operation_check_list).length > 0
  ) {
    formData.append(
      "operation_check_list[]",
      JSON.stringify(params.operation_check_list)
    );
  }
  
  if (params.checklist && Array.isArray(params.checklist)) {
    params.checklist.forEach((item, index) => {
      formData.append(
        `checklist[${index}][activity_id]`,
        String(item.activity_id)
      );
  
      formData.append(
        `checklist[${index}][status]`,
        String(item.status)
      );
  
      formData.append(
        `checklist[${index}][remark]`,
        item.remark || ""
      );
    });
  }
  

  formData.append("is_otp_verified", params.is_otp_verified);
  params.frequency &&
  formData.append("frequency", params.frequency);


  return formData;
};
