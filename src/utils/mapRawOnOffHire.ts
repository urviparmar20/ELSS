export function mapRawOnOffHire(raw: any) {
  if (!raw) return null;
  
  return {
    // ---------- BASIC INFO ----------
    companyId: null,
    companyName: raw.company_name || "",
    address: raw.company_address || "",
    location: raw.location || "",

    contactPerson: raw.on_hire?.contact_person_name || "",
    contactNo: raw.on_hire?.contact_no,

    equipmentTypeName: raw.equipment_type || "",
    equipmentTypeId: raw.equipment_type_id || "",

    equipmentName: raw.equipment_name || "",
    equipmentId: String(raw.equipment_id ?? ""),

    date: raw.on_hire?.date,
    mcSerialNo: raw.serial_no || "",
    hourMeter: raw.on_hire?.hr_meter || "",
    services: raw.on_hire?.condition_list || "",
    checklist: flattenChecklist(raw.on_hire?.job_list) || "",
    images: (raw.on_hire?.images || []).map((url: string, index: number) => ({
      uri: url,
      name: `existing_${index}.jpg`,
      type: "image/jpeg",
      isExisting: true, 
    })),
    remarks: raw.on_hire?.remarks || "",
    serviceTechnician: raw.on_hire?.technician || "",
    signature_technician: raw.on_hire?.signature_technician || "",
    acceptedBy: raw.on_hire?.accepted_by || "",
    signature_accepted_by: raw.on_hire?.signature_accepted_by || "",
    nRIC: raw.on_hire?.work_permit || "",
    contractorName: raw.on_hire?.contractor_name || ""
    
  };
}

function flattenChecklist(jobList?: any[] | null): ChecklistItem[] {
  if (!Array.isArray(jobList)) return [];

  return jobList.map(item => ({
    description: item.description,
    check: item.check === "true",
    remarks: item.remarks ?? "",
  }));
}


