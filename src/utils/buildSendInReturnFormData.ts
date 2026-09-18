import { SendInReturnStoreParams } from "../types/sendInReturn";

export const buildSendInReturnFormData = (
  params: Omit<SendInReturnStoreParams, "token">
) => {
  const formData = new FormData();
  
  formData.append("user_id", String(params.userId));
  if (params.sendInId != "0") {
    formData.append("send_in_id", String(params.sendInId));
  }

  if (params.equipmentType) {
    formData.append("equipment_type_id", params.equipmentType);
  }
  
  if (params.equipmentId) {
    formData.append("equipment_id", params.equipmentId);
  }
  formData.append("brand", params.brand);
  formData.append("model_no", params.modelNo);
  if (params.serialNo) {
    formData.append("serial_no", params.serialNo);
  }
  formData.append("hour_meter", params.hourMeter);
  formData.append("complaints", params.complaints);
  if (params.isReturn) {
    formData.append("return_date", params.date);
    formData.append("return_time", params.time);
  } else {
    formData.append("send_in_date", params.date);
    formData.append("send_in_time", params.time);
  }


  if(params.checklist)
  {
    Object.entries(params.checklist).forEach(([id, value], index) => {
      const item = params.isReturn 
        ? value.onReturn 
        : value.sendIn;

      let status = "";

        
      if (!item) return;

      formData.append(
        `checklist[${index + 1}][checklist_item_id]`,
        id
      );

      if (item.status === "good") {
        status = "1";
      } else if (item.status === "faulty") {
        status = "0";
      }
      
      formData.append(
        `checklist[${index + 1}][status]`,
        status
      );

      formData.append(
        `checklist[${index + 1}][remarks]`,
        item.remarks ?? ""
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

  //SendIn
  if (params.sendInBy) {
    formData.append("send_in_by_name", params.sendInBy);
  }
  
  if (params.signatureSendInBy) {
    formData.append("send_in_signature", {
      uri: params.signatureSendInBy.uri,
      name: params.signatureSendInBy.name,
      type: params.signatureSendInBy.type,
    } as any);
  }
  if (params.checkedReceivedBy) {
    formData.append("checked_received_by_name", params.checkedReceivedBy);
  }
  if (params.signatureCheckedReceivedBy) {
    formData.append("checked_received_signature", {
      uri: params.signatureCheckedReceivedBy.uri,
      name: params.signatureCheckedReceivedBy.name,
      type: params.signatureCheckedReceivedBy.type,
    } as any);
  }

  //Return
  if (params.checkedAcceptedBy) {
    formData.append("checked_accepted_by_name", params.checkedAcceptedBy);
  } 
  if (params.signatureCheckedAcceptedBy) {
    formData.append("checked_accepted_signature", {
      uri: params.signatureCheckedAcceptedBy.uri,
      name: params.signatureCheckedAcceptedBy.name,
      type: params.signatureCheckedAcceptedBy.type,
    } as any);
  }

  if (params.mechanic) {
    formData.append("mechanic_name", params.mechanic);
  }
  if (params.signatureMechanic) {
    formData.append("mechanic_signature", {
      uri: params.signatureMechanic.uri,
      name: params.signatureMechanic.name,
      type: params.signatureMechanic.type,
    } as any);
  } 

  if (params.foreman) {
    formData.append("foreman_name", params.foreman);
  }
  if (params.signatureForeman) {
    formData.append("foreman_signature", {
      uri: params.signatureForeman.uri,
      name: params.signatureForeman.name,
      type: params.signatureForeman.type,
    } as any);
  }

  return formData;
};