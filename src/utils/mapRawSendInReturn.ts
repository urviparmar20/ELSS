export function mapRawSendInReturn(raw: any) {
  if (!raw) return null;

  
  return {
    // ---------- BASIC INFO ----------
    equipmentTypeName: raw.equipment_type || "",
    equipmentTypeId: raw.equipment_type_id || "",

    equipmentName: raw.equipment_name || "",
    equipmentId: String(raw.equipment_id ?? ""),

    brand: raw.brand || "",
    modelNo: raw.model || "",
    mcSerialNo: raw.serial_no || "",
    hourMeter: raw.send_in?.hour_meter || "",

    date: raw.send_in?.date || "",
    time: raw.send_in?.time || "",

    checklistValues: raw.send_in?.checklist || "",

    images: (raw.send_in?.images || []).map((url: string, index: number) => ({
      uri: url,
      name: `existing_${index}.jpg`,
      type: "image/jpeg",
      isExisting: true, 
    })),
    
    comments: raw.send_in?.complaints || "",

    sendIn: raw.send_in?.send_in_by_name || "",
    sendInSignature: raw.send_in?.send_in_signature || "",

    receivedBy: raw.send_in?.checked_received_by_name || "",
    receivedbySignature: raw.send_in?.checked_received_signature || "",

    // acceptedBy: raw.on_hire?.accepted_by || "",
    // acceptedBySignature: raw.on_hire?.signature_accepted_by || "",

    // mechanic: raw.on_hire?.accepted_by || "",
    // receivedbySignature: raw.on_hire?.signature_accepted_by || "",

    // receivedBy: raw.on_hire?.accepted_by || "",
    // receivedbySignature: raw.on_hire?.signature_accepted_by || "",
   
    
  };
}


