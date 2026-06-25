import { OnOffHireStoreParams } from "../types/onOffHire";

export const buildOnOffHireFormData = (
  params: Omit<OnOffHireStoreParams, "token">
) => {
  const formData = new FormData();

  formData.append("technician", String(params.userId));

  formData.append("company_name", params.company_name);
  formData.append("company_address", params.address);
  formData.append("location", params.location);
  formData.append("contact_person", params.contactPerson);
  formData.append("contact_number", params.contactNo);
  formData.append("date", params.date);

  formData.append("equipment_type", params.equipmentType);
  formData.append("equipment_id", params.equipmentId);
  formData.append("hr_meter", params.hourMeter);
  formData.append("serial_no", params.mcSerialNo);


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

  formData.append("job_descriptions", params.remarks);

  formData.append("on_hire_technician", params.technician);
  if (params.signatureTechnician) {
    formData.append("on_hire_signature_technician", {
      uri: params.signatureTechnician.uri,
      name: params.signatureTechnician.name,
      type: params.signatureTechnician.type,
    } as any);
  }

  formData.append("on_hire_accepted_by", params.acceptedBy);
  if (params.signatureAcceptedBy) {
    formData.append("on_hire_signature_accepted_by", {
      uri: params.signatureAcceptedBy.uri,
      name: params.signatureAcceptedBy.name,
      type: params.signatureAcceptedBy.type,
    } as any);
  }
  formData.append("on_hire_date", params.hireDate);
  formData.append("nric", params.nricWpPs);
  formData.append("on_hire_contractor_name", params.contractorName);

  //need to remove in future
  formData.append("on_hire_client_name", "jimmy");
  formData.append("on_hire_client_tel_no", "987654321");

  return formData;
};