import { OnOffHireStoreParams } from "../types/onOffHire";

export const buildOnOffHireFormData = (
  params: Omit<OnOffHireStoreParams, "token">
) => {
  const formData = new FormData();
  

  formData.append("user_id", String(params.userId));
  if (params.hireId != "0") {
    formData.append("hire_id", String(params.hireId));
  }
  if (params.company_name) {
    formData.append("company_name", params.company_name || "25");
  }
  
  if (params.address) {
    formData.append("company_address", params.address);
  }
  
  if (params.location) {
    formData.append("location", params.location);
  }
  formData.append("contact_person_name", params.contactPerson || "john");
  formData.append("contact_no", params.contactNo|| "98765432");
  formData.append("date", params.date);

  if (params.equipmentType) {
    formData.append("equipment_type_id", params.equipmentType);
  }
  
  if (params.equipmentId) {
    formData.append("equipment_id", params.equipmentId);
  }
  formData.append("hr_meter", params.hourMeter);
  if (params.mcSerialNo) {
    formData.append("serial_no", params.mcSerialNo);
  }


  if(params.services)
  {
    Object.entries(params.services).forEach(([key, value]) => {
      formData.append(
        `condition_list[${key}]`,
        value ? "true" : "false"
      );
    });
  }
  
  if (params.checklist) {
    params.checklist.forEach((item, index) => {
      formData.append(
        `job_list[${index}][description]`,
        item.description
      );
  
      formData.append(
        `job_list[${index}][check]`,
        item.check ? "true" : "false"
      );
  
      formData.append(
        `job_list[${index}][remarks]`,
        item.remarks || ""
      );
    });
  }

  if(params.images){
    params.images.forEach((img, i) => {
      formData.append("images[]", {
        uri: img.uri,
        name: img.name ?? `image_${i}.jpg`,
        type: img.type ?? "image/jpeg",
      } as any);
    });
  }

  formData.append("remarks", params.remarks);

  formData.append("technician", params.technician);
  if (params.signatureTechnician) {
    formData.append("signature_technician", {
      uri: params.signatureTechnician.uri,
      name: params.signatureTechnician.name,
      type: params.signatureTechnician.type,
    } as any);
  }

  formData.append("accepted_by", params.acceptedBy);
  if (params.signatureAcceptedBy) {
    formData.append("signature_accepted_by", {
      uri: params.signatureAcceptedBy.uri,
      name: params.signatureAcceptedBy.name,
      type: params.signatureAcceptedBy.type,
    } as any);
  }
  formData.append("on_hire_date", params.hireDate);
  formData.append("work_permit", params.nricWpPs);
  formData.append("contractor_name", params.contractorName);

  return formData;
};